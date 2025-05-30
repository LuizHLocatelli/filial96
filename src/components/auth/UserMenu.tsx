import { useState } from "react";
import { 
  User, 
  Settings, 
  Shield, 
  LogOut, 
  UserCircle,
  Mail,
  CheckCircle,
  AlertCircle,
  Crown,
  Calendar,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth";
import { Link } from "react-router-dom";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  // Função para obter as iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Função para obter o nome de exibição
  const getDisplayName = () => {
    // Prioridade: displayName do perfil > name do perfil > nome do email
    if (profile?.displayName) {
      return profile.displayName;
    }
    if (profile?.name) {
      return profile.name;
    }
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      // Capitalizar primeira letra
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'Usuário';
  };

  // Função para obter nome para as iniciais
  const getNameForInitials = () => {
    // Prioridade: name do perfil > displayName do perfil > nome do email
    if (profile?.name) {
      return profile.name;
    }
    if (profile?.displayName) {
      return profile.displayName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  // Função para formatar data em português
  const formatDateBR = (dateString: string | null) => {
    if (!dateString) return 'Não disponível';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  // Verificar se o email está confirmado
  const isEmailConfirmed = user?.email_confirmed_at !== null;
  
  // Obter status da conta
  const getAccountStatus = () => {
    if (!user && !profile) return null;
    
    const isAdmin = user?.app_metadata?.claims_admin || profile?.role === 'gerente';
    const createdRecently = user?.created_at && 
      (new Date().getTime() - new Date(user.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000;
    
    if (isAdmin) return { text: 'Administrador', variant: 'default' as const };
    if (createdRecently) return { text: 'Conta Nova', variant: 'secondary' as const };
    if (profile?.role) {
      const roleMap = {
        'consultor_moveis': 'Consultor Móveis',
        'consultor_moda': 'Consultor Moda',
        'crediarista': 'Crediarista',
        'gerente': 'Gerente'
      };
      return { text: roleMap[profile.role] || profile.role, variant: 'outline' as const };
    }
    return { text: 'Usuário Ativo', variant: 'outline' as const };
  };

  const accountStatus = getAccountStatus();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={profile?.avatarUrl} 
              alt={getDisplayName()} 
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getNameForInitials() ? getInitials(getNameForInitials()) : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {/* Header com informações do usuário */}
        <div className="flex items-center space-x-3 p-3">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={profile?.avatarUrl} 
              alt={getDisplayName()} 
            />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {getNameForInitials() ? getInitials(getNameForInitials()) : <User className="h-6 w-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm leading-none">
                {getDisplayName()}
              </p>
              {accountStatus && (
                <Badge variant={accountStatus.variant} className="text-xs">
                  {(user?.app_metadata?.claims_admin || profile?.role === 'gerente') && <Crown className="h-3 w-3 mr-1" />}
                  {accountStatus.text}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{user?.email || profile?.email}</span>
            </div>
            <div className="flex items-center gap-1">
              {isEmailConfirmed ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">Email verificado</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                  <span className="text-xs text-amber-600">Email não verificado</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Ações rápidas */}
        <DropdownMenuItem asChild>
          <Link to="/perfil" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            Meu Perfil
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/perfil?tab=security" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Configurações de Segurança
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/perfil?tab=info" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações da Conta
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Informações da conta */}
        <div className="px-2 py-2">
          <div className="text-xs text-muted-foreground space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Último login:</span>
              </div>
              <span className="font-medium">
                {formatDateBR(user?.last_sign_in_at)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Conta criada:</span>
              </div>
              <span className="font-medium">
                {formatDateBR(user?.created_at)}
              </span>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" />
          Sair da conta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
