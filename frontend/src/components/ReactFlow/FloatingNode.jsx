import React from "react";
import { Handle } from "@xyflow/react";

export const FloatingNode = React.memo(({ data }) => {
  return (
    <div
      className={`border-2 ${
        data?.success !== undefined
          ? data.success
            ? "border-green-700"
            : "border-red-700"
          : "border-black"
      } rounded-lg p-2 bg-white relative !cursor-pointer px-5`}
    >
      {data.label}
      <Handle
        className={`!h-3 !w-3 ${
          data?.workflow_node_type === "workflow_run_node" ? "!opacity-0" : ""
        }`}
        type="target"
      />
      <Handle
        type="source"
        position="bottom"
        className={`!h-3 !w-3 ${
          data?.workflow_node_type === "workflow_run_node" ? "!opacity-0" : ""
        }`}
      />
    </div>
  );
});
