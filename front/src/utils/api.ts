interface MediaSource {
  type: string;
  id: string;
}

interface MediaReader {
  type: string;
  id: string;
}

interface MediaPath {
  name: string;
  confName: string;
  source: MediaSource;
  ready: boolean;
  readyTime: string;
  tracks: string[];
  bytesReceived: number;
  bytesSent: number;
  readers: MediaReader[];
}

interface MediaPathsResponse {
  itemCount: number;
  pageCount: number;
  items: MediaPath[];
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`http://localhost:3000/${endpoint}`);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  },
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`http://localhost:3000/${endpoint}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return response.json();
  }
}

export async function getAnimals() {
  const response = await fetch('/api/animals')
  if (!response.ok) throw new Error('Failed to fetch animals')
  return response.json()
}

export async function addAnimal(animal: string) {
  const response = await fetch('/api/animals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ animal }),
  })
  if (!response.ok) throw new Error('Failed to add animal')
  return response.json()
}

export async function getMediaConnections(): Promise<MediaPathsResponse> {
  const response = await fetch('/media-api/paths/list')
  if (!response.ok) throw new Error('Failed to fetch media paths')
  return response.json()
}

