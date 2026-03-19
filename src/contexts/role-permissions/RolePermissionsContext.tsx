import { createContext } from "react";
import { RolePermissionsContextType } from "./types";

export const RolePermissionsContext = createContext<RolePermissionsContextType | undefined>(undefined);
