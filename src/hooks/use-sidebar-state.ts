import * as React from "react";

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

export type SidebarState = "expanded" | "collapsed";

export interface UseSidebarStateProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isMobile: boolean;
}

export interface UseSidebarStateReturn {
  state: SidebarState;
  open: boolean;
  setOpen: (value: boolean | ((value: boolean) => boolean)) => void;
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
}

export function useSidebarState({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  isMobile,
}: UseSidebarStateProps): UseSidebarStateReturn {
  const [openMobile, setOpenMobile] = React.useState(false);

  // Internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;

  const setOpen = React.useCallback(
    (value: boolean | ((currentOpen: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      if (typeof document !== "undefined") {
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      }
    },
    [setOpenProp, open]
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile
      ? setOpenMobile((currentOpenMobile) => !currentOpenMobile)
      : setOpen((currentOpen) => !currentOpen);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [toggleSidebar]);
  
  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed";

  return {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    toggleSidebar,
  };
} 