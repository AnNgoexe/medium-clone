export interface MonthlyHighInteractionStat {
  year: number;
  month: number;
  title: string;
  comments: number;
  likes: number;
  totalInteractions: number;
}

export interface HighInteractionArticleStatsResponse {
  articles: MonthlyHighInteractionStat[];
}
