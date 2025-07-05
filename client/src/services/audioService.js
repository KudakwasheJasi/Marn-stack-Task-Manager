// Simplified audio service - no longer needed since we're using direct audio elements in components
export const useAudio = () => ({
  play: () => {
    const audio = new Audio('/alarm-sound.mp3');
    audio.play().catch(error => console.error('Error playing sound:', error));
  }
});
