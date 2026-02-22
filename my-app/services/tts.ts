import { Audio } from 'expo-av';                         
  import Constants from 'expo-constants';                  
  import * as FileSystem from 'expo-file-system/legacy';   
                                                           
  const apiKey =                                           
  Constants.expoConfig?.extra?.elevenlabsApiKey as string |
  undefined;                                               
  const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';                 
                                                           
  let currentSound: Audio.Sound | null = null;             
  let currentUri: string | null = null;                    
                                                           
  function blobToBase64(blob: Blob): Promise<string> {     
    return new Promise((resolve, reject) => {              
      const reader = new FileReader();                     
                                                           
      reader.onloadend = () => {                           
        if (typeof reader.result !== 'string') {           
          reject(new Error('Unable to convert audioblob.'));                                                
          return;                                          
        }                                                  
        const base64 = reader.result.split(',')[1] ?? '';  
        resolve(base64);                                   
      };                                                   
                                                           
      reader.onerror = () => reject(reader.error ?? new    
  Error('FileReader failed.'));                            
      reader.readAsDataURL(blob);                          
    });
  }                                                        
                                                           
  async function cleanupCurrentSound(): Promise<void> {    
    if (currentSound) {                                    
      try {                                                
        await currentSound.stopAsync();                    
      } catch {}                                           
      try {                                                
        await currentSound.unloadAsync();                  
      } catch {}                                           
      currentSound = null;                                 
    }                                                      
                                                           
    if (currentUri) {                                      
      try {                                                
        await FileSystem.deleteAsync(currentUri,           
  { idempotent: true });                                   
      } catch {}                                           
      currentUri = null;                                   
    }                                                      
  }
                                                           
  export async function speakText(text: string, onDone?: ()
  => void): Promise<void> {                                
    const cleanText = text.trim();                         
    if (!cleanText) return;                                
    if (!apiKey) throw new Error('Missing ELEVENLABS_API_KEY in Expo config.');                    
                                                           
    await cleanupCurrentSound();                           
                                                           
    const response = await fetch(`https://                 
  api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {      
      method: 'POST',                                      
      headers: {                                           
        'xi-api-key': apiKey,                              
        Accept: 'audio/mpeg',                              
        'Content-Type': 'application/json',                
      },                                                   
      body: JSON.stringify({                               
        text: cleanText,                                   
        model_id: 'eleven_multilingual_v2',                
      }),                                                  
    });                                                    
                                                           
    if (!response.ok) {                                    
      const body = await response.text().catch(() => '');  
      throw new Error(`ElevenLabs error ${response.status}:
  ${body}`);                                               
    }                                                      
                                                           
    const blob = await response.blob();                    
    const base64 = await blobToBase64(blob);               
                                                           
    const cacheDir = FileSystem.cacheDirectory;            
    if (!cacheDir) throw new Error('No cache directory available for audio.');                                  
                                                           
    const uri = `${cacheDir}tts-${Date.now()}.mp3`;        
    await FileSystem.writeAsStringAsync(uri, base64, {     
      encoding: FileSystem.EncodingType.Base64,            
    });                                                    
                                                           
    await Audio.setAudioModeAsync({                        
      playsInSilentModeIOS: true,                          
      staysActiveInBackground: false,                      
    });                                                    
                                                           
    const { sound } = await                                
  Audio.Sound.createAsync({ uri }, { shouldPlay: true });  
                                                           
    currentSound = sound;                                  
    currentUri = uri;                                      

    sound.setOnPlaybackStatusUpdate((status) => {          
      if (!status.isLoaded) return;                        
      if (status.didJustFinish) {                          
        void cleanupCurrentSound();                        
        onDone?.();                                        
      }                                                    
    });                                                    
  }                                                        
                                                           
  export async function stopSpeaking(): Promise<void> {    
    await cleanupCurrentSound();                           
  }