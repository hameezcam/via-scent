import { Variants, Transition } from "motion/react";

export const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const LUXURY_EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const MOTION_TRANSITIONS = {
  fast: {
    duration: 0.25,
    ease: LUXURY_EASE_OUT,
  } satisfies Transition,
  standard: {
    duration: 0.55,
    ease: LUXURY_EASE,
  } satisfies Transition,
  editorial: {
    duration: 0.85,
    ease: LUXURY_EASE,
  } satisfies Transition,
  slow: {
    duration: 1.2,
    ease: LUXURY_EASE,
  } satisfies Transition,
};

export const MOTION_VARIANTS = {
  fadeUp: {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: MOTION_TRANSITIONS.editorial,
    },
  } satisfies Variants,

  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: MOTION_TRANSITIONS.standard,
    },
  } satisfies Variants,

  staggerContainer: (staggerChildren = 0.1, delayChildren = 0.05): Variants => ({
    hidden: {},
    visible: {
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  }),

  headlineMask: {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.9,
        ease: LUXURY_EASE,
      },
    },
  } satisfies Variants,

  scaleSubtle: {
    hidden: { opacity: 0, scale: 0.97 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: MOTION_TRANSITIONS.editorial,
    },
  } satisfies Variants,
};
