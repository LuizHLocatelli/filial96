import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/types/user";

interface UserWithStats {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  last_login: string | null;
  created_at: string;
}

interface EditUserFormProps {
  user: UserWithStats;
  onUpdate: (data: Partial<UserWithStats>) => Promise<void>;
  onCancel: () => void;
}

export function EditUserForm({ user, onUpdate, onCancel }: EditUserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    role: user.role,
    display_name: user.display_name || '',
    phone: user.phone || '',
    avatar_url: user.avatar_url || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updatedData: Partial<UserWithStats> = {
        name: formData.name,
        role: formData.role,
        display_name: formData.display_name,
        phone: formData.phone,
        avatar_url: formData.avatar_url
      };
      
      await onUpdate(updatedData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="display_name">Nome de Exibição</Label>
        <Input
          id="display_name"
          type="text"
          value={formData.display_name}
          onChange={(e) => handleInputChange('display_name', e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          type="text"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="avatar_url">URL do Avatar</Label>
        <Input
          id="avatar_url"
          type="text"
          value={formData.avatar_url}
          onChange={(e) => handleInputChange('avatar_url', e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value: UserRole) => handleInputChange('role', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
