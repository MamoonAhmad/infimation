import { useReducer, useState } from "react";
// import "./App.css";
import { Background, Controls, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "./components/ui/dialog";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Plus } from "lucide-react";

function App() {

  const [{
    nodes, edges, ...state
  }, setState] = useReducer((p, c) => {
    return {
      ...p, ...c
    }
  }, { nodes: [], edges: [] });



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
    const nodesMap = nodes.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, []);
    edges.forEach(edge => {
      
    })
  }

  return (
    <>
      <div className="w-screen h-screen bg-gray-50">
        <ReactFlow nodes={nodes} edges={edges} onNodeClick={handleNodeclick}>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <Button
        className="absolute bottom-2 right-2 z-10"
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
