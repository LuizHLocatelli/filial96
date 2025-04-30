
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface UploadErrorProps {
  message: string;
}

export function UploadError({ message }: UploadErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro ao enviar arquivo</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
