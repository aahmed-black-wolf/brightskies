import { TNodeType } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/nodes";

export async function fetchNodeTypes(): Promise<TNodeType[]> {
  if (!API_BASE_URL) {
    throw new Error(
      "API_BASE_URL is not configured. Please set VITE_API_BASE_URL in your .env file."
    );
  }
  const response = await fetch(`${API_BASE_URL}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch node types: ${response.statusText}`);
  }

  return response.json();
}
