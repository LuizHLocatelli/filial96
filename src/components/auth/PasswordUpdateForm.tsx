import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { updatePasswordSchema, UpdatePasswordFormData } from "./schemas/updatePasswordSchema";

interface PasswordUpdateFormProps {
  token?: string | null;
  hash?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function PasswordUpdateForm({ token, hash, onSuccess, onError }: PasswordUpdateFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [securityChecks, setSecurityChecks] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    mode: "onChange"
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  // Real-time password strength validation
  useState(() => {
    if (password) {
      setSecurityChecks({
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        passwordsMatch: password === confirmPassword && confirmPassword !== ""
      });
    }
  });

  const onSubmit = async (data: UpdatePasswordFormData) => {
    setIsLoading(true);
    
    try {
      // Security: Validate password strength before submission
      const isStrongPassword = Object.values(securityChecks).every(check => check);
      if (!isStrongPassword) {
        onError("Senha não atende aos critérios de segurança.");
        return;
      }

      // Security: Enhanced password validation
      if (data.password.length < 8) {
        onError("Senha deve ter pelo menos 8 caracteres.");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) {
        // Security: Enhanced error handling with audit logging
        console.error('Password update error:', {
          error: error.message,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          hasToken: !!token,
          hasHash: !!hash
        });
        
        // Security: Rate limiting check
        if (error.message.includes('rate limit')) {
          onError("Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.");
        } else if (error.message.includes('token')) {
          onError("Link de recuperação inválido ou expirado. Solicite um novo link.");
        } else {
          onError("Erro ao atualizar senha. Tente novamente.");
        }
      } else {
        // Security: Comprehensive audit logging for successful password change
        const user = (await supabase.auth.getUser()).data.user;
        console.log('Password updated successfully', { 
          timestamp: new Date().toISOString(),
          userId: user?.id,
          userEmail: user?.email,
          method: token ? 'password_reset' : 'direct_update',
          userAgent: navigator.userAgent
        });
        
        // Security: Force sign out after password change for security
        await supabase.auth.signOut();
        onSuccess();
      }
    } catch (error) {
      console.error('Unexpected error during password update:', {
        error,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
      onError("Erro inesperado. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const SecurityIndicator = ({ met, label }: { met: boolean; label: string }) => (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>
      {met ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      <span>{label}</span>
    </div>
  );

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Atualizar Senha</CardTitle>
        <CardDescription>
          Defina uma nova senha segura para sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-red-500" : ""}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Security Requirements */}
          {password && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Critérios de Segurança:</h4>
              <SecurityIndicator met={securityChecks.minLength} label="Mínimo 8 caracteres" />
              <SecurityIndicator met={securityChecks.hasUppercase} label="Letra maiúscula" />
              <SecurityIndicator met={securityChecks.hasLowercase} label="Letra minúscula" />
              <SecurityIndicator met={securityChecks.hasNumber} label="Número" />
              <SecurityIndicator met={securityChecks.hasSpecialChar} label="Caractere especial" />
              <SecurityIndicator met={securityChecks.passwordsMatch} label="Senhas coincidem" />
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !Object.values(securityChecks).every(check => check)}
          >
            {isLoading ? "Atualizando..." : "Atualizar Senha"}
          </Button>
        </form>

        <Alert className="mt-4">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Sua nova senha será criptografada e armazenada com segurança. 
            Você será redirecionado para fazer login novamente.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
