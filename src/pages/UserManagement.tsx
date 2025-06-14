import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  Crown, 
  Shield, 
  User, 
  Users,
  AlertTriangle
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User as AppUser, UserRole } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from "dompurify";

interface UserWithStats extends AppUser {
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
}

export default function UserManagement() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Security: Verify manager role
  const isManager = profile?.role === 'gerente';

  const roleLabels: Record<UserRole, string> = {
    gerente: 'Gerente',
    crediarista: 'Crediarista',
    consultor_moveis: 'Consultor Móveis',
    consultor_moda: 'Consultor Moda',
    jovem_aprendiz: 'Jovem Aprendiz'
  };

  const roleColors: Record<UserRole, string> = {
    gerente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    crediarista: 'bg-blue-100 text-blue-800 border-blue-300',
    consultor_moveis: 'bg-green-100 text-green-800 border-green-300',
    consultor_moda: 'bg-purple-100 text-purple-800 border-purple-300',
    jovem_aprendiz: 'bg-orange-100 text-orange-800 border-orange-300'
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'gerente': return <Crown className="h-4 w-4 mr-2" />;
      case 'crediarista': return <Shield className="h-4 w-4 mr-2" />;
      case 'consultor_moveis': return <User className="h-4 w-4 mr-2" />;
      case 'consultor_moda': return <User className="h-4 w-4 mr-2" />;
      default: return <User className="h-4 w-4 mr-2" />;
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Security: Enhanced error handling for profiles fetch
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Profile fetch error:', profilesError);
        toast({
          title: "Erro de Acesso",
          description: "Não foi possível carregar os usuários. Verifique suas permissões.",
          variant: "destructive",
        });
        return;
      }

      // Security: Only managers can access auth data
      let authUsers: any = null;
      if (isManager) {
        try {
          const { data, error: authError } = await supabase.auth.admin.listUsers();
          if (authError) {
            console.warn('Auth data not accessible:', authError.message);
            // Continue without auth data - not critical for basic user management
          } else {
            authUsers = data;
          }
        } catch (authError) {
          console.warn('Auth API error:', authError);
          // Continue without auth data
        }
      }

      // Security: Sanitize and validate user data
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
        description: "Erro interno do sistema. Tente recarregar a página.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    // Security: Sanitize search input
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
      // Security: Prevent self-deletion
      if (userId === profile?.id) {
        toast({
          title: "Operação Não Permitida",
          description: "Você não pode excluir sua própria conta desta forma.",
          variant: "destructive",
        });
        return;
      }

      // Security: Check if user is trying to delete another manager
      const userToDelete = users.find(u => u.id === userId);
      if (userToDelete?.role === 'gerente') {
        toast({
          title: "Operação Restrita",
          description: "Não é possível excluir outros gerentes.",
          variant: "destructive",
        });
        return;
      }

      // Delete from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Profile deletion error:', profileError);
        toast({
          title: "Erro ao Excluir",
          description: "Não foi possível excluir o usuário. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      // Try to delete from auth (optional - may not have permission)
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);
        if (authError) {
          console.warn('Auth deletion failed:', authError.message);
          // Continue - profile deletion succeeded
        }
      } catch (authError) {
        console.warn('Auth deletion error:', authError);
        // Continue - profile deletion succeeded
      }

      // Update local state
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(user =>
        searchTerm === "" ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roleLabels[user.role].toLowerCase().includes(searchTerm.toLowerCase())
      ));

      // Security: Log user deletion for audit
      console.log('User deleted successfully', { 
        deletedUserId: userId, 
        deletedUserName: userName,
        deletedBy: profile?.id,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Usuário Excluído",
        description: `${DOMPurify.sanitize(userName)} foi excluído com sucesso.`,
      });
    } catch (error: any) {
      console.error('Unexpected deletion error:', error);
      toast({
        title: "Erro Inesperado",
        description: "Erro interno do sistema. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async (updatedUser: UserWithStats) => {
    try {
      // Security: Validate input data
      if (!updatedUser.name?.trim()) {
        toast({
          title: "Dados Inválidos",
          description: "Nome é obrigatório.",
          variant: "destructive",
        });
        return;
      }

      // Security: Prevent privilege escalation
      if (updatedUser.role === 'gerente' && profile?.role !== 'gerente') {
        toast({
          title: "Operação Não Permitida",
          description: "Apenas gerentes podem promover usuários a gerente.",
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
        console.error('User update error:', error);
        toast({
          title: "Erro ao Atualizar",
          description: "Não foi possível atualizar o usuário. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
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

      // Security: Log user update for audit
      console.log('User updated successfully', { 
        updatedUserId: updatedUser.id,
        updatedBy: profile?.id,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Usuário Atualizado",
        description: "Informações atualizadas com sucesso.",
      });
    } catch (error: any) {
      console.error('Unexpected update error:', error);
      toast({
        title: "Erro Inesperado",
        description: "Erro interno do sistema. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  useEffect(() => {
    if (isManager) {
      fetchUsers();
    }
  }, [isManager]);

  // Se não for gerente, mostrar mensagem de acesso negado
  if (!isManager) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Acesso Restrito</h3>
              <p className="text-muted-foreground">
                Esta funcionalidade está disponível apenas para gerentes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie todos os usuários cadastrados no sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-600" />
          <Badge variant="secondary">Acesso de Gerente</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        {Object.entries(roleLabels).map(([role, label]) => {
          const count = users.filter(user => user.role === role).length;
          return (
            <Card key={role}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Usuários</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden glass-card border border-border/20">
              <Table>
                <TableHeader className="bg-primary/5">
                  <TableRow className="border-b-0">
                    <TableHead className="w-[280px]">Usuário</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead className="hidden md:table-cell">E-mail</TableHead>
                    <TableHead className="hidden md:table-cell">Último Acesso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="transition-colors hover:bg-primary/10 border-b-border/10"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground hidden lg:block">
                              {user.displayName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${roleColors[user.role]}`}>
                          {getRoleIcon(user.role)}
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "Nunca"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog
                          open={isEditDialogOpen && editingUser?.id === user.id}
                          onOpenChange={(isOpen) => {
                            if (!isOpen) setEditingUser(null);
                            setIsEditDialogOpen(isOpen);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingUser(user);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            {editingUser && (
                              <EditUserForm
                                user={editingUser}
                                onSave={handleEditUser}
                                onCancel={() => {
                                  setIsEditDialogOpen(false);
                                  setEditingUser(null);
                                }}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={!isManager || user.id === profile?.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="text-yellow-500" />
                                Confirmar Exclusão
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o usuário{" "}
                                <strong>{user.name}</strong>? Esta ação não pode ser
                                desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id, user.name)}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface EditUserFormProps {
  user: UserWithStats;
  onSave: (user: UserWithStats) => void;
  onCancel: () => void;
}

function EditUserForm({ user, onSave, onCancel }: EditUserFormProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    role: user.role,
    phone: user.phone || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...user,
      name: DOMPurify.sanitize(formData.name),
      role: formData.role,
      phone: DOMPurify.sanitize(formData.phone),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogDescription>
          Altere as informações de <strong>{user.name}</strong>.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Função</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gerente">Gerente</SelectItem>
            <SelectItem value="crediarista">Crediarista</SelectItem>
            <SelectItem value="consultor_moveis">Consultor Móveis</SelectItem>
            <SelectItem value="consultor_moda">Consultor Moda</SelectItem>
            <SelectItem value="jovem_aprendiz">Jovem Aprendiz</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="(11) 99999-9999"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar Alterações</Button>
      </DialogFooter>
    </form>
  );
}
