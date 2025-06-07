import { motion } from "framer-motion";

interface BadgeProps {
  text: string;
  className?: string;
}

export const Badge = ({ text, className }: BadgeProps) => {
  if (!text) return null;
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center bg-gray-700/80 backdrop-blur-sm text-gray-300 text-[9px] font-medium px-1.5 py-0.5 rounded ${className}`}
    >
      {text}
    </motion.span>
  );
}; 