import { TNodeType } from "../types";

// Use relative path to leverage Vite's proxy and avoid CORS issues
// Empty string means requests go to the same origin, which will use Vite's proxy in development
// The proxy is configured in vite.config.ts to forward /api requests to http://localhost:8000
const API_BASE_URL = "";

export async function fetchNodeTypes(): Promise<TNodeType[]> {
  const response = await fetch(`${API_BASE_URL}/api/nodes`);

  if (!response.ok) {
    throw new Error(`Failed to fetch node types: ${response.statusText}`);
  }

  return response.json();
}
