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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Trash2, AlertTriangle, Key, Loader2, MoreHorizontal } from "lucide-react";
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
    <div className="rounded-xl overflow-hidden glass-card border border-border/20 shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40 hover:bg-muted/40">
          <TableRow className="border-b-border/20">
            <TableHead className="w-[300px] font-semibold text-muted-foreground">Usuário</TableHead>
            <TableHead className="font-semibold text-muted-foreground">Cargo</TableHead>
            <TableHead className="hidden md:table-cell font-semibold text-muted-foreground">E-mail</TableHead>
            <TableHead className="hidden md:table-cell font-semibold text-muted-foreground">Último Acesso</TableHead>
            <TableHead className="text-right font-semibold text-muted-foreground w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className="transition-colors hover:bg-muted/30 border-b-border/10 group"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-border/30">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm leading-tight">{user.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {user.displayName || 'Sem nome de exibição'}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={`font-medium px-2.5 py-0.5 rounded-full flex w-fit items-center gap-1.5 ${roleColors[user.role]}`}
                >
                  <span className="opacity-80 scale-90">{getRoleIcon(user.role)}</span>
                  {roleLabels[user.role]}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                {user.email}
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : (
                   <span className="text-muted-foreground/50 italic">Nunca acessou</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity data-[state=open]:opacity-100 data-[state=open]:bg-muted">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px] glass-overlay">
                      <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                         onClick={() => {
                          setEditingUser(user);
                          setIsEditDialogOpen(true);
                        }}
                        className="cursor-pointer gap-2"
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                        <span>Editar usuário</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                         onClick={() => {
                          setChangePasswordUser(user);
                          setIsChangePasswordOpen(true);
                        }}
                        disabled={!isManager || user.id === profile?.id}
                        className="cursor-pointer gap-2"
                      >
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span>Alterar senha</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <DropdownMenuItem 
                              onSelect={(e) => e.preventDefault()} 
                              disabled={!isManager || user.id === profile?.id}
                              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-500/10 cursor-pointer gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Excluir conta</span>
                           </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[400px] p-0 max-h-[85vh] overflow-y-auto flex flex-col glass-overlay border-border/40">
                          <div className="bg-gradient-to-br from-red-500/5 via-red-500/10 to-red-500/5 p-5 border-b border-border/10">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
                                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                  <AlertDialogTitle className="text-lg font-semibold leading-none tracking-tight text-red-600 dark:text-red-400">
                                    Excluir Usuário
                                  </AlertDialogTitle>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-5">
                            <AlertDialogDescription className="text-[15px] text-muted-foreground leading-relaxed">
                              Tem certeza que deseja excluir o usuário{" "}
                              <strong className="text-foreground font-semibold">{user.name}</strong>? 
                              <span className="block mt-2 text-red-600/80 dark:text-red-400/80 text-sm">Esta ação é permanente e não pode ser desfeita.</span>
                            </AlertDialogDescription>
                          </div>
                          <AlertDialogFooter className="p-4 border-t border-border/10 bg-muted/20 gap-2">
                            <AlertDialogCancel className="flex-1 h-10 bg-background hover:bg-muted">Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteUser(user.id, user.name)}
                              className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                            >
                              Sim, excluir usuário
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Formulário de edição escondido no componente para não quebrar a lógica atual */}
                  <Dialog
                    open={isEditDialogOpen && editingUser?.id === user.id}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) setEditingUser(null);
                      setIsEditDialogOpen(isOpen);
                    }}
                  >
                    <DialogContent 
                      className={`${isMobile ? 'w-[calc(100%-2rem)] max-w-full p-0' : 'sm:max-w-[500px] p-0'} max-h-[85vh] overflow-y-auto flex flex-col glass-overlay`}
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
