
export function ResetPasswordLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
      <div className="mt-4 text-muted-foreground">
        Verificando link de recuperação...
      </div>
    </div>
  );
}
