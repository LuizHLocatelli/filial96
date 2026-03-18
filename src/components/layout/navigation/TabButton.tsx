import { memo } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "@/components/ui/emoji-icons";
import { cn } from "@/lib/utils";
import { TabButtonProps } from "./types";

export const TabButton = memo(function TabButton({ 
  tab, 
  index, 
  isActive, 
  isSmallScreen, 
  isMobile, 
  onTabClick,
  preloadProps = {}
}: TabButtonProps) {
  const isEmoji = typeof tab.icon === 'string';
  const Icon = !isEmoji ? tab.icon as LucideIcon : null;

  // Filtramos os props de preloading para evitar conflitos com framer-motion
  const { onMouseEnter, onFocus } = preloadProps as { onMouseEnter?: () => void; onFocus?: () => void };

  return (
    <motion.button
      key={tab.path}
      onClick={() => onTabClick(index)}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      role="tab"
      aria-selected={isActive}
      aria-label={tab.title}
      id={`nav-tab-${index}`}
      aria-controls={`nav-panel-${index}`}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl transition-all duration-300",
        "group cursor-pointer select-none shrink-0",
        isMobile 
          ? cn(
              "flex-1 min-w-0",
              isSmallScreen 
                ? "h-16 px-0.5 py-2"
                : "h-18 px-1 py-3"
            )
          : "min-w-[56px] h-16 px-3 py-2.5",
        isActive
          ? "nav-tab-active scale-105 transform-gpu"
          : "nav-tab-inactive hover:scale-[1.03] transform-gpu"
      )}
      whileTap={{ scale: 0.96 }}
      style={{
        filter: isActive ? 'drop-shadow(0 4px 16px var(--nav-glow))' : 'none'
      }}
    >
      {/* Background do botão ativo com glassmorphism */}
      {isActive && (
        <motion.div
          layoutId="activeTabBackground"
          className={cn(
            "absolute inset-0 rounded-2xl overflow-hidden",
            "glass-button-primary",
            "shadow-2xl shadow-primary/30",
            "before:absolute before:inset-0 before:rounded-2xl",
            "before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent",
            "after:absolute after:top-0 after:left-0 after:right-0 after:h-px",
            "after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent"
          )}
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      
      {/* Hover effect com glassmorphism */}
      {!isActive && (
        <div className={cn(
          "absolute inset-0 rounded-2xl opacity-0 transition-all duration-300",
          "glass-button-ghost",
          "group-hover:opacity-100",
          "group-hover:shadow-xl group-hover:shadow-white/15"
        )} />
      )}
      
      {/* Container do ícone */}
      <motion.div 
        className={cn(
          "relative flex items-center justify-center transition-all duration-300 z-10",
          isMobile 
            ? cn(
                "rounded-lg mb-1",
                isSmallScreen 
                  ? "w-5 h-5"
                  : "w-6 h-6"
              )
            : "rounded-lg w-8 h-8 mb-2",
          isActive 
            ? "glass-button-secondary shadow-xl shadow-primary/40 ring-1 ring-white/10 bg-zinc-950/60 dark:bg-zinc-950/80" 
            : "group-hover:glass-button-ghost group-hover:shadow-lg group-hover:bg-zinc-950/10"
        )}
        whileHover={{ scale: isMobile ? 1.08 : 1.1 }}
        whileTap={{ scale: 0.92 }}
      >
        {isEmoji ? (
          <span className={cn(
            "transition-all duration-300 flex items-center justify-center leading-none",
            isMobile 
              ? (isSmallScreen ? "text-[12px]" : "text-[14px]")
              : "text-[16px]",
            isActive ? "drop-shadow-md" : "opacity-80 group-hover:opacity-100"
          )}>
            {tab.icon as string}
          </span>
        ) : (
          Icon && (
            <Icon 
              className={cn(
                "transition-all duration-300",
                isMobile 
                  ? (isSmallScreen ? "h-3 w-3" : "h-3.5 w-3.5")
                  : "h-4 w-4", 
                isActive 
                  ? "nav-icon-active font-bold drop-shadow-sm" 
                  : "nav-icon-inactive group-hover:font-medium",
                !isActive && "text-zinc-700 dark:text-gray-300"
              )} 
            />
          )
        )}
      </motion.div>
      
      {/* Label */}
      <span className={cn(
        "font-semibold transition-all duration-300 text-center leading-tight z-10",
        isMobile 
          ? cn(
              "px-0.5 w-full",
              isSmallScreen ? "text-[9px]" : "text-[10px]"
            )
          : "text-[11px]",
        isActive 
          ? "text-primary-foreground filter drop-shadow-sm font-bold" 
          : "group-hover:text-foreground group-hover:drop-shadow-sm text-zinc-700 dark:text-foreground/90 font-medium"
      )}>
        {tab.title}
      </span>
      
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl z-0"
        whileTap={{
          background: "radial-gradient(circle, var(--nav-glow) 0%, transparent 70%)"
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
});
