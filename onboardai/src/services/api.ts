/**
 * API service for communicating with the FastAPI backend.
 * All calls go through the Vite proxy → http://localhost:8000
 */

const API_BASE = '/api';

// ── Upload ──────────────────────────────────────────────────
export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Upload failed');
  }

  return res.json() as Promise<{
    filename: string;
    chunks_stored: number;
    message: string;
  }>;
}

// ── Chat ────────────────────────────────────────────────────
export async function sendChatMessage(query: string, userId: string) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, user_id: userId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Chat request failed');
  }

  return res.json() as Promise<{
    answer: string;
    sources: { text: string; filename: string; chunk_id: string }[];
  }>;
}

export async function clearChatHistory(userId: string) {
  const res = await fetch(`${API_BASE}/chat/history/${userId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to clear history');
  }

  return res.json();
}

export async function getChatHistory(userId: string) {
  const res = await fetch(`${API_BASE}/chat/history/${userId}`);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to fetch history');
  }

  return res.json() as Promise<{ history: { role: string; parts: { text: string }[] }[] }>;
}

export async function getDocuments() {
  const res = await fetch(`${API_BASE}/documents`);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to fetch documents');
  }

  return res.json() as Promise<string[]>;
}

// ── Plan ────────────────────────────────────────────────────
export interface PlanDay {
  day: number;
  title: string;
  tasks: string[];
}

export async function generatePlan(role: string, experience: string, department: string = '') {
  const res = await fetch(`${API_BASE}/generate-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, experience, department }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Plan generation failed');
  }

  return res.json() as Promise<{ plan: PlanDay[] }>;
}

// ── Health ──────────────────────────────────────────────────
export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json() as Promise<{ status: string }>;
}
