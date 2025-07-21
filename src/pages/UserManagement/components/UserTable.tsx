import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Edit, Trash2, AlertTriangle, Key } from "lucide-react";
import { UserWithStats, roleColors, roleLabels } from "../types";
import { getRoleIcon, getInitials, formatDate } from "../utils.tsx";
import { EditUserForm } from "./EditUserForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { useAuth } from "@/contexts/auth";
import { useState } from "react";

interface UserTableProps {
  users: UserWithStats[];
  editingUser: UserWithStats | null;
  isEditDialogOpen: boolean;
  setEditingUser: (user: UserWithStats | null) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  onEditUser: (user: UserWithStats) => void;
  onDeleteUser: (userId: string, userName: string) => void;
}

export function UserTable({
  users,
  editingUser,
  isEditDialogOpen,
  setEditingUser,
  setIsEditDialogOpen,
  onEditUser,
  onDeleteUser
}: UserTableProps) {
  const { profile } = useAuth();
  const isManager = profile?.role === 'gerente';
  const [changePasswordUser, setChangePasswordUser] = useState<UserWithStats | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  return (
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
          {users.map((user) => (
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
                        onSave={onEditUser}
                        onCancel={() => {
                          setIsEditDialogOpen(false);
                          setEditingUser(null);
                        }}
                      />
                    )}
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!isManager || user.id === profile?.id}
                  onClick={() => {
                    setChangePasswordUser(user);
                    setIsChangePasswordOpen(true);
                  }}
                  title="Alterar senha"
                >
                  <Key className="h-4 w-4" />
                </Button>
                
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
                        onClick={() => onDeleteUser(user.id, user.name)}
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
      
      {changePasswordUser && (
        <ChangePasswordForm
          user={changePasswordUser}
          isOpen={isChangePasswordOpen}
          onClose={() => {
            setIsChangePasswordOpen(false);
            setChangePasswordUser(null);
          }}
        />
      )}
    </div>
  );
}