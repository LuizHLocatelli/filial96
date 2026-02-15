import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { AuthProvider } from "./AuthProvider";

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, AuthContext };
