
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCartazFolders } from "../hooks/useCartazFolders";

interface FolderSelectorProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function FolderSelector({ value, onChange }: FolderSelectorProps) {
  const { folders } = useCartazFolders();

  return (
    <div>
      <Label htmlFor="folder">Pasta (opcional)</Label>
      <Select value={value || ""} onValueChange={(value) => onChange(value || null)}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma pasta" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Sem pasta</SelectItem>
          {folders.map((folder) => (
            <SelectItem key={folder.id} value={folder.id}>
              {folder.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
