
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { NavItem } from "./types/navbar-types";

interface InnerPagesModalProps {
  item: NavItem;
  setOpenInnerPages: (value: string | null) => void;
  setActiveTab: (value: string) => void;
}

export function InnerPagesModal({ item, setOpenInnerPages, setActiveTab }: InnerPagesModalProps) {
  const navigate = useNavigate();
  
  if (!item.hasInnerPages || !item.innerPages) return null;
  
  const handleInnerPageClick = (innerPageUrl: string, itemName: string) => {
    // Close the modal first
    setOpenInnerPages(null);
    // Set the active tab
    setActiveTab(itemName);
    // Use navigate instead of Link to prevent the flashing issue
    navigate(innerPageUrl);
  };
  
  return (
    <div 
      id="inner-pages-modal"
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay with blur */}
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
              <button
                key={innerPage.name}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left w-full"
                onClick={() => handleInnerPageClick(innerPage.url, item.name)}
              >
                {Icon && <Icon size={18} />}
                <span className="text-sm font-medium">{innerPage.name}</span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
