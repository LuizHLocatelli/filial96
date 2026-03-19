import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { RolePermissionsContext } from './RolePermissionsContext';
import type { RolePermissionsProviderProps } from './types';

async function fetchPermissions(role: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('allowed_tools')
    .eq('role', role)
    .single();

  if (error) {
    console.error('Error fetching role permissions:', error);
    if (role === 'gerente') {
      return ['*'];
    }
    return ['hub'];
  }

  return data?.allowed_tools ?? [];
}

export const RolePermissionsProvider = ({ children }: RolePermissionsProviderProps) => {
  const { profile } = useAuth();

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['role-permissions', profile?.role],
    queryFn: () => fetchPermissions(profile!.role),
    enabled: !!profile?.role,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  const hasAccessToTool = useCallback((toolName: string) => {
    if (isLoading) return false;
    if (permissions.includes('*')) return true;
    return permissions.includes(toolName);
  }, [permissions, isLoading]);

  return (
    <RolePermissionsContext.Provider value={{ permissions, hasAccessToTool, isLoading }}>
      {children}
    </RolePermissionsContext.Provider>
  );
};
