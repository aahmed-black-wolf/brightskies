import React, { useState, useCallback } from "react";
import { Node, Edge, Connection } from "reactflow";
import { useQuery } from "@tanstack/react-query";
import {
  TNodeType,
  TPipelineNode,
  TPipelineEdge,
  TExecutionLog,
} from "./types";
import { fetchNodeTypes } from "./utils/api";
import {
  isValidConnection,
  getExecutionOrder,
  simulateNodeExecution,
} from "./utils/pipeline";
import { NodePalette } from "./components/node-palette";
import { PipelineCanvas } from "./components/pipeline-canvas";
import { ExecutionLog } from "./components/execution-log";

let nodeIdCounter = 0;
let edgeIdCounter = 0;

function App() {
  const {
    data: nodeTypes = [],
    isLoading: isLoadingNodes,
    error: nodesError,
  } = useQuery<TNodeType[]>({
    queryKey: ["nodeTypes"],
    queryFn: fetchNodeTypes,
  });

  const [nodes, setNodes] = useState<TPipelineNode[]>([]);
  const [edges, setEdges] = useState<TPipelineEdge[]>([]);
  const [logs, setLogs] = useState<TExecutionLog[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Handle drag start from palette
  const handleDragStart = useCallback(
    (event: React.DragEvent, nodeType: TNodeType) => {
      event.dataTransfer.setData(
        "application/reactflow",
        JSON.stringify(nodeType)
      );
      event.dataTransfer.effectAllowed = "move";
    },
    []
  );

  // Handle node addition
  const handleNodeAdd = useCallback(
    (nodeType: TNodeType, position: { x: number; y: number }) => {
      const newNode: TPipelineNode = {
        id: `node-${++nodeIdCounter}`,
        type: nodeType.name,
        name: `${nodeType.name} ${nodeIdCounter}`,
        position,
        data: {
          status: "idle",
        },
      };
      // Use functional update for immediate state update
      setNodes((prev) => {
        // Check if node already exists to prevent duplicates
        if (prev.some((n) => n.id === newNode.id)) {
          return prev;
        }
        return [...prev, newNode];
      });
    },
    []
  );

  // Handle node changes (position updates)
  const handleNodesChange = useCallback((reactFlowNodes: Node[]) => {
    setNodes((prev) =>
      prev.map((node) => {
        const updated = reactFlowNodes.find((n) => n.id === node.id);
        if (updated) {
          return { ...node, position: updated.position };
        }
        return node;
      })
    );
  }, []);

  // Handle edge changes
  const handleEdgesChange = useCallback((reactFlowEdges: Edge[]) => {
    setEdges(
      reactFlowEdges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
      }))
    );
  }, []);

  // Handle new connections
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      // Validate connection before creating edge
      if (!isValidConnection(connection.source, connection.target, edges)) {
        alert("Invalid connection: This would create a cycle or self-loop.");
        return;
      }

      const newEdge: TPipelineEdge = {
        id: `edge-${++edgeIdCounter}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle || "output",
        targetHandle: connection.targetHandle || "input",
      };
      setEdges((prev) => [...prev, newEdge]);
    },
    [edges]
  );

  // Validate connection helper
  const validateConnection = useCallback(
    (sourceId: string, targetId: string) => {
      return isValidConnection(sourceId, targetId, edges);
    },
    [edges]
  );

  // Execute pipeline
  const handleExecute = useCallback(async () => {
    if (nodes.length === 0) {
      alert("Please add at least one node to the pipeline.");
      return;
    }

    setIsExecuting(true);
    setLogs([]);

    // Reset all node statuses
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        data: { ...node.data, status: "idle" as const },
      }))
    );

    try {
      // Get execution order
      const executionOrder = getExecutionOrder(nodes, edges);

      // Execute nodes in order
      for (let i = 0; i < executionOrder.length; i++) {
        const nodeId = executionOrder[i];
        const node = nodes.find((n) => n.id === nodeId);

        if (!node) continue;

        // Set node to running
        setNodes((prev) =>
          prev.map((n) =>
            n.id === nodeId
              ? { ...n, data: { ...n.data, status: "running" as const } }
              : n
          )
        );

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Generate log
        const log = simulateNodeExecution(node.id, node.name, node.type);
        setLogs((prev) => [...prev, log]);

        // Set node to completed
        setNodes((prev) =>
          prev.map((n) =>
            n.id === nodeId
              ? { ...n, data: { ...n.data, status: "completed" as const } }
              : n
          )
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Execution failed";
      setLogs((prev) => [
        ...prev,
        {
          timestamp: Date.now(),
          nodeId: "",
          nodeName: "System",
          message: `Error: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsExecuting(false);
    }
  }, [nodes, edges]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex flex-col gap-3 items-start px-6 py-4 bg-white border-b border-gray-300 shadow-sm md:flex-row md:justify-between md:items-center">
        <h1 className="text-2xl text-gray-800 m-0">AI Pipeline Editor</h1>
        <button
          className="w-full px-6 py-2.5 bg-blue-500 text-white border-none rounded text-base font-medium cursor-pointer transition-all duration-200 hover:bg-blue-600 hover:-translate-y-px hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          onClick={handleExecute}
          disabled={isExecuting || nodes.length === 0}
        >
          {isExecuting ? "Running..." : "Execute"}
        </button>
      </header>
      <div className="flex flex-1 overflow-hidden md:flex-row flex-col">
        <NodePalette
          nodeTypes={nodeTypes}
          isLoading={isLoadingNodes}
          error={
            nodesError instanceof Error
              ? nodesError.message
              : nodesError
              ? String(nodesError)
              : null
          }
          onDragStart={handleDragStart}
        />
        <PipelineCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onNodeAdd={handleNodeAdd}
          isValidConnection={validateConnection}
        />
        <ExecutionLog logs={logs} isExecuting={isExecuting} />
      </div>
    </div>
  );
}

export default App;
