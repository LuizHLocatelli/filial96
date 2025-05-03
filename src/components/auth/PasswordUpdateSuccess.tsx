
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PasswordUpdateSuccess() {
  return (
    <Alert variant="default" className="bg-green-50 border-green-200">
      <AlertDescription className="flex items-center gap-2 text-green-800">
        <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>
          Senha redefinida com sucesso! Você está sendo redirecionado para a página de login.
        </span>
      </AlertDescription>
    </Alert>
  );
}
