import { useState, useEffect } from "react";
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

  const isManager = profile?.role === 'gerente';

  const fetchUsers = async () => {
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

      let authUsers: any = null;
      if (isManager) {
        try {
          const { data, error: authError } = await supabase.auth.admin.listUsers();
          if (!authError) {
            authUsers = data;
          }
        } catch (authError) {
          console.warn('Auth API error:', authError);
        }
      }

      const usersWithStats: UserWithStats[] = (profiles || []).map((profile: any) => {
        const authUser = authUsers?.users?.find((u: any) => u.id === profile.id);
        
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

      setUsers(usersWithStats);
      setFilteredUsers(usersWithStats);
    } catch (error: any) {
      console.error('Unexpected error fetching users:', error);
      toast({
        title: "Erro Inesperado",
        description: "Erro interno do sistema.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    const sanitizedTerm = DOMPurify.sanitize(term);
    setSearchTerm(sanitizedTerm);
    
    if (sanitizedTerm === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
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

      const userToDelete = users.find(u => u.id === userId);
      if (userToDelete?.role === 'gerente') {
        toast({
          title: "Operação Restrita",
          description: "Não é possível excluir outros gerentes.",
          variant: "destructive",
        });
        return;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        toast({
          title: "Erro ao Excluir",
          description: "Não foi possível excluir o usuário.",
          variant: "destructive",
        });
        return;
      }

      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(user =>
        searchTerm === "" ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roleLabels[user.role].toLowerCase().includes(searchTerm.toLowerCase())
      ));

      toast({
        title: "Usuário Excluído",
        description: `${DOMPurify.sanitize(userName)} foi excluído com sucesso.`,
      });
    } catch (error: any) {
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

      const updatedUsers = users.map(user =>
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(user =>
        searchTerm === "" ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roleLabels[user.role].toLowerCase().includes(searchTerm.toLowerCase())
      ));

      setIsEditDialogOpen(false);
      setEditingUser(null);

      toast({
        title: "Usuário Atualizado",
        description: "Informações atualizadas com sucesso.",
      });
    } catch (error: any) {
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