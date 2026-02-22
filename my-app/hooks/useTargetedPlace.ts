import { useState, useEffect, useRef } from 'react';
import { Place, PlaceDetail } from '../types';
import { angleDiff } from '../utils/geo';
import { fetchPlaceDetail } from '../utils/wiki';
import { summarizePlace } from '../services/gemini';
import { HEADING_TOLERANCE } from '../constants/config';

  interface TargetState {
    targeted: PlaceDetail | null;
    isLoading: boolean;
  }

  export function useTargetedPlace(places: Place[], heading: number, geminiEnabled: boolean): TargetState {
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
      let cancelled = false;
      const controller = new AbortController();
      fetchPlaceDetail(best, controller.signal)
        .then(async (detail) => {
          if (cancelled || currentTargetId.current !== detail.id) return;
          if (geminiEnabled) {
            try {
              detail.geminiSummary = await summarizePlace(detail.title, detail.extract);
            } catch {}
          }
          if (!cancelled && currentTargetId.current === detail.id) {
            setTargeted(detail);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) setIsLoading(false);
        });
      return () => {
        cancelled = true;
        controller.abort();
      };
    }, [places, heading, geminiEnabled]);
    return { targeted, isLoading };
  }
