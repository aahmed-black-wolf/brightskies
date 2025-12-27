import { TNodeType } from "../types";

const API_BASE_URL = "";

export async function fetchNodeTypes(): Promise<TNodeType[]> {
  const response = await fetch(`${API_BASE_URL}/api/nodes`);

  if (!response.ok) {
    throw new Error(`Failed to fetch node types: ${response.statusText}`);
  }

  return response.json();
}
