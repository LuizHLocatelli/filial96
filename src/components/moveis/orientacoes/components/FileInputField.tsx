import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { OrientacaoFormValues } from "../schemas/orientacaoSchema";

interface FileInputFieldProps {
  form: UseFormReturn<OrientacaoFormValues>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  arquivo: File | null;
}

export function FileInputField({ form, onFileChange, arquivo }: FileInputFieldProps) {
  return (
    <FormField
      control={form.control}
      name="arquivo"
      render={({ field: { value, onChange, ...field } }) => (
        <FormItem>
          <FormLabel>Arquivo</FormLabel>
          <FormControl>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input
                id="arquivo"
                type="file"
                className="hidden"
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                onChange={onFileChange}
                {...field}
              />
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("arquivo")?.click()}
                  className="whitespace-nowrap"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Escolher Arquivo
                </Button>
                {arquivo && (
                  <span className="text-sm text-muted-foreground break-all sm:truncate sm:max-w-[200px]">
                    {arquivo.name}
                  </span>
                )}
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
