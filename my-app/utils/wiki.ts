import { Place, PlaceDetail, Coordinate } from '../types';
import { getBearing } from './geo';
import { SEARCH_RADIUS } from '../constants/config';

  interface GeoSearchResult {
    pageid: number;
    title: string;
    lat: number;
    lon: number;
    dist: number;
  }
  interface GeoSearchResponse {
    query: { geosearch: GeoSearchResult[] };
  }
  interface ExtractResponse {
    query: {
      pages: Record<
        string,
        { pageid: number; title: string; extract?: string; thumbnail?: { source: string } }
      >;
    };
  }

  // Our existing fetchWikiPlaces function, but now it returns an array of `Place` objects with the bearing calculated, and it accepts an optional AbortSignal for cancellation. This will be useful to cancel the request if the user moves or changes location before the fetch completes.
  export async function fetchNearbyPlaces(
    userCoord: Coordinate,
    radius: number = SEARCH_RADIUS,
    signal?: AbortSignal
  ): Promise<Place[]> {
    const url =
      `https://en.wikipedia.org/w/api.php?action=query&list=geosearch` +
      `&gscoord=${userCoord.latitude}|${userCoord.longitude}` +
      `&gsradius=${radius}&gslimit=50&format=json&origin=*`;
    const res = await fetch(url, { signal });
    const data: GeoSearchResponse = await res.json();
    return data.query.geosearch.map((p) => ({
      id: p.pageid,
      title: p.title,
      lat: p.lat,
      lon: p.lon,
      dist: p.dist,
      bearing: getBearing(userCoord, { latitude: p.lat, longitude: p.lon }),
    }));
  }

  // Given a specific Place, thiscalls a different Wikipedia endpoint to get the short description (extract) and a thumbnail image and only runs when you're pointing at a specific building
  export async function fetchPlaceDetail(
    place: Place,
    signal?: AbortSignal
  ): Promise<PlaceDetail> {
    const url =
      `https://en.wikipedia.org/w/api.php?action=query&pageids=${place.id}` +
      `&prop=extracts|pageimages&exintro&explaintext&exsentences=3` +
      `&piprop=thumbnail&pithumbsize=300&format=json&origin=*`;
    const res = await fetch(url, { signal });
    const data: ExtractResponse = await res.json();
    const page = data.query.pages[String(place.id)];
    return {
      ...place,
      extract: page?.extract ?? 'No description available.',
      thumbnail: page?.thumbnail?.source,
    };
  }