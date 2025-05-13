
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
}

export function useUsers() {
  const [usersData, setUsersData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, role, avatar_url');
          
        if (error) {
          console.error('Error fetching users:', error);
          setIsLoading(false);
          return;
        }
        
        setUsersData(data);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUsers();
  }, []);
  
  return { usersData, isLoading };
}
