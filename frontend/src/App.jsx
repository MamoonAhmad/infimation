import {useReducer, useState} from "react";
// import "./App.css";
import {
  Background,
  Controls,
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {useCallback, useEffect} from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "./components/ui/dialog";
import {Label} from "./components/ui/label";
import {Textarea} from "./components/ui/textarea";
import {Button} from "./components/ui/button";
import {Input} from "./components/ui/input";
import {LoaderCircle, Play, Plus, Save} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "./components/ui/tabs";
import {Dialog as Modal} from "./components/ui/dialog";

function App() {
  const [{nodes, edges, ...state}, setState] = useReducer(
    (p, c) => {
      return {
        ...p,
        ...c,
      };
    },
    {nodes: [], edges: []}
  );

  // State for workflow run modal
  const [workflowRun, setWorkflowRun] = useState(null);
  const [workflowRunOpen, setWorkflowRunOpen] = useState(false);
  const [selectedRunNode, setSelectedRunNode] = useState(null);

  // Environment Variables State
  const [envModalOpen, setEnvModalOpen] = useState(false);
  const [envVars, setEnvVars] = useState("{}" );
  const [envVarsError, setEnvVarsError] = useState(null);
  const [savingEnvVars, setSavingEnvVars] = useState(false);

  // Node Templates State
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Node Settings State
  const [nodeTemplate, setNodeTemplate] = useState(null);
  const [loadingNodeTemplate, setLoadingNodeTemplate] = useState(false);

  // Load workflow from API on mount
  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        const res = await fetch("http://localhost:3002/workflow");
        if (!res.ok) return; // No workflow found
        const {flow, nodeMap} = await res.json();
        if (!flow || !flow.nodes) return;
        // Convert flow and nodeMap to nodes and edges for ReactFlow
        // Handle nested 'next' structure
        const loadedNodes = [];
        const loadedEdges = [];
        const visited = new Set();
        function traverse(node, idx) {
          if (!node || visited.has(node.id)) return;
          visited.add(node.id);
          const nodeData = nodeMap[node.id];
          loadedNodes.push({
            id: node.id,
            position: {x: 100, y: (loadedNodes.length + 1) * 100},
            data: {
              label: nodeData?.name || node.id,
              code: nodeData?.code || "",
              template_id: nodeData?.template_id,
              settings: nodeData?.settings || {},
            },
          });
          if (node.next && node.next.id) {
            loadedEdges.push({
              id: node.id + "-" + node.next.id,
              source: node.id,
              target: node.next.id,
            });
            traverse(node.next, idx + 1);
          }
        }
        // There may be multiple roots in flow.nodes (array)
        flow.nodes.forEach((node, idx) => traverse(node, idx));
        setState({nodes: loadedNodes, edges: loadedEdges});
      } catch {
        // Ignore errors (e.g., no workflow file)
      }
    };
    loadWorkflow();
  }, []);

  // Load environment variables on mount
  useEffect(() => {
    const loadEnvVars = async () => {
      try {
        const res = await fetch("http://localhost:3002/environment-variables");
        if (!res.ok) return;
        const data = await res.json();
        setEnvVars(JSON.stringify(data, null, 2));
      } catch {
        // Ignore errors
      }
    };
    loadEnvVars();
  }, []);

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const res = await fetch("http://localhost:3002/node-templates");
        if (res.ok) {
          const data = await res.json();
          setTemplates(data);
        }
      } catch {
        // Ignore errors
      } finally {
        setLoadingTemplates(false);
      }
    };
    loadTemplates();
  }, []);

  const addNewNode = useCallback(
    (node) => {
      setState({
        nodes: [
          ...nodes,
          {
            id: node.id,
            position: {x: 100, y: (nodes.length + 1) * 100},
            data: {label: node.name || node.id, code: node.code, template_id: node.template_id, settings: node.settings},
          },
        ],
      });
      if (nodes.length) {
        setState({
          edges: [
            ...edges,
            {
              id: new Date().getTime().toString() + "1",
              source: nodes[nodes.length - 1].id,
              target: node.id,
            },
          ],
        });
      }
    },
    [nodes, edges]
  );

  const createNodeFromTemplate = (template) => {
    const id = new Date().getTime().toString();
    const newNode = {
      id,
      name: template.name,
      template_id: template.id,
      settings: Object.keys(template.setting_schema).reduce((acc, key) => {
        acc[key] = "";
        return acc;
      }, {}),
      code: template.code
    };
    
    addNewNode(newNode);
    setTemplatesModalOpen(false);
  };

  const handleNodeclick = (__, node) => {
    setState({
      nodeToEdit: node,
      nodeToEditCode: node?.data?.code || "",
      nodeToEditName: node?.data?.label || "",
    });
    
    // Load template if node has template_id
    if (node?.data?.template_id) {
      loadNodeTemplate(node.data.template_id);
    } else {
      setNodeTemplate(null);
    }
  };

  const loadNodeTemplate = async (templateId) => {
    setLoadingNodeTemplate(true);
    try {
      const res = await fetch(`http://localhost:3002/node-templates/${templateId}`);
      if (res.ok) {
        const template = await res.json();
        setNodeTemplate(template);
      }
    } catch {
      // Ignore errors
    } finally {
      setLoadingNodeTemplate(false);
    }
  };

  const createWorkflow = () => {
    // Build nodeMap
    const nodeMap = nodes.reduce((acc, node) => {
      acc[node.id] = {
        name: node.data.label,
        code: node.data.code,
        id: node.id,
        template_id: node.data.template_id,
        settings: node.data.settings || {},
      };
      return acc;
    }, {});

    const edgeMap = {};
    const flowNodes = [];
    edges.forEach((edge) => {
      const sourceNodeID = edge.source;
      const targetNodeID = edge.target;

      if (!edgeMap[sourceNodeID]) {
        const flowNode = {
          type: "node",
          id: sourceNodeID,
        };
        edgeMap[sourceNodeID] = flowNode;
        flowNodes.push(flowNode);
      }
      const flowNode = {
        type: "node",
        id: targetNodeID,
      };
      edgeMap[sourceNodeID].next = flowNode;
      edgeMap[targetNodeID] = flowNode;
    });

    const flow = {
      type: "flow",
      nodes: flowNodes,
    };

    // Now you have both flow and nodeMap
    console.log({flow, nodeMap});
    return {flow, nodeMap};
  };

  const saveWorkflow = async () => {
    const workflow = createWorkflow();
    setState({
      savingWorkflow: true,
    });
    await fetch("http://localhost:3002/workflow", {
      method: "POST",
      body: JSON.stringify(workflow),
      headers: {
        "Content-Type": "application/json",
      },
    });
    setState({
      savingWorkflow: false,
    });
  };

  const saveEnvVars = async () => {
    setSavingEnvVars(true);
    setEnvVarsError(null);
    let parsed;
    try {
      parsed = JSON.parse(envVars);
    } catch {
      setEnvVarsError("Invalid JSON");
      setSavingEnvVars(false);
      return;
    }
    try {
      const response = await fetch("http://localhost:3002/environment-variables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (!response.ok) {
        setEnvVarsError("Failed to save environment variables");
      } else {
        setEnvVarsError(null);
        setEnvModalOpen(false);
      }
    } catch (err) {
      setEnvVarsError(err.message);
    }
    setSavingEnvVars(false);
  };

  // Handler for running the workflow
  const runWorkflow = async () => {
    setState({runningWorkflow: true});
    try {
      const res = await fetch("http://localhost:3002/run-workflow", {
        method: "POST",
        body: JSON.stringify({}),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const resJSON = await res.json();
      setWorkflowRun(resJSON);
      setWorkflowRunOpen(true);
    } catch (e) {
      setWorkflowRun({error: e.message});
      setWorkflowRunOpen(true);
    } finally {
      setState({runningWorkflow: false});
    }
  };

  return (
    <>
      <div className="w-screen h-screen bg-gray-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={handleNodeclick}
          onEdgesChange={(s) => {
            setState({
              edges: applyEdgeChanges(s, edges),
            });
          }}
          onNodesChange={(n) => {
            setState({
              nodes: applyNodeChanges(n, nodes),
            });
          }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <div className="flex gap-2 absolute bottom-2 right-2 z-10">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();

            setEnvModalOpen(true);
          }}
        >
          <Plus />
          Environment Variables
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();

            setTemplatesModalOpen(true);
          }}
        >
          <Plus />
          Add Node
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();

            saveWorkflow();
          }}
        >
          {state.savingWorkflow ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Save />
          )}
          Save Workflow
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();

            runWorkflow();
          }}
        >
          {state.runningWorkflow ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Play />
          )}
          Run Workflow
        </Button>
      </div>

      {/* Environment Variables Modal */}
      <Modal open={envModalOpen} onOpenChange={setEnvModalOpen}>
        <DialogContent className="min-w-[500px] flex flex-col gap-4">
          <DialogHeader>
            <h2 className="text-lg font-bold">Environment Variables</h2>
          </DialogHeader>
          <Label htmlFor="env-json">Key-Value Pairs (JSON)</Label>
          <Textarea
            id="env-json"
            className="font-mono min-h-[200px]"
            value={envVars}
            onChange={e => setEnvVars(e.target.value)}
          />
          {envVarsError && (
            <div className="text-red-600 text-xs">{envVarsError}</div>
          )}
          <DialogFooter>
            <Button onClick={saveEnvVars} disabled={savingEnvVars}>
              {savingEnvVars ? <LoaderCircle className="animate-spin" /> : <Save />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Modal>

      {/* Workflow Run Modal */}
      <Modal open={workflowRunOpen} onOpenChange={setWorkflowRunOpen}>
        <DialogContent className="h-[80vh] min-w-[80vw] flex flex-col justify-start">
          <DialogHeader>
            <h2 className="text-xl font-bold">Workflow Run</h2>
          </DialogHeader>
          <div className="flex flex-col gap-4 grow">
            <ReactFlow
              nodes={nodes.map((n) => {
                let style = {};
                if (workflowRun?.nodeOutputs?.[n.id]?.error) {
                  style = {border: "2px solid red", background: "#ffe5e5"};
                } else if (workflowRun?.nodeOutputs?.[n.id]) {
                  style = {border: "2px solid #4ade80", background: "#f0fdf4"};
                }
                return {
                  ...n,
                  style,
                };
              })}
              edges={edges}
              onNodeClick={(_, node) => setSelectedRunNode(node)}
              fitView
            >
              <Background />
              <Controls />
            </ReactFlow>
            {selectedRunNode && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">
                  Node Output: {selectedRunNode.data.label}
                </h3>
                {workflowRun?.nodeOutputs?.[selectedRunNode.id] ===
                undefined ? (
                  <pre className="bg-red-100 text-red-800 p-2 rounded text-xs whitespace-pre-wrap">
                    Node did not run.
                  </pre>
                ) : workflowRun?.nodeOutputs?.[selectedRunNode.id]?.error ? (
                  <pre className="bg-red-100 text-red-800 p-2 rounded text-xs whitespace-pre-wrap">
                    {JSON.stringify(
                      workflowRun.nodeOutputs[selectedRunNode.id].error,
                      null,
                      2
                    )}
                  </pre>
                ) : (
                  <pre className="bg-gray-100 text-gray-800 p-2 rounded text-xs whitespace-pre-wrap max-h-64 overflow-auto">
                    {workflowRun?.nodeOutputs?.[selectedRunNode.id]?.output ===
                      undefined ||
                    workflowRun?.nodeOutputs?.[selectedRunNode.id]?.output ===
                      null
                      ? "Node did not return any output."
                      : JSON.stringify(
                          workflowRun.nodeOutputs[selectedRunNode.id].output,
                          null,
                          2
                        )}
                  </pre>
                )}
              </div>
            )}
            {workflowRun?.error && (
              <div className="mt-4">
                <pre className="bg-red-100 text-red-800 p-2 rounded text-xs whitespace-pre-wrap">
                  {JSON.stringify(workflowRun.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Modal>

      {/* Node Templates Modal */}
      <Modal open={templatesModalOpen} onOpenChange={setTemplatesModalOpen}>
        <DialogContent className="min-w-[500px] flex flex-col gap-4">
          <DialogHeader>
            <h2 className="text-lg font-bold">Select Node Template</h2>
          </DialogHeader>
          {loadingTemplates ? (
            <div className="text-center py-8">
              <LoaderCircle className="animate-spin" />
              <p>Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <p>No node templates found. Please add one in the backend.</p>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  onClick={() => createNodeFromTemplate(template)}
                  className="flex items-center justify-start gap-2"
                >
                  <Play />
                  {template.name}
                </Button>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setTemplatesModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Modal>

      {
        <Dialog
          open={!!state.nodeToEdit}
          onOpenChange={(open) => {
            if (!open) {
              setState({
                nodeToEdit: null,
                nodeToEditCode: null,
                runningNode: undefined,
                runNodeError: undefined,
                runNodeOutput: undefined,
              });
            }
          }}
        >
          <DialogContent
            className={"h-[80vh] min-w-[80vw] flex flex-col justfy-start"}
          >
            <DialogHeader>{state?.nodeToEdit?.data?.label}</DialogHeader>
            <Tabs className={"grow"}>
              <TabsList defaultValue="info" className={"w-full"}>
                <TabsTrigger value="info">Info</TabsTrigger>
                {state.nodeToEdit?.data?.template_id && (
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                )}
                <TabsTrigger value="run">Run</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className={"gap-2 flex flex-col pt-5"}>
                <Label>Node Name</Label>
                <Input
                  value={state.nodeToEditName || ""}
                  onChange={(e) => {
                    setState({
                      nodeToEditName: e.target.value,
                    });
                    state.nodeToEdit.data.label = e.target.value;
                  }}
                />
                <Label>Code To Execute</Label>
                <Textarea
                  value={state.nodeToEditCode || ""}
                  onChange={(e) => {
                    setState({
                      nodeToEditCode: e.target.value,
                    });
                    state.nodeToEdit.data.code = e.target.value;
                  }}
                  className={"grow"}
                />
                <DialogFooter>
                  <Button
                    onClick={() => {
                      setState({
                        nodeToEdit: undefined,
                      });
                    }}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </TabsContent>
              {state.nodeToEdit?.data?.template_id && (
                <TabsContent value="settings" className={"gap-2 flex flex-col pt-5"}>
                  {loadingNodeTemplate ? (
                    <div className="text-center py-8">
                      <LoaderCircle className="animate-spin" />
                      <p>Loading template settings...</p>
                    </div>
                  ) : nodeTemplate ? (
                    <div className="flex flex-col gap-4">
                      <Label>Template Settings</Label>
                      {Object.entries(nodeTemplate.setting_schema).map(([key, schema]) => (
                        <div key={key} className="flex flex-col gap-2">
                          <Label htmlFor={`setting-${key}`}>{schema.label}</Label>
                          <Input
                            id={`setting-${key}`}
                            type={schema.type === "number" ? "number" : "text"}
                            value={state.nodeToEdit?.data?.settings?.[key] || ""}
                            onChange={(e) => {
                              const newSettings = {
                                ...state.nodeToEdit.data.settings,
                                [key]: e.target.value
                              };
                              state.nodeToEdit.data.settings = newSettings;
                              setState({
                                nodeToEdit: { ...state.nodeToEdit }
                              });
                            }}
                          />
                        </div>
                      ))}
                      <DialogFooter>
                        <Button
                          onClick={() => {
                            setState({
                              nodeToEdit: undefined,
                            });
                          }}
                        >
                          Save
                        </Button>
                      </DialogFooter>
                    </div>
                  ) : (
                    <p>Failed to load template settings.</p>
                  )}
                </TabsContent>
              )}
              <TabsContent value="run" className={"gap-2 flex flex-col pt-5"}>
                <div className="flex flex-col gap-2">
                  <Button
                    disabled={state.runningNode}
                    onClick={async () => {
                      setState({
                        runningNode: true,
                        runNodeOutput: undefined,
                        runNodeError: undefined,
                      });
                      try {
                        const res = await fetch(
                          "http://localhost:3002/run-node",
                          {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({nodeId: state.nodeToEdit.id}),
                          }
                        );
                        const data = await res.json();
                        if (!res.ok) {
                          setState({
                            runNodeError: data.error,
                            runningNode: false,
                          });
                        } else {
                          setState({
                            runNodeOutput: data.output,
                            runningNode: false,
                          });
                        }
                      } catch (e) {
                        setState({runNodeError: e.message, runningNode: false});
                      }
                    }}
                    className={"self-start"}
                  >
                    {state.runningNode ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <Play />
                    )}{" "}
                    Run Node
                  </Button>
                  {state?.runningNode ||
                  state.runningNode === undefined ? null : (
                    <div className="mt-2 flex flex-col gap-3">
                      <Label>Node Output</Label>
                      {state.runNodeError ? (
                        <pre className="bg-red-100 text-red-800 p-2 rounded text-xs whitespace-pre-wrap">
                          {JSON.stringify(state.runNodeError, null, 2)}
                        </pre>
                      ) : state.runNodeOutput === undefined ? (
                        <pre className="bg-gray-100 text-gray-800 p-2 rounded text-xs">
                          Node did not return any output.
                        </pre>
                      ) : (
                        <pre className="bg-gray-100 text-gray-800 p-2 rounded text-xs whitespace-pre-wrap">
                          {JSON.stringify(state.runNodeOutput, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      }
    </>
  );
}

export default App;
