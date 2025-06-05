
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DesktopIndicatorProps {
  selectedTab: number;
  tabsLength: number;
}

export function DesktopIndicator({ selectedTab, tabsLength }: DesktopIndicatorProps) {
  return (
    <motion.div
      layoutId="desktopIndicator"
      className={cn(
        "absolute bottom-0 h-2 rounded-full",
        "bg-gradient-to-r from-primary/60 via-primary to-primary/60",
        "shadow-2xl shadow-primary/60",
        "before:absolute before:inset-0 before:rounded-full",
        "before:bg-primary/40 before:blur-lg before:-z-10"
      )}
      style={{
        left: `${(selectedTab / tabsLength) * 100}%`,
        width: `${100 / tabsLength}%`,
      }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
    />
  );
}
