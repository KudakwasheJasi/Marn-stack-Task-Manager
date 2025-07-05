import { useState, useEffect } from 'react';

const audioService = {
  audio: null,
  
  init() {
    if (!this.audio) {
      this.audio = new Audio('/alarm-sound.mp3');
      this.audio.preload = 'auto';
      this.audio.onloadeddata = () => {
        console.log('Audio file loaded successfully');
      };
      this.audio.onerror = (error) => {
        console.error('Error loading audio file:', error);
      };
    }
    return this.audio;
  },

  play() {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.play().catch(error => {
          console.error('Error playing sound:', error);
        });
      } catch (error) {
        console.error('Error handling audio:', error);
      }
    }
  },

  cleanup() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
  }
};

export const useAudio = () => {
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    const initializedAudio = audioService.init();
    setAudio(initializedAudio);
    return () => audioService.cleanup();
  }, []);

  return {
    play: audioService.play
  };
};

export default audioService;
