import React, { useCallback, useMemo, useRef } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  Connection,
  ReactFlowInstance,
  ConnectionMode,
  NodeChange,
  EdgeChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { CustomNode } from "./custom-node";

const nodeTypes = {
  custom: CustomNode,
};

interface PipelineCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeAdd: (
    nodeType: { id: string; name: string },
    position: { x: number; y: number }
  ) => void;
}

export const PipelineCanvas: React.FC<PipelineCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeAdd,
}) => {
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Inject current edges into node data so handles can check for connections
  const nodesWithEdges = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          edges: edges,
        },
      })),
    [nodes, edges]
  );

  // Handle drop from palette
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeTypeData = event.dataTransfer.getData("application/reactflow");
      if (!nodeTypeData) return;

      try {
        const nodeType = JSON.parse(nodeTypeData);

        // Calculate position relative to ReactFlow viewport
        let position = { x: 0, y: 0 };

        if (reactFlowInstance.current) {
          position = reactFlowInstance.current.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });
        }

        onNodeAdd(nodeType, position);
      } catch (error) {
        console.error("Failed to parse node type data:", error);
      }
    },
    [onNodeAdd]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  return (
    <div
      className="flex-1 h-full bg-gray-50"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <ReactFlow
        nodes={nodesWithEdges}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        connectionMode={ConnectionMode.Loose}
        nodeTypes={nodeTypes}
        nodesDraggable={true}
        nodesConnectable={true}
        snapToGrid={true}
        snapGrid={[20, 20]}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
