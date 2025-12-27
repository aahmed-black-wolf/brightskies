import { describe, it, expect } from "vitest";
import {
  isValidConnection,
  getExecutionOrder,
  simulateNodeExecution,
} from "./pipeline";
import { TPipelineEdge, TPipelineNode } from "../types";

describe("pipeline utilities", () => {
  describe("isValidConnection", () => {
    it("should reject self-loops", () => {
      const edges: TPipelineEdge[] = [];
      expect(isValidConnection("node1", "node1", edges)).toBe(false);
    });

    it("should accept valid connections", () => {
      const edges: TPipelineEdge[] = [];
      expect(isValidConnection("node1", "node2", edges)).toBe(true);
    });

    it("should reject connections that create cycles", () => {
      const edges: TPipelineEdge[] = [
        { id: "e1", source: "node2", target: "node1" },
      ];
      // node1 -> node2 -> node1 would create a cycle
      expect(isValidConnection("node1", "node2", edges)).toBe(false);
    });

    it("should accept connections in a linear chain", () => {
      const edges: TPipelineEdge[] = [
        { id: "e1", source: "node1", target: "node2" },
      ];
      // node2 -> node3 is valid (linear chain)
      expect(isValidConnection("node2", "node3", edges)).toBe(true);
    });
  });

  describe("getExecutionOrder", () => {
    it("should return nodes in topological order", () => {
      const nodes: TPipelineNode[] = [
        {
          id: "node1",
          type: "Data Source",
          name: "Source",
          position: { x: 0, y: 0 },
        },
        {
          id: "node2",
          type: "Transformer",
          name: "Transform",
          position: { x: 0, y: 0 },
        },
        { id: "node3", type: "Sink", name: "Sink", position: { x: 0, y: 0 } },
      ];
      const edges: TPipelineEdge[] = [
        { id: "e1", source: "node1", target: "node2" },
        { id: "e2", source: "node2", target: "node3" },
      ];

      const order = getExecutionOrder(nodes, edges);
      expect(order).toEqual(["node1", "node2", "node3"]);
    });

    it("should handle multiple sources", () => {
      const nodes: TPipelineNode[] = [
        {
          id: "node1",
          type: "Data Source",
          name: "Source1",
          position: { x: 0, y: 0 },
        },
        {
          id: "node2",
          type: "Data Source",
          name: "Source2",
          position: { x: 0, y: 0 },
        },
        { id: "node3", type: "Sink", name: "Sink", position: { x: 0, y: 0 } },
      ];
      const edges: TPipelineEdge[] = [
        { id: "e1", source: "node1", target: "node3" },
        { id: "e2", source: "node2", target: "node3" },
      ];

      const order = getExecutionOrder(nodes, edges);
      expect(order).toContain("node1");
      expect(order).toContain("node2");
      expect(order[order.length - 1]).toBe("node3");
    });

    it("should throw error for cycles", () => {
      const nodes: TPipelineNode[] = [
        {
          id: "node1",
          type: "Data Source",
          name: "Source",
          position: { x: 0, y: 0 },
        },
        {
          id: "node2",
          type: "Transformer",
          name: "Transform",
          position: { x: 0, y: 0 },
        },
      ];
      const edges: TPipelineEdge[] = [
        { id: "e1", source: "node1", target: "node2" },
        { id: "e2", source: "node2", target: "node1" },
      ];

      expect(() => getExecutionOrder(nodes, edges)).toThrow();
    });
  });

  describe("simulateNodeExecution", () => {
    it("should generate correct log for Data Source", () => {
      const log = simulateNodeExecution("node1", "Input Data", "Data Source");
      expect(log.nodeId).toBe("node1");
      expect(log.nodeName).toBe("Input Data");
      expect(log.message).toContain("Data Source");
      expect(log.message).toContain("processed 100 records");
    });

    it("should generate correct log for Transformer", () => {
      const log = simulateNodeExecution(
        "node2",
        "Feature Scaling",
        "Transformer"
      );
      expect(log.message).toContain("Transformer");
      expect(log.message).toContain("applied transformation");
    });

    it("should generate correct log for Model", () => {
      const log = simulateNodeExecution("node3", "Predictor", "Model");
      expect(log.message).toContain("Model");
      expect(log.message).toContain("generated predictions");
    });

    it("should generate correct log for Sink", () => {
      const log = simulateNodeExecution("node4", "Database", "Sink");
      expect(log.message).toContain("Sink");
      expect(log.message).toContain("saved results");
    });
  });
});
