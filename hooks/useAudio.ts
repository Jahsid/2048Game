import { useAudioPlayer } from "expo-audio";

export const useAudio = (soundFile: any, shouldLoop = false) => {
  const player = useAudioPlayer(soundFile);

  if (player) {
    player.loop = shouldLoop;
  }

  const play = () => {
    try {
      player.play();
    } catch (e) {
      console.warn("Failed to play sound:", e);
    }
  };

  const pause = () => {
    try {
      player.pause();
    } catch (e) {
      console.warn("Failed to pause sound:", e);
    }
  };

  const seekToStart = () => {
    try {
      player.seekTo(0);
    } catch (e) {
      console.warn("Failed to seek to start:", e);
    }
  };

  return { play, pause, seekToStart };
};
