import { memo } from "react";
import { motion } from "framer-motion";
import { VIEW_TABS, type ViewTab } from "../constants";
import { cn } from "@/lib/utils";

interface ViewTabsProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  counts?: {
    all: number;
    pending: number;
    analyzed: number;
    recent: number;
  };
  className?: string;
}

export const ViewTabs = memo(function ViewTabs({
  activeTab,
  onTabChange,
  counts,
  className,
}: ViewTabsProps) {
  return (
    <div className={cn("flex items-center gap-1 p-1 rounded-xl bg-muted/50", className)}>
      {VIEW_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts?.[tab.id];

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              "hover:bg-muted/80",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            {count !== undefined && count > 0 && (
              <span
                className={cn(
                  "ml-1 px-1.5 py-0.5 rounded-full text-xs min-w-[20px] text-center",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="activeViewTab"
                className="absolute inset-0 bg-background rounded-lg shadow-sm -z-10"
                transition={{ type: "spring", duration: 0.4 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
});
