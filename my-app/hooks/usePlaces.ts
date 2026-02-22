import { useState, useEffect, useRef } from 'react';
import { Coordinate, Place } from '../types'; // Place[] would be our array of nearby places with bearings already computed
import { fetchNearbyPlaces } from '../utils/wiki';
import { getDistance } from '../utils/geo';
import { LOCATION_DISTANCE_INTERVAL } from '../constants/config';                                   
                                                           
  export function usePlaces(coord: Coordinate | null,      
  radius?: number): Place[] {                              
    const [places, setPlaces] = useState<Place[]>([]);     
    const lastFetchCoord = useRef<Coordinate | null>(null); // To remember the last coordinates for which we fetched places, so we can avoid unnecessary fetches if the user hasn't moved significantly.
                                                           
    useEffect(() => {                                      
      if (!coord) return;                                  
                                                           
      if (                                                 
        lastFetchCoord.current &&                          
        getDistance(lastFetchCoord.current, coord) < LOCATION_DISTANCE_INTERVAL // If the user hasn't moved more than a certain distance since the last fetch, don't refetch places.                             
      ) {                                                  
        return;                                            
      }                                                    
                                                           
      const controller = new AbortController();            
                                                           
      fetchNearbyPlaces(coord, radius, controller.signal)  
        .then((results) => {                               
          lastFetchCoord.current = coord;                  
          setPlaces(results);                              
        })                                                 
        .catch(() => {});                                  

      return () => controller.abort();                     
    }, [coord, radius]);                                   
                                                           
    return places;                                         
  }