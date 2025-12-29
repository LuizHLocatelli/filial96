import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { UserRole } from "@/types";
import { UserWithStats, roleLabels } from "../types";
import DOMPurify from "dompurify";

export function useUserManagement() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const usersRef = useRef(users);
  const searchTermRef = useRef(searchTerm);
  const fetchUsersRef = useRef<() => Promise<void>>();
  
  // Update refs when state changes
  useEffect(() => {
    usersRef.current = users;
  }, [users]);
  
  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  // Verificar se é gerente usando função do banco
  const isManagerRef = useRef(false);

  useEffect(() => {
    const checkManagerStatus = async () => {
      if (profile?.id) {
        const { data: isManager } = await supabase
          .rpc('is_user_manager');
        isManagerRef.current = isManager || false;
      }
    };
    checkManagerStatus();
  }, [profile?.id]);

  const isManager = profile?.role === 'gerente';

  const fetchUsersInternal = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Profile fetch error:', profilesError);
        toast({
          title: "Erro de Acesso",
          description: "Não foi possível carregar os usuários.",
          variant: "destructive",
        });
        return;
      }

      // Tentar buscar dados de auth users (pode falhar com anon key)
      let authUsers: { users: { id: string; email?: string; last_sign_in_at?: string }[] } | null = null;
      if (isManager || isManagerRef.current) {
        try {
          const { data, error: authError } = await supabase.auth.admin.listUsers();
          if (!authError && data) {
            authUsers = data;
            console.log('Auth users loaded:', authUsers.users.length);
          }
        } catch (authError) {
          console.warn('Auth API não disponível (requer service role key):', authError);
        }
      }

      const usersWithStats: UserWithStats[] = (profiles || []).map((profile: { 
        id: string; 
        email?: string; 
        name: string; 
        role: string; 
        avatar_url?: string; 
        display_name?: string; 
        phone?: string; 
        created_at: string; 
        updated_at: string; 
      }) => {
        const authUser = authUsers?.users?.find((u) => u.id === profile.id);
        
        return {
          id: profile.id,
          email: DOMPurify.sanitize(profile.email || authUser?.email || ''),
          name: DOMPurify.sanitize(profile.name),
          role: profile.role as UserRole,
          avatarUrl: profile.avatar_url,
          displayName: profile.display_name ? DOMPurify.sanitize(profile.display_name) : null,
          phone: profile.phone ? DOMPurify.sanitize(profile.phone) : null,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          last_sign_in_at: authUser?.last_sign_in_at
        };
      });

      console.log('Users loaded:', usersWithStats.length);
      console.log('First user:', usersWithStats[0]);

      setUsers(usersWithStats);
      setFilteredUsers(usersWithStats);
    } catch (error: unknown) {
      console.error('Unexpected error fetching users:', error);
      toast({
        title: "Erro Inesperado",
        description: "Erro interno do sistema.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast, isManager, setUsers, setFilteredUsers]);

  // Assign the function to ref so it's always current
  useEffect(() => {
    fetchUsersRef.current = fetchUsersInternal;
  }, [fetchUsersInternal]);

  const fetchUsers = useCallback(() => {
    if (fetchUsersRef.current) {
      return fetchUsersRef.current();
    }
  }, []);

  const handleSearch = (term: string) => {
    const sanitizedTerm = DOMPurify.sanitize(term);
    setSearchTerm(sanitizedTerm);
    
    if (sanitizedTerm === "") {
      setFilteredUsers(usersRef.current);
    } else {
      const filtered = usersRef.current.filter(user =>
        user.name.toLowerCase().includes(sanitizedTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(sanitizedTerm.toLowerCase()) ||
        roleLabels[user.role].toLowerCase().includes(sanitizedTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      if (userId === profile?.id) {
        toast({
          title: "Operação Não Permitida",
          description: "Você não pode excluir sua própria conta.",
          variant: "destructive",
        });
        return;
      }

      // Delete user via Edge Function (handles profile + auth deletion safely)
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) {
        console.error('Delete error:', error);
        toast({
          title: "Erro ao Excluir",
          description: "Não foi possível excluir o usuário.",
          variant: "destructive",
        });
        return;
      }

      const updatedUsers = usersRef.current.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(user =>
        searchTermRef.current === "" ||
        user.name.toLowerCase().includes(searchTermRef.current.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTermRef.current.toLowerCase()) ||
        roleLabels[user.role].toLowerCase().includes(searchTermRef.current.toLowerCase())
      ));

      toast({
        title: "Usuário Excluído",
        description: `${DOMPurify.sanitize(userName)} foi excluído com sucesso.`,
      });
    } catch (error: unknown) {
      console.error('Unexpected deletion error:', error);
      toast({
        title: "Erro Inesperado",
        description: "Erro interno do sistema.",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async (updatedUser: UserWithStats) => {
    try {
      if (!updatedUser.name?.trim()) {
        toast({
          title: "Dados Inválidos",
          description: "Nome é obrigatório.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: DOMPurify.sanitize(updatedUser.name.trim()),
          role: updatedUser.role,
          phone: updatedUser.phone ? DOMPurify.sanitize(updatedUser.phone.trim()) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedUser.id);

      if (error) {
        toast({
          title: "Erro ao Atualizar",
          description: "Não foi possível atualizar o usuário.",
          variant: "destructive",
        });
        return;
      }

      const updatedUsers = usersRef.current.map(user =>
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(user =>
        searchTermRef.current === "" ||
        user.name.toLowerCase().includes(searchTermRef.current.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTermRef.current.toLowerCase()) ||
        roleLabels[user.role].toLowerCase().includes(searchTermRef.current.toLowerCase())
      ));

      setIsEditDialogOpen(false);
      setEditingUser(null);

      toast({
        title: "Usuário Atualizado",
        description: "Informações atualizadas com sucesso.",
      });
    } catch (error: unknown) {
      console.error('Unexpected update error:', error);
      toast({
        title: "Erro Inesperado",
        description: "Erro interno do sistema.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isManager) {
      fetchUsers();
    }
  }, [isManager]);

  return {
    users,
    filteredUsers,
    searchTerm,
    isLoading,
    editingUser,
    isEditDialogOpen,
    isManager,
    setEditingUser,
    setIsEditDialogOpen,
    handleSearch,
    handleDeleteUser,
    handleEditUser
  };
} 