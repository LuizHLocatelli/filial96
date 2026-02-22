import React, { useState } from 'react';
import { User, Crown, Shield, UserCircle, GraduationCap, Phone, Tag, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserWithStats } from '../types';
import type { UserRole } from '@/types';
import { roleLabels, roleColors } from '../types';
import { StandardDialogHeader, StandardDialogFooter } from '@/components/ui/standard-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { getInitials } from '../utils';

interface EditUserFormProps {
  user: UserWithStats;
  onSave: (userData: Partial<UserWithStats>) => void;
  onCancel?: () => void;
}

const roleIcons: Record<UserRole, React.ReactNode> = {
  gerente: <Crown className="h-4 w-4" />,
  crediarista: <Shield className="h-4 w-4" />,
  consultor_moveis: <UserCircle className="h-4 w-4" />,
  consultor_moda: <UserCircle className="h-4 w-4" />,
  jovem_aprendiz: <GraduationCap className="h-4 w-4" />,
};

export function EditUserForm({ user, onSave, onCancel }: EditUserFormProps) {
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    role: user.role || 'consultor_moveis' as UserRole,
    phone: user.phone || '',
    displayName: user.displayName || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    return roleColors[role] || 'bg-muted text-muted-foreground border-border/50';
  };

  return (
    <>
      <StandardDialogHeader
        icon={User}
        iconColor="primary"
        title="Editar Usuário"
        description={`Edite as informações de ${user.name}`}
        onClose={handleCancel}
        loading={isLoading}
      />

      <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-4' : 'p-6'}`}>
        <form onSubmit={handleSubmit} className="space-y-5">
        {/* User Avatar Preview */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {getInitials(formData.name || user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{formData.name || user.name}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Nome Completo
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Digite o nome completo"
            disabled={isLoading}
            className="h-11"
          />
        </div>
        
        {/* Role Select */}
        <div className="space-y-2">
          <Label htmlFor="role" className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Cargo
          </Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as UserRole }))}
            disabled={isLoading}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Selecione o cargo">
                <div className="flex items-center gap-2">
                  {roleIcons[formData.role as UserRole]}
                  <span>{roleLabels[formData.role as UserRole]}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                <SelectItem key={role} value={role} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-muted-foreground">{roleIcons[role]}</span>
                    <span>{roleLabels[role]}</span>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${getRoleBadgeColor(role)}`}>
                      {role === 'gerente' ? 'Admin' : 'User'}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Telefone
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="(00) 00000-0000"
            disabled={isLoading}
            className="h-11"
          />
        </div>

        {/* Display Name Field */}
        <div className="space-y-2">
          <Label htmlFor="displayName" className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Nome de Exibição
            <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
          </Label>
          <Input
            id="displayName"
            value={formData.displayName}
            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
            placeholder="Como o usuário prefere ser chamado"
            disabled={isLoading}
            className="h-11"
          />
        </div>
      </form>
      </div>

      <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCancel}
          disabled={isLoading}
          className={isMobile ? 'w-full h-11' : 'flex-1 h-11'}
        >
          Cancelar
        </Button>
        <Button 
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className={`${isMobile ? 'w-full h-11' : 'flex-1 h-11'} gap-2`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <User className="h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </StandardDialogFooter>
    </>
  );
}
