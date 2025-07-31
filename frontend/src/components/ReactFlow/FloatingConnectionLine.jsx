import { getBezierPath } from "@xyflow/react";
import { getEdgeParams } from "./ReactFlowHelpers";

/**
 * @typedef {import('@xyflow/react').ConnectionLineProps} ConnectionLineProps
 * @typedef {import('@xyflow/react').Node} Node
 * @typedef {import('@xyflow/react').Position} Position
 */

/**
 * Custom connection line component that shows a preview of the connection being created
 * @param {ConnectionLineProps} props - Connection line properties
 * @param {number} props.toX - X coordinate of the target position
 * @param {number} props.toY - Y coordinate of the target position
 * @param {Position} [props.fromPosition] - Position of the source node
 * @param {Position} [props.toPosition] - Position of the target node
 * @param {Node} [props.fromNode] - Source node for the connection
 * @returns {JSX.Element|null} The connection line element or null if no source node
 */
export function FloatingConnectionLine({
  toX,
  toY,
  fromPosition,
  toPosition,
  fromNode,
}) {
  if (!fromNode) {
    return null;
  }
 
  // Create a mock target node at the cursor position
  const targetNode = {
    id: 'connection-target',
    measured: {
      width: 1,
      height: 1,
    },
    internals: {
      positionAbsolute: { x: toX, y: toY },
    },
  };
 
  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    fromNode,
    targetNode,
  );
 
  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos || fromPosition,
    targetPosition: targetPos || toPosition,
    targetX: tx || toX,
    targetY: ty || toY,
  });
 
  return (
    <g>
      <path
        fill="none"
        stroke="#222"
        strokeWidth={1.5}
        className="animated"
        d={edgePath}
      />
      <circle
        cx={tx || toX}
        cy={ty || toY}
        fill="#fff"
        r={3}
        stroke="#222"
        strokeWidth={1.5}
      />
    </g>
  );
}
