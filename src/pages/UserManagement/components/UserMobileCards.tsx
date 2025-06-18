import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Edit, Trash2, AlertTriangle } from "lucide-react";
import { UserWithStats, roleColors, roleLabels } from "../types";
import { getRoleIcon, getInitials, formatDate } from "../utils.tsx";
import { EditUserForm } from "./EditUserForm";
import { useAuth } from "@/contexts/auth";
import { useMobileDialog } from "@/hooks/useMobileDialog";

interface UserMobileCardsProps {
  users: UserWithStats[];
  editingUser: UserWithStats | null;
  isEditDialogOpen: boolean;
  setEditingUser: (user: UserWithStats | null) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  onEditUser: (user: UserWithStats) => void;
  onDeleteUser: (userId: string, userName: string) => void;
}

export function UserMobileCards({
  users,
  editingUser,
  isEditDialogOpen,
  setEditingUser,
  setIsEditDialogOpen,
  onEditUser,
  onDeleteUser
}: UserMobileCardsProps) {
  const { profile } = useAuth();
  const { getMobileDialogProps, getMobileButtonProps } = useMobileDialog();
  const isManager = profile?.role === 'gerente';

  return (
    <div className="space-y-3 p-4">
      {users.map((user) => (
        <Card key={user.id} className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={`${roleColors[user.role]} text-xs`}>
                {getRoleIcon(user.role)}
                {roleLabels[user.role]}
              </Badge>
              <div className="flex gap-1">
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
                      size="sm"
                      className="touch-friendly p-0"
                      onClick={() => {
                        setEditingUser(user);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent {...getMobileDialogProps()}>
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="touch-friendly p-0"
                      disabled={!isManager || user.id === profile?.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent {...getMobileDialogProps()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="text-yellow-500 h-4 w-4" />
                        Confirmar Exclusão
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-xs">
                        Tem certeza que deseja excluir o usuário{" "}
                        <strong>{user.name}</strong>? Esta ação não pode ser
                        desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                      <AlertDialogCancel {...getMobileButtonProps()}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        {...getMobileButtonProps()}
                        onClick={() => onDeleteUser(user.id, user.name)}
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            
            {user.last_sign_in_at && (
              <p className="text-xs text-muted-foreground">
                Último acesso: {formatDate(user.last_sign_in_at)}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
} 