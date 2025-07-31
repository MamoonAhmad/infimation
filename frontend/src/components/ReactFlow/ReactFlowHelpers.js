// this helper function returns the intersection point

import { Position } from "@xyflow/react";

/**
 * @typedef {import('@xyflow/react').Node} Node
 * @typedef {import('@xyflow/react').Position} Position
 * @typedef {Object} IntersectionPoint
 * @property {number} x - X coordinate of the intersection point
 * @property {number} y - Y coordinate of the intersection point
 */

/**
 * Calculates the intersection point between two nodes
 * @param {Node} intersectionNode - The node to find intersection with
 * @param {Node} targetNode - The target node
 * @returns {IntersectionPoint} The intersection point coordinates
 */
function getNodeIntersection(intersectionNode, targetNode) {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const { width: intersectionNodeWidth, height: intersectionNodeHeight } =
    intersectionNode.measured;
  const intersectionNodePosition = intersectionNode.internals.positionAbsolute;
  const targetPosition = targetNode.internals.positionAbsolute;

  const w = intersectionNodeWidth / 2;
  const h = intersectionNodeHeight / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + targetNode.measured.width / 2;
  const y1 = targetPosition.y + targetNode.measured.height / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1));
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

/**
 * Determines the position of a node relative to an intersection point
 * @param {Node} node - The node to check position for
 * @param {IntersectionPoint} intersectionPoint - The intersection point
 * @returns {Position} The position (Top, Right, Bottom, or Left)
 */
function getEdgePosition(node, intersectionPoint) {
  const n = { ...node.internals.positionAbsolute, ...node };
  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + n.measured.width - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= n.y + n.measured.height - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}

/**
 * @typedef {Object} EdgeParams
 * @property {number} sx - Source X coordinate
 * @property {number} sy - Source Y coordinate
 * @property {number} tx - Target X coordinate
 * @property {number} ty - Target Y coordinate
 * @property {Position} sourcePos - Source position
 * @property {Position} targetPos - Target position
 */

/**
 * Calculates the parameters needed to create an edge between two nodes
 * @param {Node} source - The source node
 * @param {Node} target - The target node
 * @returns {EdgeParams} The edge parameters including coordinates and positions
 */
export function getEdgeParams(source, target) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}
