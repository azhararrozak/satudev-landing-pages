"use client"

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInStaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export default function FadeInStagger({ 
  children, 
  className = "", 
  staggerDelay = 0.1 
}: FadeInStaggerProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px", amount: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
