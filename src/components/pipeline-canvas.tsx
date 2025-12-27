import React, { useCallback, useMemo, useRef } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  Connection,
  MarkerType,
  ReactFlowInstance,
  ConnectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import { TPipelineNode, TPipelineEdge } from "../types";
import { CustomNode } from "./custom-node";

const nodeTypes = {
  custom: CustomNode,
};

interface PipelineCanvasProps {
  nodes: TPipelineNode[];
  edges: TPipelineEdge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
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

  // Convert PipelineEdges to React Flow Edges
  const reactFlowEdges: Edge[] = useMemo(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || "output",
        targetHandle: edge.targetHandle || "input",
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { strokeWidth: 2 },
      })),
    [edges]
  );

  // Convert PipelineNodes to React Flow Nodes
  const reactFlowNodes: Node[] = useMemo(
    () =>
      nodes.map((node) => ({
        id: node.id,
        type: "custom",
        position: node.position,
        data: {
          label: node.name,
          type: node.type,
          status: node.data?.status || "idle",
          edges: reactFlowEdges,
        },
      })),
    [nodes, reactFlowEdges]
  );

  // Handle node changes (position updates)
  const handleNodesChange = useCallback(
    (changes: any) => {
      const updatedNodes = reactFlowNodes.map((node) => {
        const change = changes.find((c: any) => c.id === node.id);
        if (change && change.type === "position" && change.position) {
          return { ...node, position: change.position };
        }
        return node;
      });
      onNodesChange(updatedNodes);
    },
    [reactFlowNodes, onNodesChange]
  );

  // Handle edge changes
  const handleEdgesChange = useCallback(
    (changes: any) => {
      // React Flow handles edge changes internally, we just need to sync
      const updatedEdges = reactFlowEdges.map((edge) => {
        const change = changes.find((c: any) => c.id === edge.id);
        if (change) {
          return { ...edge, ...change };
        }
        return edge;
      });
      onEdgesChange(updatedEdges);
    },
    [reactFlowEdges, onEdgesChange]
  );

  // Handle new connections
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      onConnect(connection);
    },
    [onConnect]
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
          // Use ReactFlow's screenToFlowPosition for accurate coordinate conversion
          position = reactFlowInstance.current.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });
        } else {
          // Fallback: calculate relative to the ReactFlow container
          const reactFlowBounds = (event.target as Element)
            .closest(".react-flow")
            ?.getBoundingClientRect();
          if (reactFlowBounds) {
            position = {
              x: event.clientX - reactFlowBounds.left - 50,
              y: event.clientY - reactFlowBounds.top - 50,
            };
          }
        }

        // Call the parent handler immediately to update state
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
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onInit={onInit}
        connectionMode={ConnectionMode.Loose}
        nodeTypes={nodeTypes}
        fitView
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
