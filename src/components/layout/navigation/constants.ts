
import { NavigationTab } from "./types";

export const NAVIGATION_TABS: NavigationTab[] = [
  { title: "Hub", icon: "🏠", path: "/", permissionKey: "hub" },
  { title: "Móveis", icon: "🛋️", path: "/moveis", permissionKey: "moveis" },
  { title: "Moda", icon: "👕", path: "/moda", permissionKey: "moda" },
  { title: "Crediário", icon: "💸", path: "/crediario", permissionKey: "crediario" },
  { title: "Cards", icon: "🖼️", path: "/cards-promocionais", permissionKey: "cards" },
];

export const MOBILE_BREAKPOINT = 360;
