"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, rotateY: -2.5, y: 6 }
      }
      animate={{ opacity: 1, rotateY: 0, y: 0 }}
      transition={{
        duration: reduceMotion ? 0.15 : 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        transformOrigin: "left center",
        transformPerspective: 1200,
      }}
    >
      {children}
    </motion.div>
  );
}
