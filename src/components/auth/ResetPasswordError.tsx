
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ResetPasswordErrorProps {
  errorMessage: string;
}

export function ResetPasswordError({ errorMessage }: ResetPasswordErrorProps) {
  const navigate = useNavigate();
  
  return (
    <Card className="border-border shadow-lg mt-4">
      <CardHeader className="bg-card rounded-t-md">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <CardTitle className="text-card-foreground">Erro de Recuperação</CardTitle>
        </div>
        <CardDescription className="text-destructive font-semibold">
          {errorMessage}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <CardDescription className="text-muted-foreground">
          Por favor, solicite um novo link de recuperação de senha para continuar.
        </CardDescription>
      </CardContent>
      <CardFooter className="bg-muted/20 pb-6">
        <Button 
          className="w-full bg-primary hover:bg-primary/90" 
          onClick={() => navigate("/auth?tab=reset")}
        >
          Solicitar novo link
        </Button>
      </CardFooter>
    </Card>
  );
}
