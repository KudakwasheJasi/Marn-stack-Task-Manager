export const useAudio = () => ({
  playSuccess: () => {
    const audio = new Audio('/success.mp3');
    audio.play().catch(error => {
      console.error('Error playing success sound:', error);
      // Fallback to notification sound if success sound fails
      const fallbackAudio = new Audio('/notification.mp3');
      fallbackAudio.play().catch(fallbackError => {
        console.error('Error playing fallback sound:', fallbackError);
      });
    });
  },

  playError: () => {
    const audio = new Audio('/error.mp3');
    audio.play().catch(error => {
      console.error('Error playing error sound:', error);
      // Fallback to notification sound if error sound fails
      const fallbackAudio = new Audio('/notification.mp3');
      fallbackAudio.play().catch(fallbackError => {
        console.error('Error playing fallback sound:', fallbackError);
      });
    });
  },

  playNotification: () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(error => {
      console.error('Error playing notification sound:', error);
    });
  }
});
