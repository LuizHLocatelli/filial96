import React from "react";
import { UserRole } from "@/types";
import { Crown, Shield, User } from "lucide-react";

export const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'gerente': return <Crown className="h-4 w-4 mr-2" />;
    case 'crediarista': return <Shield className="h-4 w-4 mr-2" />;
    case 'consultor_moveis': return <User className="h-4 w-4 mr-2" />;
    case 'consultor_moda': return <User className="h-4 w-4 mr-2" />;
    default: return <User className="h-4 w-4 mr-2" />;
  }
};

export const getInitials = (name: string) => {
  if (!name) return "";
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.substring(0, 2).toUpperCase();
};

export const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}; 