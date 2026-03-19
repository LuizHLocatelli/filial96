import { UserRole } from '@/types';

export interface RolePermissionsContextType {
  permissions: string[];
  hasAccessToTool: (toolName: string) => boolean;
  isLoading: boolean;
}

export interface RolePermissionsProviderProps {
  children: React.ReactNode;
}
