
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '../utils/errorHandler';

interface User {
  id: string;
  name: string;
}

export function useUsersCache() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name');

      if (error) {
        handleError(error, 'buscar usuários', { showToast: false });
        return;
      }

      const formattedUsers = data.map(profile => ({
        id: profile.id,
        name: profile.name || 'Usuário Desconhecido'
      }));

      setUsers(formattedUsers);
      console.log('👥 Usuários carregados:', formattedUsers.length);
    } catch (error) {
      handleError(error, 'buscar usuários', { showToast: false });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserName = useCallback((userId: string): string => {
    if (!userId) return 'Usuário Desconhecido';
    
    const foundUser = users.find(u => u.id === userId);
    return foundUser?.name || userId;
  }, [users]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    getUserName,
    refetch: fetchUsers
  };
}
