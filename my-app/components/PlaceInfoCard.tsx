import { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { PlaceDetail } from '../types';
import { speakText, stopSpeaking } from '../services/tts';
import { askAboutPlace } from '../services/gemini';

interface Props {
  place: PlaceDetail;
  onClose?: () => void;
  tts?: boolean;
}

export function PlaceInfoCard({ place, onClose, tts }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{ question: string; answer: string }[]>([]);
  const [isAsking, setIsAsking] = useState(false);

  const handleAsk = async () => {
    const q = question.trim();
    if (!q || isAsking) return;
    setQuestion('');
    setIsAsking(true);
    try {
      const answer = await askAboutPlace(place.title, place.extract, q);
      setMessages((prev) => [...prev, { question: q, answer }]);
      if (tts) speakText(answer);
    } catch {
      setMessages((prev) => [...prev, { question: q, answer: "Sorry, couldn't get an answer." }]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleSpeak = async () => {
    if (isPlaying) {
      await stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await speakText(place.geminiSummary ?? place.extract, () => setIsPlaying(false));
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.handle} />

      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      )}

      <View style={styles.header}>
        {place.thumbnail && (
          <Image source={{ uri: place.thumbnail }} style={styles.thumbnail} />
        )}
        <View style={styles.headerText}>
          <Text style={styles.title}>{place.title}</Text>
          <Text style={styles.distance}>{Math.round(place.dist)}m away</Text>
        </View>
        {tts && (
          <TouchableOpacity onPress={handleSpeak} style={styles.speakerButton}>
            <Text style={styles.speakerIcon}>{isPlaying ? '⏹' : '🔊'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.body}>
        {place.geminiSummary ? (
          <>
            <Text style={styles.sectionLabel}>✨ AI Summary</Text>
            <Text style={styles.extract}>{place.geminiSummary}</Text>
            <Text style={[styles.sectionLabel, { marginTop: 12 }]}>📖 Wikipedia</Text>
            <Text style={styles.extract}>{place.extract}</Text>
          </>
        ) : (
          <Text style={styles.extract}>{place.extract}</Text>
        )}

        {messages.map((msg, i) => (
          <View key={i} style={styles.qaBlock}>
            <Text style={styles.qaQuestion}>Q: {msg.question}</Text>
            <Text style={styles.qaAnswer}>{msg.answer}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.qaInputRow}>
        <TextInput
          style={styles.qaInput}
          placeholder="Ask about this place..."
          placeholderTextColor="#888"
          value={question}
          onChangeText={setQuestion}
          onSubmitEditing={handleAsk}
          returnKeyType="send"
          editable={!isAsking}
        />
        {isAsking ? (
          <ActivityIndicator color="#00ffaa" style={{ marginLeft: 8 }} />
        ) : (
          <TouchableOpacity onPress={handleAsk} style={styles.sendButton}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#555',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  closeText: {
    color: '#aaa',
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
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
  speakerButton: {
    padding: 8,
  },
  speakerIcon: {
    fontSize: 22,
  },
  sectionLabel: {
    color: '#00ffaa',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  body: {
    maxHeight: 120,
  },
  extract: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
  },
  qaBlock: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 8,
  },
  qaQuestion: {
    color: '#00ffaa',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  qaAnswer: {
    color: '#cccccc',
    fontSize: 13,
    lineHeight: 18,
  },
  qaInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  qaInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#00ffaa',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sendText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
});
