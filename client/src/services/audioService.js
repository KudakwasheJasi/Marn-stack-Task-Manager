/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 05/07/2025 - 15:55:38
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 05/07/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : 
**/
export const useAudio = () => {
  let currentAudio = null;

  const playOnce = (soundPath, duration = null) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(soundPath);
    currentAudio.play().catch(error => {
      console.error('Error playing sound:', error);
    });

    // Stop after a certain duration if specified
    if (duration) {
      setTimeout(() => {
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }, duration);
    }
  };

  return {
    playSuccess: () => playOnce('/alarm-sound.mp3', 1000),
    playError: () => playOnce('/alarm-sound.mp3', 1000),
    playNotification: () => playOnce('/alarm-sound.mp3', 1000)
  };
};
