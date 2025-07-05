export const useAudio = () => ({
  playSuccess: () => {
    const audio = new Audio('/alarm-sound.mp3');
    audio.play().catch(error => {
      console.error('Error playing success sound:', error);
    });
  },

  playError: () => {
    const audio = new Audio('/alarm-sound.mp3');
    audio.play().catch(error => {
      console.error('Error playing error sound:', error);
    });
  },

  playNotification: () => {
    const audio = new Audio('/alarm-sound.mp3');
    audio.play().catch(error => {
      console.error('Error playing notification sound:', error);
    });
  }
});
