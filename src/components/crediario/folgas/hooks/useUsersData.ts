
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useUsersData() {
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);

  // Fetch all users from profiles table
  useEffect(() => {
    async function fetchAllUsers() {
      setIsLoadingUsers(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name");
          
        if (error) {
          console.error("Erro ao buscar todos os usuários:", error);
          toast({
            title: "Erro ao carregar usuários",
            description: error.message,
            variant: "destructive",
          });
          setAllUsers([]);
          return;
        }
        
        if (data) {
          const formattedUsers = data.map(profile => ({
            id: profile.id,
            name: profile.name || "Usuário Desconhecido",
          }));
          setAllUsers(formattedUsers);
        } else {
          setAllUsers([]);
        }
      } catch (error) {
        console.error("Erro ao buscar todos os usuários:", error);
        toast({
          title: "Erro ao carregar usuários",
          description: "Não foi possível carregar a lista de usuários.",
          variant: "destructive",
        });
        setAllUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    }
    
    fetchAllUsers();
  }, [toast]);

  // Função para obter o nome do usuário pelo ID
  const getUserNameById = (userId: string): string | undefined => {
    const foundUser = allUsers.find(u => u.id === userId);
    return foundUser?.name;
  };

  return {
    allUsers,
    isLoadingUsers,
    getUserNameById,
  };
}
