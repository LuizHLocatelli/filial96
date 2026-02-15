import { createContext } from 'react';
import { GlobalSearchContextType } from "./types";

export const GlobalSearchContext = createContext<GlobalSearchContextType | undefined>(undefined);
