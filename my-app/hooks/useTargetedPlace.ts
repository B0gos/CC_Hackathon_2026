import { useState, useEffect, useRef } from 'react';
import { Place, PlaceDetail } from '../types';
import { angleDiff } from '../utils/geo';
import { fetchPlaceDetail } from '../utils/wiki';
import { HEADING_TOLERANCE } from '../constants/config';

  interface TargetState {
    targeted: PlaceDetail | null;
    isLoading: boolean;
  }

  // Core "what am I pointing at" logic. I'm thinking o flooping trough the nearby places and finding the one with the smallest angle difference from the user's current heading, and if it's within a certain tolerance, we consider that the "targeted" place. Then we fetch the details for that place to show in the UI.
  export function useTargetedPlace(places: Place[], heading: number): TargetState {
    const [targeted, setTargeted] = useState<PlaceDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const currentTargetId = useRef<number | null>(null);
    useEffect(() => {
      let best: Place | null = null;
      let bestDiff = Infinity;
      for (const place of places) {
        const diff = Math.abs(angleDiff(heading, place.bearing));
        if (diff < bestDiff && diff <= HEADING_TOLERANCE) {
          best = place;
          bestDiff = diff;
        }
      }
      if (!best) {
        currentTargetId.current = null;
        setTargeted(null);
        setIsLoading(false);
        return;
      }
      if (best.id === currentTargetId.current) return;
      currentTargetId.current = best.id;
      setIsLoading(true);
      const controller = new AbortController();
      fetchPlaceDetail(best, controller.signal)
        .then((detail) => {
          if (currentTargetId.current === detail.id) {
            setTargeted(detail);
            setIsLoading(false);
          }
        })
        .catch(() => {
          setIsLoading(false);
        });
      return () => controller.abort();
    }, [places, heading]);
    return { targeted, isLoading };
  }