"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

type RippleProps = {
  color?: string;
  onClick?: () => void;
};

export const RippleEffect: React.FC<RippleProps> = ({
  color = "rgba(255, 255, 255, 0.7)",
  onClick,
}) => {
  const [rippleArray, setRippleArray] = useState<
    { x: number; y: number; size: number; id: number }[]
  >([]);

  useEffect(() => {
    // Clean up ripples after they finish animating
    if (rippleArray.length > 0) {
      const timeoutId = setTimeout(() => {
        setRippleArray([]);
      }, 1000); // Match this to the animation duration
      return () => clearTimeout(timeoutId);
    }
  }, [rippleArray]);

  const addRipple = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent the event from bubbling up

      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newRipple = {
        x,
        y,
        size,
        id: Date.now(),
      };

      setRippleArray([...rippleArray, newRipple]);

      // Simulate a click with a small delay to allow ripple to start
      if (onClick) {
        setTimeout(() => onClick(), 150);
      }
    },
    [rippleArray, onClick]
  );

  return (
    <div
      className="absolute inset-0 overflow-hidden z-50"
      onClick={addRipple}
      style={{ pointerEvents: "none" }} // Change to "none" so clicks pass through to underlying elements
    >
      <AnimatePresence>
        {rippleArray.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{
              width: 0,
              height: 0,
              x: ripple.x,
              y: ripple.y,
              opacity: 0.7,
            }}
            animate={{
              width: ripple.size * 2,
              height: ripple.size * 2,
              x: ripple.x - ripple.size,
              y: ripple.y - ripple.size,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: "absolute",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: color,
              pointerEvents: "none",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
