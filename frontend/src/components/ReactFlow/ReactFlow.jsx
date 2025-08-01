import {
  Background,
  Controls,
  ReactFlow as ReactFlowOriginal,
} from "@xyflow/react";
import { FloatingEdge } from "./FloatingEdge";
import { FloatingConnectionLine } from "./FloatingConnectionLine";
import "./react-flow.css";

/**
 * @typedef {import('@xyflow/react').ReactFlowProps} ReactFlowProps
 * @typedef {import('@xyflow/react').Node} Node
 * @typedef {import('@xyflow/react').Edge} Edge
 * @typedef {import('@xyflow/react').EdgeTypes} EdgeTypes
 * @typedef {import('@xyflow/react').ConnectionLineComponent} ConnectionLineComponent
 */

/**
 * Custom edge types for the ReactFlow component
 * @type {EdgeTypes}
 */
const edgeTypes = {
  floating: FloatingEdge,
};

/**
 * Custom ReactFlow component with floating edges and connection line
 * @param {ReactFlowProps} props - All props from the original ReactFlow component
 * @returns {JSX.Element} The ReactFlow component with custom edge types and connection line
 */
export const ReactFlow = ({ children, ...props }) => {
  return (
    <ReactFlowOriginal
      edgeTypes={edgeTypes}
      connectionLineComponent={FloatingConnectionLine}
      {...props}
    >
      {children}
    </ReactFlowOriginal>
  );
};
