export interface SentenceMeta {
  index: number;
  paragraph_index: number;
  text: string;
  char_length: number;
}

export interface MatchInfo {
  source_index: number;
  target_index: number;
  source_text: string;
  target_text: string;
  semantic_similarity: number;
  lexical_similarity: number;
  classification: 'EXACT MATCH' | 'HIGH SIMILARITY' | 'POSSIBLE PARAPHRASE' | 'RELATED' | 'ORIGINAL';
  explanation: string;
}

export interface AnalysisMetrics {
  overall_similarity: number;
  exact_match_pct: number;
  high_similarity_pct: number;
  paraphrase_pct: number;
  related_pct: number;
  original_pct: number;
  total_sentences_a: number;
  total_sentences_b: number;
}

export interface AnalysisResults {
  id?: string;
  document_a_name: string;
  document_b_name: string;
  metrics: AnalysisMetrics;
  sentences_a: SentenceMeta[];
  sentences_b: SentenceMeta[];
  matches_a: MatchInfo[];
  suspicious_matches: MatchInfo[];
  similarity_matrix: number[][];
  analysis_summary: string;
}

export interface HistoryItem {
  id: string;
  doc_a_name: string;
  doc_b_name: string;
  created_at: string;
  overall_similarity: number;
  exact_match_pct: number;
  paraphrase_pct: number;
  original_pct: number;
}
