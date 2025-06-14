
import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { PasswordUpdateForm } from "./PasswordUpdateForm";
import { PasswordUpdateSuccess } from "./PasswordUpdateSuccess";

interface UpdatePasswordFormProps {
  token?: string | null;
  hash?: string;
}

export function UpdatePasswordForm({ token, hash }: UpdatePasswordFormProps) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  if (success) {
    return (
      <CardContent className="space-y-4 py-6">
        <PasswordUpdateSuccess />
      </CardContent>
    );
  }

  return (
    <PasswordUpdateForm 
      token={token}
      hash={hash}
      onSuccess={() => setSuccess(true)}
      onError={(errorMessage) => setError(errorMessage)}
    />
  );
}
