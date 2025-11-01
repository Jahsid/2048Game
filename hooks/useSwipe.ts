import { useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { type MoveDirection } from '../logic/gameLogic';

export const useSwipe = (onSwipe: (dir: MoveDirection) => void | Promise<void>) => {
  // Create a pan gesture that detects end translation and calls onSwipe
  const gesture = useMemo(() =>
    Gesture.Pan().onEnd((e: any) => {
      const dx = e.translationX ?? 0;
      const dy = e.translationY ?? 0;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 50) onSwipe('right');
        else if (dx < -50) onSwipe('left');
      } else {
        if (dy > 50) onSwipe('down');
        else if (dy < -50) onSwipe('up');
      }
    }),
    [onSwipe]
  );

  return gesture;
};
