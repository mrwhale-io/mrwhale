import { MappedScores } from "./scores/mapped-scores";

export interface ScoreResult {
  scores: MappedScores[];
  pages: number;
  total: number;
  offset: number;
}
