import { PipelineNode, PipelineEdge, ExecutionLog } from '../types';

/**
 * Validates if a connection is valid (no cycles, no self-loops)
 */
export function isValidConnection(
  sourceId: string,
  targetId: string,
  edges: PipelineEdge[]
): boolean {
  // Prevent self-loops
  if (sourceId === targetId) {
    return false;
  }

  // Check for cycles using DFS
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function hasCycle(nodeId: string): boolean {
    if (recStack.has(nodeId)) {
      return true;
    }
    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);
    recStack.add(nodeId);

    const outgoingEdges = edges.filter((e) => e.source === nodeId);
    for (const edge of outgoingEdges) {
      if (hasCycle(edge.target)) {
        return true;
      }
    }

    recStack.delete(nodeId);
    return false;
  }

  // Temporarily add the new edge to check for cycles
  const tempEdges = [...edges, { id: '', source: sourceId, target: targetId }];
  
  // Check if adding this edge creates a cycle
  const graph: Record<string, string[]> = {};
  tempEdges.forEach((edge) => {
    if (!graph[edge.source]) {
      graph[edge.source] = [];
    }
    graph[edge.source].push(edge.target);
  });

  visited.clear();
  recStack.clear();
  
  return !hasCycle(sourceId);
}

/**
 * Performs topological sort to determine execution order
 */
export function getExecutionOrder(
  nodes: PipelineNode[],
  edges: PipelineEdge[]
): string[] {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const inDegree: Record<string, number> = {};
  const graph: Record<string, string[]> = {};

  // Initialize in-degree and graph
  nodes.forEach((node) => {
    inDegree[node.id] = 0;
    graph[node.id] = [];
  });

  // Build graph and calculate in-degrees
  edges.forEach((edge) => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      graph[edge.source].push(edge.target);
      inDegree[edge.target]++;
    }
  });

  // Find all sources (nodes with in-degree 0)
  const queue: string[] = [];
  Object.keys(inDegree).forEach((nodeId) => {
    if (inDegree[nodeId] === 0) {
      queue.push(nodeId);
    }
  });

  const executionOrder: string[] = [];

  // Process nodes in topological order
  while (queue.length > 0) {
    const current = queue.shift()!;
    executionOrder.push(current);

    graph[current].forEach((neighbor) => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }

  // If we couldn't process all nodes, there's a cycle
  if (executionOrder.length !== nodes.length) {
    throw new Error('Pipeline contains cycles or disconnected nodes');
  }

  return executionOrder;
}

/**
 * Simulates node execution and generates logs
 */
export function simulateNodeExecution(
  nodeId: string,
  nodeName: string,
  nodeType: string
): ExecutionLog {
  const messages: Record<string, string> = {
    'Data Source': `Data Source "${nodeName}" processed 100 records`,
    'Transformer': `Transformer "${nodeName}" applied transformation`,
    'Model': `Model "${nodeName}" generated predictions`,
    'Sink': `Sink "${nodeName}" saved results`,
  };

  const message = messages[nodeType] || `Node "${nodeName}" executed`;

  return {
    timestamp: Date.now(),
    nodeId,
    nodeName,
    message,
  };
}

