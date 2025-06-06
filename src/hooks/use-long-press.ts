import { useCallback, useRef, useState } from 'react';

interface LongPressOptions {
  shouldPreventDefault?: boolean;
  delay?: number;
}

export const useLongPress = (
  onLongPress: (event: React.MouseEvent | React.TouchEvent) => void,
  onClick?: (event: React.MouseEvent | React.TouchEvent) => void,
  { shouldPreventDefault = true, delay = 300 }: LongPressOptions = {}
) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<NodeJS.Timeout>();
  const target = useRef<EventTarget>();

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener('touchend', preventDefault, { passive: false });
        target.current = event.target;
      }
      timeout.current = setTimeout(() => {
        onLongPress(event);
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (event: React.MouseEvent | React.TouchEvent, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current);
      shouldTriggerClick && !longPressTriggered && onClick?.(event);
      setLongPressTriggered(false);
      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener('touchend', preventDefault);
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered]
  );

  const preventDefault = (event: Event) => {
    if (!longPressTriggered) {
      return;
    }
    if (event.cancelable) {
       event.preventDefault();
    }
  };
  
  // Ensure nativeEvent is accessed correctly based on event type
  const getNativeEvent = (event: React.MouseEvent | React.TouchEvent) => {
    return 'nativeEvent' in event ? event.nativeEvent : event;
  };

  return {
    onMouseDown: (e: React.MouseEvent) => start(getNativeEvent(e)),
    onTouchStart: (e: React.TouchEvent) => start(getNativeEvent(e)),
    onMouseUp: (e: React.MouseEvent) => clear(getNativeEvent(e)),
    onMouseLeave: (e: React.MouseEvent) => clear(getNativeEvent(e), false),
    onTouchEnd: (e: React.TouchEvent) => clear(getNativeEvent(e)),
  };
};
