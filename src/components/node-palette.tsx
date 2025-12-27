import React from "react";
import { TNodeType } from "../types";

interface NodePaletteProps {
  nodeTypes: TNodeType[];
  isLoading: boolean;
  error: string | null;
  onDragStart: (event: React.DragEvent, nodeType: TNodeType) => void;
}

export const NodePalette: React.FC<NodePaletteProps> = ({
  nodeTypes,
  isLoading,
  error,
  onDragStart,
}) => {
  if (isLoading) {
    return (
      <div className="w-full p-4 bg-gray-100 border-b border-gray-300 overflow-y-auto md:w-[200px] md:h-full md:border-b-0 md:border-r">
        <h2 className="m-0 mb-4 text-lg text-gray-800">Node Palette</h2>
        <div className="p-4 text-center text-gray-600">
          Loading node types...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-gray-100 border-b border-gray-300 overflow-y-auto md:w-[200px] md:h-full md:border-b-0 md:border-r">
        <h2 className="m-0 mb-4 text-lg text-gray-800">Node Palette</h2>
        <div className="p-4 text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-gray-100 border-b border-gray-300 overflow-y-auto md:w-[200px] md:h-full md:border-b-0 md:border-r">
      <h2 className="m-0 mb-4 text-lg text-gray-800">Node Palette</h2>
      <div className="flex flex-col gap-2">
        {nodeTypes.map((nodeType) => (
          <div
            key={nodeType.id}
            className="p-3 bg-white border-2 border-gray-300 rounded cursor-grab transition-all duration-200 select-none hover:border-blue-500 hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-sm active:cursor-grabbing"
            draggable
            onDragStart={(e) => onDragStart(e, nodeType)}
          >
            {nodeType.name}
          </div>
        ))}
      </div>
    </div>
  );
};
