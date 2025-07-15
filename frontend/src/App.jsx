import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
// import "./App.css";
import { Background, Controls, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback } from "react";

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const getNewNode = () => {
    const id = new Date().getTime().toString();
    return {
      id,
      code: `console.log("Node Executed ${id}")`,
    };
  };

  const addNewNode = useCallback(
    (node) => {
      setNodes([
        ...nodes,
        {
          id: node.id,
          position: { x: 100, y: (nodes.length + 1) * 100 },
          data: { label: node.id },
        },
      ]);
      if (nodes.length) {
        setEdges([
          ...edges,
          {
            id: new Date().getTime().toString() + "1",
            source: nodes[nodes.length - 1].id,
            target: node.id,
          },
        ]);
      }
    },
    [nodes, edges]
  );

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
        <ReactFlow nodes={nodes} edges={edges}>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <button
        className="absolute bottom-2 right-2 z-10 bg-blue-300 text-blue-600 p-2 rounded-lg"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();

          const node = getNewNode();
          addNewNode(node);
        }}
      >
        Add Node
      </button>
    </>
  );
}

export default App;
