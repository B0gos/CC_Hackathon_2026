import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { PlaceDetail } from '../types';
  interface Props {
    place: PlaceDetail;
  }
  export function PlaceInfoCard({ place }: Props) {
    return (
      <View style={styles.card}>
        <View style={styles.handle} />
        <View style={styles.header}>
          {place.thumbnail && (
            <Image source={{ uri: place.thumbnail }} style={styles.thumbnail} />
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>{place.title}</Text>
            <Text style={styles.distance}>{Math.round(place.dist)}m away</Text>
          </View>
        </View>
        <ScrollView style={styles.body}>
          <Text style={styles.extract}>{place.extract}</Text>
        </ScrollView>
      </View>
    );
  }
  const styles = StyleSheet.create({
    // So I can anchor it to the bottom of the screen, overalaying the camera still
    card: {
      position: 'absolute', 
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#1a1a2e',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingBottom: 32,
      maxHeight: '40%',
    },
    // The little handle at the top of the card to indicate it can be swiped up/down
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#555',
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    // I only wants this to render if Wikipedia returned an image for this place
    thumbnail: {
      width: 56,
      height: 56,
      borderRadius: 8,
      marginRight: 12,
    },
    headerText: {
      flex: 1,
    },
    title: {
      color: '#ffffff',
      fontSize: 20,
      fontWeight: 'bold',
    },
    distance: {
      color: '#00ffaa',
      fontSize: 14,
      marginTop: 2,
    },
    body: {
      maxHeight: 120, // Since I don't want the card to never covers more than 40% of the screen, so the camera is always visible above it.
    },
    extract: {
      color: '#cccccc',
      fontSize: 14,
      lineHeight: 20,
    },
  });