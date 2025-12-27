export interface TNodeType {
  id: string;
  name: string;
}

export interface TPipelineNode {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  data?: {
    status?: "idle" | "running" | "completed" | "error";
    logs?: string[];
  };
}

export interface TPipelineEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface TExecutionLog {
  timestamp: number;
  nodeId: string;
  nodeName: string;
  message: string;
}
