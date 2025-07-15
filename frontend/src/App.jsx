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
import { LoaderCircle, Plus, Save } from "lucide-react";

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

    // Build a quick lookup for edges by source
    const edgeMap = edges.reduce((acc, edge) => {
      acc[edge.source] = edge.target;
      return acc;
    }, {});

    // Build flow.nodes
    const flowNodes = nodes.map(node => {
      const nextId = edgeMap[node.id];
      return {
        id: node.id,
        type: "node",
        ...(nextId && {
          next: {
            id: nextId,
            type: "node"
          }
        })
      };
    });

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
      </div>

      {
        <Dialog open={!!state.nodeToEdit} onOpenChange={(open) => {
          if (!open) {
            setState({
              nodeToEdit: null,
              nodeToEditCode: null
            })
          }
        }}>



          <DialogContent>
            <DialogHeader>
              {state?.nodeToEdit?.data?.label}
            </DialogHeader>
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
            />
            <DialogFooter>
              <Button onClick={() => {
                setState({
                  nodeToEdit: undefined
                })
              }}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    </>
  );
}

export default App;
