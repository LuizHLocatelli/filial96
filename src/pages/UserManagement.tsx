import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Crown, Shield } from "lucide-react";
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
        breadcrumbs={[
          { label: "Hub de Produtividade", href: "/" },
          { label: "Gerenciamento de Usuários" }
        ]}
      />

      <div className="space-y-4 sm:space-y-6">
        {/* Status Badge */}
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            <Badge variant="secondary" className="text-xs sm:text-sm">Acesso de Gerente</Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <UserStats users={users} />

        {/* Search and Users List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg sm:text-xl">Lista de Usuários</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-8 w-full sm:w-[300px]"
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