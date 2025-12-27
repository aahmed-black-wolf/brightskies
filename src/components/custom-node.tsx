import React from "react";
import { Handle, Position, NodeProps, Edge } from "reactflow";

interface CustomNodeData {
  label: string;
  type: string;
  status: "idle" | "running" | "completed" | "error";
  edges?: Edge[];
}

export const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({
  data,
  id,
}) => {
  const getStatusColor = () => {
    switch (data.status) {
      case "running":
        return "#4a90e2";
      case "completed":
        return "#52c41a";
      case "error":
        return "#ff4d4f";
      default:
        return "#d9d9d9";
    }
  };

  const getStatusClasses = () => {
    switch (data.status) {
      case "running":
        return "bg-blue-50 text-blue-500";
      case "completed":
        return "bg-green-50 text-green-600";
      case "error":
        return "bg-red-50 text-red-500";
      default:
        return "";
    }
  };

  // Check if input handle (target) is already connected
  const isInputConnected = () => {
    if (!data.edges) return false;
    return data.edges.some(
      (edge) => edge.target === id && edge.targetHandle === "input"
    );
  };

  // Check if output handle (source) is already connected
  const isOutputConnected = () => {
    if (!data.edges) return false;
    return data.edges.some(
      (edge) => edge.source === id && edge.sourceHandle === "output"
    );
  };

  return (
    <div
      className="px-4 py-2.5 bg-white border-2 rounded-lg min-w-[150px] shadow-sm transition-all duration-200 hover:shadow-md"
      style={{ borderColor: getStatusColor() }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ background: "#555" }}
        isConnectable={!isInputConnected()}
      />
      <div className="flex flex-col gap-1">
        <div className="text-[10px] text-gray-600 uppercase font-semibold tracking-wider">
          {data.type}
        </div>
        <div className="text-sm font-medium text-gray-800">{data.label}</div>
        {data.status !== "idle" && (
          <div
            className={`text-xs mt-1 px-1.5 py-0.5 rounded inline-block w-fit ${getStatusClasses()}`}
          >
            {data.status === "running" && "Running..."}
            {data.status === "completed" && "✓"}
            {data.status === "error" && "✗"}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ background: "#555" }}
        isConnectable={!isOutputConnected()}
      />
    </div>
  );
};
