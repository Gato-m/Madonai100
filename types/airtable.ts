export type AirtableRecord<T> = {
  id: string;
  createdTime: string;
  fields: T;
};

export type EventFields = {
  nosaukums: string;
  apraksts?: string;
  sākums?: string;
  beigas?: string;
  kategorija?: string;
  lokacija_lat?: number;
  lokacija_lng?: number;
  attēls?: { url: string }[];
  mākslinieks?: string[]; // linked record IDs
};

export type ArtistFields = {
  nosaukums: string;
  apraksts?: string;
  bilde?: { url: string }[];
  tips2?: string;
};

export type MarkerFields = {
  tips: string;
  nosaukums: string;
  apraksts?: string;
  lat: number;
  lng: number;
  ikona?: { url: string }[];
};
