"use client"

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInItemProps {
  children: ReactNode;
  className?: string;
}

export default function FadeInItem({ children, className = "" }: FadeInItemProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const
      }
    }
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
