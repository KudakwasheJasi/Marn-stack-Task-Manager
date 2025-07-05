export const useAudio = () => {
  let currentAudio = null;

  const playOnce = (soundPath) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(soundPath);
    currentAudio.play().catch(error => {
      console.error('Error playing sound:', error);
    });
  };

  return {
    playSuccess: () => playOnce('/alarm-sound.mp3'),
    playError: () => playOnce('/alarm-sound.mp3'),
    playNotification: () => playOnce('/alarm-sound.mp3')
  };
};
