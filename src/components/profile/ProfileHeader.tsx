import { useAuth } from "@/contexts/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types";

export function ProfileHeader() {
  const { profile, user } = useAuth();
  
  // Função auxiliar para gerar iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Função para formatar o papel do usuário
  const formatRole = (role: UserRole) => {
    const roleMap = {
      'consultor_moveis': 'Consultor de Móveis',
      'consultor_moda': 'Consultor de Moda',
      'crediarista': 'Crediarista',
      'gerente': 'Gerente'
    };
    return roleMap[role] || role;
  };
  
  return (
    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20 mb-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20 ring-2 ring-primary/20">
          <AvatarImage src={profile?.avatarUrl} alt={profile?.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
            {profile?.name ? getInitials(profile.name) : '--'}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">
            {profile?.displayName || profile?.name || 'Usuário'}
          </h2>
          <p className="text-muted-foreground">
            {user?.email}
          </p>
          {profile?.role && (
            <Badge variant="secondary" className="mt-2">
              {formatRole(profile.role)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
