import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/types';

export interface RolePermissions {
  role: UserRole;
  allowed_tools: string[];
}

export function useRolePermissions() {
  const { profile } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPermissions() {
      if (!profile?.role) {
        setPermissions([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('role_permissions')
          .select('allowed_tools')
          .eq('role', profile.role)
          .single();

        if (error) {
          console.error('Error fetching role permissions:', error);
          // Default fallback based on role if DB fetch fails
          if (profile.role === 'gerente') {
            setPermissions(['*']);
          } else {
            setPermissions(['hub']);
          }
        } else if (data) {
          setPermissions(data.allowed_tools);
        }
      } catch (err) {
        console.error('Failed to fetch permissions:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPermissions();
  }, [profile?.role]);

  const hasAccessToTool = (toolName: string) => {
    if (isLoading) return false;
    if (permissions.includes('*')) return true; // Gerente has full access
    return permissions.includes(toolName);
  };

  return { permissions, hasAccessToTool, isLoading };
}
