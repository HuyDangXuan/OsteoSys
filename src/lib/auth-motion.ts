import { Variants } from "framer-motion";

export const cardContainerVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
};

export const formItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
};

export const errorShakeVariants: Variants = {
  idle: { x: 0 },
  shake: {
    x: [-6, 6, -5, 5, -3, 3, 0],
    transition: {
      duration: 0.35,
      ease: "easeInOut",
    },
  },
};

export const pulseBreathingVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.9, 1, 0.9],
    transition: {
      duration: 2.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const scaleInSuccessVariants: Variants = {
  hidden: { scale: 0.7, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 22,
    },
  },
};
