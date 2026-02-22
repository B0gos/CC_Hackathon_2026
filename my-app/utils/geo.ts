import { Coordinate } from '../types';

// Some helper functions to help me convert between deg and rad since JavaScript's trig functions use radians but GPS and compass bearings are in degrees. Also the actual math formulas for distance and bearing between two GPS coordinates, accounting for Earth's curvature. I found these formulas on Wikipedia and double-checked them against an online calculator to make sure I implemented them right.
  function toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  function toDeg(rad: number): number {
    return rad * (180 / Math.PI);
  }

  // Given "I'm standing here" and "the building is there," it returns the compass direction (0-360°). Uses the forward azimuth formula from spherical trigonometry
  export function getBearing(from: Coordinate, to: Coordinate): number {
    const dLon = toRad(to.longitude - from.longitude);
    const lat1 = toRad(from.latitude);
    const lat2 = toRad(to.latitude);
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    return (toDeg(Math.atan2(y, x)) + 360) % 360; // + 360) % 360 ensures the result is always 0-360 (atan2 can return negatives)
  }

  // getDistance` — Haversine formula. Returns meters between two GPS points, accounting for Earth's curvature
  export function getDistance(a: Coordinate, b: Coordinate): number {
    const R = 6371000;  // Earth radius in meters
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const sinLat = Math.sin(dLat / 2);
    const sinLon = Math.sin(dLon / 2);
    const h =
      sinLat * sinLat +
      Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinLon * sinLon;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
  // Returns the shortest signed difference between two compass bearings (-180 to +180). This is how I'm thinking we can check "am I pointing close enough to that building?
  export function angleDiff(a: number, b: number): number {
    let diff = ((b - a + 180) % 360) - 180;
    if (diff < -180) diff += 360;
    return diff;
  }