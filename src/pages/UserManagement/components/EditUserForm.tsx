import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/types";
import { EditUserFormProps } from "../types";
import { useMobileDialog } from "@/hooks/useMobileDialog";
import DOMPurify from "dompurify";

export function EditUserForm({ user, onSave, onCancel }: EditUserFormProps) {
  const { getMobileFormProps, getMobileButtonProps } = useMobileDialog();
  const [formData, setFormData] = useState({
    name: user.name,
    role: user.role,
    phone: user.phone || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...user,
      name: DOMPurify.sanitize(formData.name),
      role: formData.role,
      phone: DOMPurify.sanitize(formData.phone),
    });
  };

  return (
    <form onSubmit={handleSubmit} {...getMobileFormProps()}>
      <DialogHeader>
        <DialogTitle className="text-lg">Editar Usuário</DialogTitle>
        <DialogDescription className="text-sm">
          Altere as informações de <strong>{user.name}</strong>.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm">Nome</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm">Função</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gerente">Gerente</SelectItem>
              <SelectItem value="crediarista">Crediarista</SelectItem>
              <SelectItem value="consultor_moveis">Consultor Móveis</SelectItem>
              <SelectItem value="consultor_moda">Consultor Moda</SelectItem>
              <SelectItem value="jovem_aprendiz">Jovem Aprendiz</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(11) 99999-9999"
            className="text-sm"
          />
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onCancel} {...getMobileButtonProps()}>
          Cancelar
        </Button>
        <Button type="submit" {...getMobileButtonProps()}>Salvar Alterações</Button>
      </DialogFooter>
    </form>
  );
} 