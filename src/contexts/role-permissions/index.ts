import { useContext } from "react";
import { RolePermissionsContext } from "./RolePermissionsContext";

export function useRolePermissions() {
  const context = useContext(RolePermissionsContext);
  if (context === undefined) {
    throw new Error("useRolePermissions must be used within a RolePermissionsProvider");
  }
  return context;
}

export { RolePermissionsContext } from "./RolePermissionsContext";
export { RolePermissionsProvider } from "./RolePermissionsProvider";
