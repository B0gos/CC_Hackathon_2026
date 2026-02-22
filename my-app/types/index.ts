export interface Coordinate {
    latitude: number;
    longitude: number;
  }

  export interface Place {
    id: number;
    title: string;
    lat: number;
    lon: number;
    dist: number;
    bearing: number;
  }

  export interface PlaceDetail extends Place {
    extract: string;
    thumbnail?: string;
  }