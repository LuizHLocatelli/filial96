
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { useTokenValidator } from "@/components/auth/TokenValidator";
import { ResetPasswordError } from "@/components/auth/ResetPasswordError";
import { ResetPasswordLoading } from "@/components/auth/ResetPasswordLoading";

export default function ResetPassword() {
  const { isValidating, isValidSession, error, token, hash } = useTokenValidator();

  // Enhanced debugging for the reset password flow
  console.log("ResetPassword component state:", {
    isValidating,
    isValidSession,
    hasError: !!error,
    token: token ? "present" : "absent",
    hash: hash ? "present" : "absent"
  });

  // Display loading state
  if (isValidating) {
    return <ResetPasswordLoading />;
  }

  // Display error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted px-4">
        <div className="w-full max-w-md text-center">
          <AuthHeader />
          <ResetPasswordError errorMessage={error} />
        </div>
      </div>
    );
  }

  // If session is not valid, this shouldn't render due to the error check above
  if (!isValidSession) {
    console.error("Invalid session but no error message");
    return null;
  }

  // Main form
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted px-4">
      <div className="w-full max-w-md">
        <AuthHeader />

        <Card className="border-border shadow-lg">
          <CardHeader className="bg-card rounded-t-md">
            <CardTitle className="text-card-foreground">Redefinir senha</CardTitle>
            <CardDescription className="text-muted-foreground">
              Digite e confirme sua nova senha abaixo.
            </CardDescription>
          </CardHeader>
          <UpdatePasswordForm token={token} hash={hash} />
        </Card>
      </div>
    </div>
  );
}
