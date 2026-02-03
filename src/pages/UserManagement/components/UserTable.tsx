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
import { Edit, Trash2, AlertTriangle, Key, Loader2 } from "lucide-react";
import { UserWithStats, roleColors, roleLabels } from "../types";
import { getRoleIcon, getInitials, formatDate } from "../utils.tsx";
import { EditUserForm } from "./EditUserForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { useAuth } from "@/contexts/auth";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
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
                      className="hover:bg-primary/10"
                      onClick={() => {
                        setEditingUser(user);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent 
                    className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'} overflow-hidden`}
                    hideCloseButton
                  >
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
                  className="hover:bg-amber-100 hover:text-amber-600"
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
                      className="hover:bg-red-100 hover:text-red-600"
                      disabled={!isManager || user.id === profile?.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[400px] p-0 overflow-hidden">
                    <div className="bg-gradient-to-br from-red-500/5 via-red-500/10 to-red-500/5 p-4 border-b border-border/10">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-red-100">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <AlertDialogTitle className="text-base font-semibold leading-none tracking-tight">
                              Confirmar Exclusão
                            </AlertDialogTitle>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
                        Tem certeza que deseja excluir o usuário{" "}
                        <strong className="text-foreground">{user.name}</strong>? Esta ação não pode ser
                        desfeita.
                      </AlertDialogDescription>
                    </div>
                    <AlertDialogFooter className="p-4 border-t border-border/10 gap-2">
                      <AlertDialogCancel className="flex-1 h-10">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteUser(user.id, user.name)}
                        className="flex-1 h-10 bg-red-600 hover:bg-red-700"
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
      
      {/* Change Password Dialog */}
      <Dialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      >
        <DialogContent 
          className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'} overflow-hidden`}
          hideCloseButton
        >
          {changePasswordUser && (
            <ChangePasswordForm
              user={changePasswordUser}
              onClose={() => {
                setIsChangePasswordOpen(false);
                setChangePasswordUser(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
