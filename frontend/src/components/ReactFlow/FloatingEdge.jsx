import {
  useInternalNode,
  getBezierPath,
  useReactFlow,
  BaseEdge,
  EdgeLabelRenderer,
} from "@xyflow/react";
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

  const { setEdges } = useReactFlow();
  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  );

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        {targetNode?.data?.workflow_node_type !== "workflow_run_node" ? (
          <div
            className="absolute pointer-events-auto"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            <button
              className="bg-gray-50 border-2 border-black w-6 h-6 flex items-center justify-center p-2 rounded-full hover:bg-gray-300 cursor-pointer hover:border-red-600"
              onClick={onEdgeClick}
            >
              ×
            </button>
          </div>
        ) : null}
      </EdgeLabelRenderer>
    </>
  );
}
