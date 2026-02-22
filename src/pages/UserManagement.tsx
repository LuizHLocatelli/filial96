import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Crown, Shield, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useIsMobile } from "@/hooks/use-mobile";

// Componentes modularizados
import { useUserManagement } from "./UserManagement/hooks/useUserManagement";
import { UserStats } from "./UserManagement/components/UserStats";
import { UserTable } from "./UserManagement/components/UserTable";
import { UserMobileCards } from "./UserManagement/components/UserMobileCards";

export default function UserManagement() {
  const isMobile = useIsMobile();
  const {
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
  } = useUserManagement();

  // Se não for gerente, mostrar mensagem de acesso negado
  if (!isManager) {
    return (
      <PageLayout maxWidth="md" spacing="normal">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold">Acesso Restrito</h3>
                <p className="text-muted-foreground">
                  Esta funcionalidade está disponível apenas para gerentes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="full" spacing="normal">
      {/* Header padronizado */}
      <PageHeader
        title="Gerenciamento de Usuários"
        description="Gerencie todos os usuários cadastrados no sistema"
        icon={Crown}
        iconColor="text-primary"
        variant="default"
        status={{
          label: "Acesso de Gerente",
          variant: "outline",
          color: "text-yellow-700 dark:text-yellow-400 border-yellow-200/50 dark:border-yellow-900/50 bg-yellow-500/10"
        }}
        breadcrumbs={[
          { label: "Hub de Produtividade", href: "/" },
          { label: "Gerenciamento de Usuários" }
        ]}
      />

      <div className="space-y-6 sm:space-y-8">
        {/* Stats Cards */}
        <UserStats users={users} />

        {/* Search and Users List */}
        <Card className="glass-card border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Lista de Usuários
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9 w-full sm:w-[320px] bg-background/50 border-border/50 focus-visible:ring-primary/20 transition-all hover:bg-background/80"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {isLoading ? (
              <div className="space-y-4 p-4 sm:p-0">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <>
                {/* Mobile Cards */}
                {isMobile ? (
                  <UserMobileCards
                    users={filteredUsers}
                    editingUser={editingUser}
                    isEditDialogOpen={isEditDialogOpen}
                    setEditingUser={setEditingUser}
                    setIsEditDialogOpen={setIsEditDialogOpen}
                    onEditUser={handleEditUser}
                    onDeleteUser={handleDeleteUser}
                  />
                ) : (
                  /* Desktop Table */
                  <UserTable
                    users={filteredUsers}
                    editingUser={editingUser}
                    isEditDialogOpen={isEditDialogOpen}
                    setEditingUser={setEditingUser}
                    setIsEditDialogOpen={setIsEditDialogOpen}
                    onEditUser={handleEditUser}
                    onDeleteUser={handleDeleteUser}
                  />
                )}
              </>
            )}

            {!isLoading && filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
} 