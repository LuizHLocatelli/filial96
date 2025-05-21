
"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LucideIcon, ChevronDown, ChevronUp, X } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [openInnerPages, setOpenInnerPages] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const navItemsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // Definir o activeTab com base na rota atual
  useEffect(() => {
    const path = location.pathname;
    const query = new URLSearchParams(location.search);
    const tab = query.get('tab');
    
    // Encontrar o item que corresponde à rota atual
    const matchingItem = items.find(item => {
      // Verificamos se o path base coincide
      if (item.url === path) {
        return true;
      }
      
      // Se temos inner pages, verificamos se alguma delas coincide
      if (item.hasInnerPages && item.innerPages) {
        return item.innerPages.some(innerPage => {
          const innerPagePath = innerPage.url.split('?')[0];
          const innerPageQuery = new URLSearchParams(innerPage.url.split('?')[1] || '');
          
          return innerPagePath === path && 
                 (!tab || innerPageQuery.get('tab') === tab);
        });
      }
      
      return false;
    });
    
    if (matchingItem) {
      setActiveTab(matchingItem.name);
    }
  }, [location, items]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fechar o popup quando clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openInnerPages) {
        const modalElement = document.getElementById("inner-pages-modal");
        if (modalElement && !modalElement.contains(e.target as Node)) {
          const isButtonClick = Array.from(navItemsRef.current.values()).some(ref => 
            ref.contains(e.target as Node)
          );
          
          if (!isButtonClick) {
            setOpenInnerPages(null);
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openInnerPages]);

  const toggleInnerPages = (itemName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenInnerPages(prevOpen => prevOpen === itemName ? null : itemName);
  };

  // Componente de modal para inner pages
  const InnerPagesModal = ({ item }: { item: NavItem }) => {
    if (!item.hasInnerPages || !item.innerPages) return null;
    
    return (
      <div 
        id="inner-pages-modal"
        className="fixed inset-0 z-50 flex items-center justify-center"
        aria-modal="true"
        role="dialog"
      >
        {/* Overlay com blur */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
          onClick={() => setOpenInnerPages(null)}
        />
        
        {/* Modal content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 bg-background/95 border border-border rounded-xl p-5 shadow-lg w-[90%] max-w-sm mx-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">{item.name}</h3>
            <button 
              onClick={() => setOpenInnerPages(null)}
              className="p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="grid gap-2">
            {item.innerPages.map((innerPage) => {
              const Icon = innerPage.icon;
              
              return (
                <Link
                  key={innerPage.name}
                  to={innerPage.url}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => {
                    setOpenInnerPages(null);
                    setActiveTab(item.name);
                  }}
                >
                  {Icon && <Icon size={18} />}
                  <span className="text-sm font-medium">{innerPage.name}</span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  };

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
              {/* Inner Pages Modal (renderizado apenas quando aberto) */}
              <AnimatePresence>
                {item.hasInnerPages && item.innerPages && isOpen && (
                  <InnerPagesModal item={item} />
                )}
              </AnimatePresence>

              <Link
                to={item.url}
                onClick={(e) => {
                  if (item.hasInnerPages && item.innerPages) {
                    // Se tem subpáginas, prevenimos o comportamento padrão para mostrar o modal
                    e.preventDefault();
                    toggleInnerPages(item.name, e);
                  } else {
                    // Se não tem subpáginas, apenas navegamos
                    setActiveTab(item.name);
                    // Fechamos qualquer modal aberto
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
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
