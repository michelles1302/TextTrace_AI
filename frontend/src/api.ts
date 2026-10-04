import type { AnalysisResults, HistoryItem } from './types';

const API_BASE = 'http://localhost:8000/api';

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'healthy';
  } catch (err) {
    return false;
  }
}

export async function analyzeDocuments(
  fileA: File | null,
  textA: string,
  nameA: string,
  fileB: File | null,
  textB: string,
  nameB: string
): Promise<AnalysisResults> {
  const formData = new FormData();
  
  if (fileA) {
    formData.append('doc_a_file', fileA);
  } else if (textA) {
    formData.append('doc_a_text', textA);
    formData.append('doc_a_name', nameA || 'Document A');
  }

  if (fileB) {
    formData.append('doc_b_file', fileB);
  } else if (textB) {
    formData.append('doc_b_text', textB);
    formData.append('doc_b_name', nameB || 'Document B');
  }

  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(errData.detail || 'Analysis request failed.');
  }

  return response.json();
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  const response = await fetch(`${API_BASE}/history`);
  if (!response.ok) {
    throw new Error('Failed to load history');
  }
  return response.json();
}

export async function fetchAnalysisById(id: string): Promise<AnalysisResults> {
  const response = await fetch(`${API_BASE}/analysis/${id}`);
  if (!response.ok) {
    throw new Error('Failed to load analysis results');
  }
  return response.json();
}

export function getReportDownloadUrl(analysisId: string): string {
  return `${API_BASE}/report/${analysisId}`;
}
