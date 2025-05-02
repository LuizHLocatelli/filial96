
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileHeader() {
  const { profile } = useAuth();
  
  // Função auxiliar para gerar iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="flex items-center space-x-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={profile?.avatarUrl} alt={profile?.name} />
        <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 text-xl">
          {profile?.name ? getInitials(profile.name) : '--'}
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e configurações de conta
        </p>
      </div>
    </div>
  );
}
