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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Trash2, AlertTriangle, Key, MoreVertical } from "lucide-react";
import { UserWithStats, roleColors, roleLabels } from "../types";
import { getRoleIcon, getInitials, formatDate } from "../utils.tsx";
import { EditUserForm } from "./EditUserForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { useAuth } from "@/contexts/auth";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const isManager = profile?.role === 'gerente';
  const [changePasswordUser, setChangePasswordUser] = useState<UserWithStats | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  return (
    <div className="space-y-3 p-4 bg-muted/20">
      {users.map((user) => (
        <Card key={user.id} className="glass-card overflow-hidden border-border/40 shadow-sm relative">
          <div className="absolute right-3 top-3">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted">
                    <span className="sr-only">Abrir menu</span>
                    <MoreVertical className="h-4 w-4" />
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
                    <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[400px] p-0 max-h-[85vh] overflow-y-auto flex flex-col glass-overlay border-border/40 rounded-xl">
                      <div className="bg-gradient-to-br from-red-500/5 via-red-500/10 to-red-500/5 p-4 border-b border-border/10">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-full bg-red-500/10 border border-red-500/20">
                              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <AlertDialogTitle className="text-base font-semibold leading-none tracking-tight text-red-600 dark:text-red-400">
                                Excluir Usuário
                              </AlertDialogTitle>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
                          Tem certeza que deseja excluir{" "}
                          <strong className="text-foreground">{user.name}</strong>?
                           <span className="block mt-1.5 text-red-600/80 dark:text-red-400/80 text-xs">Ação permanente.</span>
                        </AlertDialogDescription>
                      </div>
                      <AlertDialogFooter className="p-3 border-t border-border/10 bg-muted/20 gap-2 flex-row">
                        <AlertDialogCancel className="flex-1 h-9 mt-0 bg-background hover:bg-muted">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteUser(user.id, user.name)}
                          className="flex-1 h-9 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
              
               {/* Hidden Dialog just for handling the form */}
               <Dialog
                  open={isEditDialogOpen && editingUser?.id === user.id}
                  onOpenChange={(isOpen) => {
                    if (!isOpen) setEditingUser(null);
                    setIsEditDialogOpen(isOpen);
                  }}
                >
                  <DialogContent 
                    className={`w-[calc(100%-2rem)] max-w-full p-0 max-h-[85vh] overflow-y-auto flex flex-col glass-overlay`}
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
          </div>

          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 pr-8">
              <Avatar className="h-11 w-11 border border-border/30">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <p className="font-semibold text-[15px] truncate text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t border-border/10 pt-3 mt-1">
              <Badge 
                variant="outline" 
                className={`font-medium px-2 py-0.5 rounded-full flex w-fit items-center gap-1.5 ${roleColors[user.role]}`}
              >
                <span className="opacity-80 scale-90">{getRoleIcon(user.role)}</span>
                <span className="text-xs">{roleLabels[user.role]}</span>
              </Badge>
              
              {user.last_sign_in_at ? (
                <div className="text-[11px] text-muted-foreground text-right flex flex-col">
                  <span className="opacity-70">Último acesso</span>
                  <span className="font-medium text-foreground/80">{formatDate(user.last_sign_in_at).split(' ')[0]}</span>
                </div>
              ) : (
                <span className="text-[11px] text-muted-foreground/50 italic">Nunca acessou</span>
              )}
            </div>
          </div>
        </Card>
      ))}
      
      {/* Change Password Dialog */}
      <Dialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      >
        <DialogContent 
          className={`w-[calc(100%-2rem)] max-w-full p-0 overflow-hidden`}
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
