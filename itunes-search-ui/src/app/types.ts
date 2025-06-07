export type Podcast = {
  id: string;
  trackId: number;
  artistName: string;
  trackName: string;
  trackViewUrl: string;
  artworkUrl30: string;
  artworkUrl60: string;
  artworkUrl100: string;
  artworkUrl600: string;
  primaryGenre?: string;
  trackCount?: number;
  explicitness?: string;
};

export type FilterState = {
  genre: string | null;
  explicitness: string | null;
}; 