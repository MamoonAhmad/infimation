import { useInternalNode, getBezierPath } from "@xyflow/react";
import { getEdgeParams } from "./ReactFlowHelpers";

/**
 * @typedef {import('@xyflow/react').EdgeProps} EdgeProps
 * @typedef {import('@xyflow/react').Node} Node
 * @typedef {import('@xyflow/react').Position} Position
 */

/**
 * Custom floating edge component that creates bezier paths between nodes
 * @param {EdgeProps} props - Edge properties
 * @param {string} props.id - Unique identifier for the edge
 * @param {string} props.source - Source node ID
 * @param {string} props.target - Target node ID
 * @param {string} [props.markerEnd] - SVG marker for the end of the edge
 * @param {React.CSSProperties} [props.style] - Custom styles for the edge
 * @returns {JSX.Element|null} The edge path element or null if nodes are not found
 */
export function FloatingEdge({ id, source, target, markerEnd, style }) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  );

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  return (
    <path
      id={id}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
      style={style}
    />
  );
}
