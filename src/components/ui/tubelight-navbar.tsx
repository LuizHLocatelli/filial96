
"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavbarNavigation } from "./hooks/use-navbar-navigation"
import { InnerPagesModal } from "./inner-pages-modal"
import { NavBarProps } from "./types/navbar-types"

export function NavBar({ items, className }: NavBarProps) {
  const {
    activeTab,
    setActiveTab,
    isMobile,
    openInnerPages,
    setOpenInnerPages,
    navItemsRef,
    toggleInnerPages,
    handleNavigation
  } = useNavbarNavigation(items);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 w-full flex justify-center z-40 mb-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-background/90 border border-border backdrop-blur-lg py-2 px-4 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          const isOpen = openInnerPages === item.name;

          return (
            <div 
              key={item.name} 
              className="relative"
              ref={el => {
                if (el) navItemsRef.current.set(item.name, el);
              }}
            >
              {/* Inner Pages Modal (rendered only when open) */}
              <AnimatePresence>
                {item.hasInnerPages && item.innerPages && isOpen && (
                  <InnerPagesModal 
                    item={item} 
                    setOpenInnerPages={setOpenInnerPages}
                    setActiveTab={setActiveTab}
                  />
                )}
              </AnimatePresence>

              <button
                onClick={(e) => {
                  if (item.hasInnerPages && item.innerPages) {
                    // If it has subpages, show the modal
                    toggleInnerPages(item.name, e);
                  } else {
                    // If no subpages, just navigate
                    handleNavigation(item.url, item.name);
                  }
                }}
                className={cn(
                  "relative flex items-center justify-center cursor-pointer text-sm font-medium px-4 py-2 rounded-full transition-colors",
                  "text-foreground/80 hover:text-primary",
                  isActive && "bg-muted text-primary",
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span className="hidden md:inline">{item.name}</span>
                  <span className={cn("flex items-center justify-center", isMobile ? "text-lg" : "")}>
                    <Icon size={isMobile ? 20 : 18} strokeWidth={2} />
                  </span>
                  {item.hasInnerPages && (
                    <span className="focus:outline-none ml-0.5">
                      {isOpen ? (
                        <ChevronUp size={14} className="text-primary" />
                      ) : (
                        <ChevronDown size={14} className="opacity-70" />
                      )}
                    </span>
                  )}
                </div>
                {isActive && (
                  <motion.div
                    layoutId="lamp"
                    className="absolute inset-0 w-full h-full bg-primary/5 rounded-full -z-10"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                      <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                      <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                      <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                    </div>
                  </motion.div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
