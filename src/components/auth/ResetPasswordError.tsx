
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ResetPasswordErrorProps {
  errorMessage: string;
}

export function ResetPasswordError({ errorMessage }: ResetPasswordErrorProps) {
  const navigate = useNavigate();
  
  return (
    <Card className="border-border shadow-lg mt-4">
      <CardHeader className="bg-card rounded-t-md">
        <CardTitle className="text-card-foreground">Erro de Recuperação</CardTitle>
        <CardDescription className="text-destructive">
          {errorMessage}
        </CardDescription>
        <CardDescription className="text-muted-foreground mt-4">
          Por favor, solicite um novo link de recuperação de senha:
        </CardDescription>
      </CardHeader>
      <div className="p-6">
        <Button 
          className="w-full" 
          onClick={() => navigate("/auth?tab=reset")}
        >
          Solicitar novo link
        </Button>
      </div>
    </Card>
  );
}
