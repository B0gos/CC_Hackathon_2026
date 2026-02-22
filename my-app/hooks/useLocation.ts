import { useState, useEffect } from 'react'; // So i can use useState for 'coord', 'heading' and 'permissionGranted'. useEffect will run once when the screen loads. 
  import * as Location from 'expo-location';
  import { Coordinate } from '../types';
  interface LocationState {
    coord: Coordinate | null;
    heading: number;
    permissionGranted: boolean | null;
  }
  export function useLocation(): LocationState {
    const [coord, setCoord] = useState<Coordinate | null>(null);
    const [heading, setHeading] = useState<number>(0);
    const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
    useEffect(() => {
      let locSub: Location.LocationSubscription | undefined;
      let headSub: Location.LocationSubscription | undefined;
      let cancelled = false;
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync(); // I'm using the requestForegroundPermissionsAsync to ask the user for location permission and I'm intending to replaces the permission logic currently in index.tsx
        if (cancelled) return;
        if (status !== 'granted') {
          setPermissionGranted(false);
          return;
        }
        setPermissionGranted(true);
        locSub = await Location.watchPositionAsync( // watchPositionAsync is a function that continuously watches the user's location and updates the state whenever it changes. I'm using it here to keep track of the user's current location in real-time, which is essential for the app's functionality.
          { accuracy: Location.Accuracy.High, distanceInterval: 1 },
          (loc) => {
            setCoord({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
          }
        );
        headSub = await Location.watchHeadingAsync((h) => { // watchHeadingAsync is similar to watchPositionAsync but for the device's compass heading. It updates the 'heading' state whenever the device's orientation changes, which is crucial for determining which direction the user is facing in relation to nearby Wikipedia places.
          setHeading(h.trueHeading);
        });
      })();
      return () => { // obviously I need to cleanup hence the return function in useEffect. This will stop watching the user's location and heading when the component unmounts, preventing memory leaks and unnecessary updates when the user navigates away from the screen.
        cancelled = true; // To prevent state updates if the component unmounts before permissions are granted or location/heading updates start coming in, so no race conditon.
        locSub?.remove();
        headSub?.remove();
      };
    }, []);
    return { coord, heading, permissionGranted };
  }