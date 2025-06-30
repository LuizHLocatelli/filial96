
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCartazFolders } from "../hooks/useCartazFolders";

interface FolderSelectorProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function FolderSelector({ value, onChange }: FolderSelectorProps) {
  const { folders } = useCartazFolders();

  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === "no-folder") {
      onChange(null);
    } else {
      onChange(selectedValue);
    }
  };

  return (
    <div>
      <Label htmlFor="folder">Pasta (opcional)</Label>
      <Select value={value || "no-folder"} onValueChange={handleValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma pasta" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="no-folder">Sem pasta</SelectItem>
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
