
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavItem } from "../types/navbar-types";

export function useNavbarNavigation(items: NavItem[]) {
  const [activeTab, setActiveTab] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [openInnerPages, setOpenInnerPages] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const navItemsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // Set activeTab based on current route
  useEffect(() => {
    const path = location.pathname;
    const query = new URLSearchParams(location.search);
    const tab = query.get('tab');
    
    // Find item matching current route
    const matchingItem = items.find(item => {
      // Check if base path matches
      if (item.url === path) {
        return true;
      }
      
      // Check inner pages
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

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close popup when clicking outside
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

  return {
    activeTab,
    setActiveTab,
    isMobile,
    openInnerPages,
    setOpenInnerPages,
    navItemsRef,
    toggleInnerPages,
    navigate
  };
}
