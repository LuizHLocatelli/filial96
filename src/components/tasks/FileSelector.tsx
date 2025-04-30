
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";

interface FileSelectorProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  disabled: boolean;
  hasFile: boolean;
}

export function FileSelector({ onChange, onClear, disabled, hasFile }: FileSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <Input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={onChange}
        accept="image/png, image/jpeg, image/jpg"
        disabled={disabled}
      />
      <label
        htmlFor="file-upload"
        className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <Paperclip className="h-4 w-4 mr-2" />
        Escolher imagem
      </label>
      {hasFile && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClear}
          className="gap-1"
          disabled={disabled}
        >
          <X className="h-4 w-4" />
          Remover
        </Button>
      )}
    </div>
  );
}
