
import { Home, Bell, Settings, Shield, User, Sofa, DollarSign, Image, Activity, Shirt } from "lucide-react";
import { NavigationTab } from "./types";

export const NAVIGATION_TABS: NavigationTab[] = [
  { title: "Hub", icon: Activity, path: "/" },
  { title: "Móveis", icon: Sofa, path: "/moveis" },
  { title: "Moda", icon: Shirt, path: "/moda" },
  { title: "Crediário", icon: DollarSign, path: "/crediario" },
  { title: "Cards", icon: Image, path: "/cards-promocionais" },
];

export const MOBILE_BREAKPOINT = 360;
