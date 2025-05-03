
export function ResetPasswordLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <div className="text-lg font-medium text-muted-foreground">
          Verificando link de recuperação...
        </div>
        <div className="text-sm text-muted-foreground max-w-md text-center">
          Estamos validando seu token de recuperação. Por favor, aguarde um momento.
        </div>
      </div>
    </div>
  );
}
