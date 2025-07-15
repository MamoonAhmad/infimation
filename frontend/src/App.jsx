import { useReducer, useState } from "react";
// import "./App.css";
import { Background, Controls, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "./components/ui/dialog";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { LoaderCircle, Play, Plus, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

function App() {

  const [{
    nodes, edges, ...state
  }, setState] = useReducer((p, c) => {
    return {
      ...p, ...c
    }
  }, { nodes: [], edges: [] });

  // Load workflow from API on mount
  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        const res = await fetch("http://localhost:3002/workflow");
        if (!res.ok) return; // No workflow found
        const { flow, nodeMap } = await res.json();
        if (!flow || !flow.nodes) return;
        // Convert flow and nodeMap to nodes and edges for ReactFlow
        const loadedNodes = flow.nodes.map((node, idx) => ({
          id: node.id,
          position: { x: 100, y: (idx + 1) * 100 },
          data: {
            label: nodeMap[node.id]?.name || node.id,
            code: nodeMap[node.id]?.code || ""
          }
        }));
        const loadedEdges = flow.nodes
          .filter(node => node.next)
          .map(node => ({
            id: node.id + "-" + node.next.id,
            source: node.id,
            target: node.next.id
          }));
        setState({ nodes: loadedNodes, edges: loadedEdges });
      } catch (e) {
        // Ignore errors (e.g., no workflow file)
      }
    };
    loadWorkflow();
  }, []);


  const getNewNode = () => {
    const id = new Date().getTime().toString();
    return {
      id,
      code: `console.log("Node Executed ${id}")`,
    };
  };

  const addNewNode = useCallback(
    (node) => {
      setState({
        nodes: [
          ...nodes,
          {
            id: node.id,
            position: { x: 100, y: (nodes.length + 1) * 100 },
            data: { label: node.id },
          },
        ]
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
          ]
        });
      }
    },
    [nodes, edges]
  );

  const handleNodeclick = (o, node) => {
    console.log(o);
    console.log(node);
    setState({
      nodeToEdit: node,
      nodeToEditCode: node?.data?.code || "",
      nodeToEditName: node?.data?.label || ""
    })

  }

  const createWorkflow = () => {
    // Build nodeMap
    const nodeMap = nodes.reduce((acc, node) => {
      acc[node.id] = {
        name: node.data.label,
        code: node.data.code,
      };
      return acc;
    }, {});

    const edgeMap = {};
    const flowNodes = []
    edges.forEach(edge => {
      const sourceNodeID = edge.source;
      const targetNodeID = edge.target


      if (!edgeMap[sourceNodeID]) {
        const flowNode = {
          type: "node",
          id: sourceNodeID
        }
        edgeMap[sourceNodeID] = flowNode
        flowNodes.push(flowNode);
      }
      const flowNode = {
        type: "node",
        id: targetNodeID
      }
      edgeMap[sourceNodeID].next = flowNode
      edgeMap[targetNodeID] = flowNode
    })

    debugger
    const flow = {
      type: "flow",
      nodes: flowNodes
    };

    // Now you have both flow and nodeMap
    console.log({ flow, nodeMap });
    return { flow, nodeMap };
  }

  const saveWorkflow = async () => {
    const workflow = createWorkflow();
    setState({
      savingWorkflow: true
    })
    const res = await fetch("http://localhost:3002/workflow", {
      method: "POST",
      body: JSON.stringify(workflow),
      headers: {
        "Content-Type": "application/json"
      }
    });
    setState({
      savingWorkflow: false
    })
    const resJson = await res.json();
  }

  return (
    <>
      <div className="w-screen h-screen bg-gray-50">
        <ReactFlow nodes={nodes} edges={edges} onNodeClick={handleNodeclick}>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <div className="flex gap-2 absolute bottom-2 right-2 z-10">


        <Button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();

            const node = getNewNode();
            addNewNode(node);
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
          {
            state.savingWorkflow ? <LoaderCircle className="animate-spin" /> : <Save />
          }

          Save Workflow
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();

            (async () => {
              const res = fetch("http://localhost:3002/run-workflow", {
                method: "POST",
                body: JSON.stringify({}),
                headers: {
                  "Content-Type": "application/json"
                }
              });
              const resJSON = await res.json()
            })()
          }}
        >
          {
            state.savingWorkflow ? <LoaderCircle className="animate-spin" /> : <Save />
          }

          Run Workflow
        </Button>
      </div>

      {
        <Dialog open={!!state.nodeToEdit} onOpenChange={(open) => {
          if (!open) {
            setState({
              nodeToEdit: null,
              nodeToEditCode: null,
              runningNode: undefined,
              runNodeError: undefined,
              runNodeOutput: undefined
            })
          }
        }}>



          <DialogContent className={"h-[80vh] min-w-[80vw] flex flex-col justfy-start"}>
            <DialogHeader>
              {state?.nodeToEdit?.data?.label}
            </DialogHeader>
            <Tabs className={"grow"}>
              <TabsList defaultValue="info" className={"w-full"}>
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="run">Run</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className={"gap-2 flex flex-col pt-5"}>
                <Label>
                  Node Name
                </Label>
                <Input
                  value={state.nodeToEditName || ""}
                  onChange={e => {
                    setState({
                      nodeToEditName: e.target.value
                    })
                    state.nodeToEdit.data.label = e.target.value
                  }}
                />
                <Label>Code To Execute</Label>
                <Textarea
                  value={state.nodeToEditCode || ""}
                  onChange={e => {
                    setState({
                      nodeToEditCode: e.target.value
                    });
                    state.nodeToEdit.data.code = e.target.value
                  }}
                  className={"grow"}
                />
                <DialogFooter >
                  <Button onClick={() => {
                    setState({
                      nodeToEdit: undefined
                    })
                  }}>Save</Button>
                </DialogFooter>
              </TabsContent>
              <TabsContent value="run" className={"gap-2 flex flex-col pt-5"}>
                <div className="flex flex-col gap-2">
                  <Button
                    disabled={state.runningNode}
                    onClick={async () => {
                      setState({ runningNode: true, runNodeOutput: undefined, runNodeError: undefined });
                      try {
                        const res = await fetch("http://localhost:3002/run-node", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ nodeId: state.nodeToEdit.id })
                        });
                        const data = await res.json();
                        if (!res.ok) {
                          setState({ runNodeError: data.error, runningNode: false });
                        } else {
                          setState({ runNodeOutput: data.output, runningNode: false });
                        }
                      } catch (e) {
                        setState({ runNodeError: e.message, runningNode: false });
                      }
                    }}
                    className={"self-start"}
                  >
                    {state.runningNode ? <LoaderCircle className="animate-spin" /> : <Play />} Run Node
                  </Button>
                  {
                    state?.runningNode || state.runningNode === undefined ? null : <div className="mt-2 flex flex-col gap-3">
                      <Label>Node Output</Label>
                      {state.runNodeError ? (
                        <pre className="bg-red-100 text-red-800 p-2 rounded text-xs whitespace-pre-wrap">{JSON.stringify(state.runNodeError, null, 2)}</pre>
                      ) : state.runNodeOutput === undefined ? (

                        <pre className="bg-gray-100 text-gray-800 p-2 rounded text-xs">Node did not return any output.</pre>

                      ) : <pre className="bg-gray-100 text-gray-800 p-2 rounded text-xs whitespace-pre-wrap">{JSON.stringify(state.runNodeOutput, null, 2)}</pre>}

                    </div>
                  }
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
