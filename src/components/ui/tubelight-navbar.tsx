
"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { LucideIcon, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface InnerPage {
  name: string
  url: string
  icon?: LucideIcon
}

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
  hasInnerPages?: boolean
  innerPages?: InnerPage[]
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)
  const [openInnerPages, setOpenInnerPages] = useState<string | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Update active tab based on current URL
  useEffect(() => {
    const path = window.location.pathname;
    const matchingItem = items.find(item => item.url === path);
    if (matchingItem) {
      setActiveTab(matchingItem.name);
    }
  }, [items]);

  const toggleInnerPages = (itemName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenInnerPages(openInnerPages === itemName ? null : itemName);
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 sm:bottom-0 left-1/2 -translate-x-1/2 z-50 mb-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name
          const isOpen = openInnerPages === item.name

          return (
            <div key={item.name} className="relative">
              {/* Inner Pages Popup */}
              {item.hasInnerPages && item.innerPages && isOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-background border border-border rounded-xl p-2 shadow-lg w-max"
                >
                  <div className="flex flex-col gap-2">
                    {item.innerPages.map((innerPage) => (
                      <Link
                        key={innerPage.name}
                        to={innerPage.url}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors whitespace-nowrap"
                        onClick={() => {
                          setOpenInnerPages(null);
                          setActiveTab(item.name);
                        }}
                      >
                        {innerPage.icon && <innerPage.icon size={16} />}
                        <span className="text-sm font-medium">{innerPage.name}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-background rotate-45 border-b border-r border-border"></div>
                </motion.div>
              )}

              <Link
                to={item.url}
                onClick={() => setActiveTab(item.name)}
                className={cn(
                  "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                  "text-foreground/80 hover:text-primary",
                  isActive && "bg-muted text-primary",
                )}
              >
                <div className="flex items-center gap-1">
                  <span className="hidden md:inline">{item.name}</span>
                  <span className="md:hidden">
                    <Icon size={18} strokeWidth={2.5} />
                  </span>
                  {item.hasInnerPages && (
                    <button 
                      onClick={(e) => toggleInnerPages(item.name, e)}
                      className="focus:outline-none"
                    >
                      {isOpen ? (
                        <ChevronUp size={14} className="text-primary" />
                      ) : (
                        <ChevronDown size={14} className="opacity-70" />
                      )}
                    </button>
                  )}
                </div>
                {isActive && (
                  <motion.div
                    layoutId="lamp"
                    className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
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
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
