import React, { useState } from 'react';
import { Key, Eye, EyeOff, Shield, Copy, Check, Loader2, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserWithStats } from '../types';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { StandardDialogHeader, StandardDialogContent, StandardDialogFooter } from '@/components/ui/standard-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { getInitials } from '../utils';

interface ChangePasswordFormProps {
  user: UserWithStats;
  onClose: () => void;
}

export function ChangePasswordForm({ user, onClose }: ChangePasswordFormProps) {
  const isMobile = useIsMobile();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculateStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    setPasswordStrength(calculateStrength(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.admin.updateUserById(user.id, {
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: `Senha do usuário ${user.name} alterada com sucesso!`
      });

      setNewPassword('');
      setConfirmPassword('');
      setPasswordStrength(0);
      onClose();
    } catch (error: unknown) {
      console.error('Erro ao alterar senha:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao alterar senha do usuário";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
    setPasswordStrength(calculateStrength(password));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copiado!",
      description: "Senha copiada para a área de transferência"
    });
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-yellow-500';
    if (passwordStrength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'Fraca';
    if (passwordStrength === 2) return 'Média';
    if (passwordStrength === 3) return 'Boa';
    return 'Forte';
  };

  return (
    <>
      <StandardDialogHeader
        icon={Key}
        iconColor="amber"
        title="Alterar Senha"
        description={`Redefinir senha de acesso para ${user.name}`}
        onClose={onClose}
        loading={isLoading}
      />

      <StandardDialogContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* User Preview */}
        <div className="flex items-center gap-4 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 font-semibold">
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user.name}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
          <Shield className="h-5 w-5 text-amber-600 flex-shrink-0" />
        </div>

        {/* New Password Field */}
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            Nova Senha
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="Digite a nova senha"
              required
              minLength={6}
              disabled={isLoading}
              className="h-11 pr-24"
            />
            <div className="absolute right-0 top-0 h-full flex items-center">
              {newPassword && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 mr-1"
                  onClick={copyToClipboard}
                  title="Copiar senha"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 mr-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="space-y-1">
              <div className="flex gap-1 h-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`flex-1 rounded-full transition-colors ${
                      passwordStrength >= level ? getStrengthColor() : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Força da senha: <span className={passwordStrength >= 3 ? 'text-green-600 font-medium' : ''}>
                  {getStrengthLabel()}
                </span>
              </p>
            </div>
          )}
        </div>
        
        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            Confirmar Senha
          </Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme a nova senha"
            required
            minLength={6}
            disabled={isLoading}
            className="h-11"
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              As senhas não coincidem
            </p>
          )}
        </div>

        {/* Generate Password Button */}
        <Button
          type="button"
          variant="outline"
          onClick={generatePassword}
          disabled={isLoading}
          className="w-full h-11"
        >
          <Key className="h-4 w-4 mr-2" />
          Gerar Senha Segura
        </Button>
      </form>
      </StandardDialogContent>

      <StandardDialogFooter className={isMobile ? 'flex-col gap-2' : 'flex-row gap-3'}>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={isLoading}
          className={isMobile ? 'w-full h-11' : 'flex-1 h-11'}
        >
          Cancelar
        </Button>
        <Button 
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !newPassword || newPassword !== confirmPassword}
          className={`${isMobile ? 'w-full h-11' : 'flex-1 h-11'} gap-2`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Alterando...
            </>
          ) : (
            <>
              <Key className="h-4 w-4" />
              Alterar Senha
            </>
          )}
        </Button>
      </StandardDialogFooter>
    </>
  );
}
