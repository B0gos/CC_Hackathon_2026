import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { PlaceDetail } from '../types';
  interface Props {
    targeted: PlaceDetail | null;
    isLoading: boolean;
  }
export function AROverlay({ targeted, isLoading }: Props) {
    return (
      // pointerEvents = none so that my overlay sits on top of the camera but doesn't block touches
      <View style={styles.container} pointerEvents="none">
        <View style={styles.reticle}>
          <View style={styles.reticleRing}>
            {isLoading && <ActivityIndicator size="small" color="#00ffaa" />}
          </View>
        </View>
        {targeted && (
          <View style={styles.labelBox}>
            <Text style={styles.labelTitle}>{targeted.title}</Text>
            <Text style={styles.labelDist}>{Math.round(targeted.dist)}m away</Text>
          </View>
        )}
      </View>
    );
  }
  const styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject, // fill the entire screen
      justifyContent: 'center',
      alignItems: 'center',
    },
    reticle: {
      marginBottom: 20,
    },
    reticleRing: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 2,
      borderColor: '#00ffaa',
      justifyContent: 'center',
      alignItems: 'center',
    },
    labelBox: {
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
    labelTitle: {
      color: '#00ffaa',
      fontSize: 18,
      fontWeight: 'bold',
    },
    labelDist: {
      color: '#ffffff',
      fontSize: 14,
      marginTop: 2,
    },
  });