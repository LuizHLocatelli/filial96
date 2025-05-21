"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  const navItemsRef = useRef<Map<string, HTMLDivElement>>(new Map())

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
    const query = new URLSearchParams(window.location.search);
    const tab = query.get('tab');
    
    const matchingItem = items.find(item => item.url === path);
    if (matchingItem) {
      setActiveTab(matchingItem.name);
      
      // If we're on a page with inner tabs, check which inner tab is active
      if (tab && matchingItem.hasInnerPages && matchingItem.innerPages) {
        const innerPageUrl = `${path}?tab=${tab}`;
        const matchingInnerPage = matchingItem.innerPages.find(
          innerPage => innerPage.url === innerPageUrl
        );
        if (matchingInnerPage) {
          // We found an active inner page, but we still keep the parent as active
          // Just keeping this logic for potential future enhancements
        }
      }
    }
  }, [items]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openInnerPages) {
        // Check if click was inside popup or on the trigger button
        const isClickInsidePopup = (e.target as Element)?.closest('.inner-pages-popup');
        const isClickOnTrigger = (e.target as Element)?.closest('.inner-pages-trigger');

        if (!isClickInsidePopup && !isClickOnTrigger) {
          setOpenInnerPages(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openInnerPages]);

  const toggleInnerPages = (itemName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If it's already open, close it. If it's a different item, open new and close previous
    setOpenInnerPages(prevOpen => prevOpen === itemName ? null : itemName);
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 w-full flex justify-center z-50 mb-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-background/90 border border-border backdrop-blur-lg py-2 px-4 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name
          const isOpen = openInnerPages === item.name

          return (
            <div 
              key={item.name} 
              className="relative"
              ref={el => {
                if (el) navItemsRef.current.set(item.name, el);
              }}
            >
              <Link
                to={item.url}
                onClick={() => {
                  setActiveTab(item.name);
                  // Close any open popup when clicking on another navbar item
                  if (openInnerPages && openInnerPages !== item.name) {
                    setOpenInnerPages(null);
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
                    <button 
                      onClick={(e) => toggleInnerPages(item.name, e)}
                      className="focus:outline-none ml-0.5 inner-pages-trigger"
                      aria-label={isOpen ? "Fechar submenus" : "Abrir submenus"}
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
              </Link>
              
              {/* Centered Inner Pages Popup */}
              <AnimatePresence>
                {item.hasInnerPages && item.innerPages && isOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                            bg-background/95 border border-border rounded-xl p-4 
                            shadow-lg w-72 z-50 inner-pages-popup"
                    style={{ 
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <h3 className="text-lg font-medium mb-3 text-center">{item.name}</h3>
                    <div className="flex flex-col gap-2">
                      {item.innerPages.map((innerPage) => (
                        <Link
                          key={innerPage.name}
                          to={innerPage.url}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors whitespace-nowrap"
                          onClick={() => {
                            setOpenInnerPages(null);
                            setActiveTab(item.name);
                          }}
                        >
                          {innerPage.icon && <innerPage.icon size={20} />}
                          <span className="text-sm font-medium">{innerPage.name}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="flex justify-center mt-3">
                      <button
                        onClick={() => setOpenInnerPages(null)}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        Fechar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
