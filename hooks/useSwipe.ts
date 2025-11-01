import { GestureResponderEvent, PanResponder, PanResponderGestureState } from 'react-native';

export const useSwipe = (onSwipe: (dir: string) => void) => {
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderRelease: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const { dx, dy } = gestureState;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 50) onSwipe('right');
        else if (dx < -50) onSwipe('left');
      } else {
        if (dy > 50) onSwipe('down');
        else if (dy < -50) onSwipe('up');
      }
    },
  });

  return panResponder.panHandlers;
};
