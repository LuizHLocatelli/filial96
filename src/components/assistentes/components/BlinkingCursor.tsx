import { motion } from "framer-motion";

export function BlinkingCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      className="inline-block w-[6px] h-[1em] bg-primary ml-1 align-middle rounded-sm"
      style={{ marginBottom: "-0.1em" }}
    />
  );
}
