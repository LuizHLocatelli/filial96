import React from "react";
import { AuthBackgroundElements } from "@/components/auth/AuthBackgroundElements";

interface AuthLayoutProps {
  branding: React.ReactNode;
  form: React.ReactNode;
}

export function AuthLayout({ branding, form }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <AuthBackgroundElements />
      
      <div className="relative hidden lg:flex flex-col items-center justify-center p-12 text-white bg-primary/80 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-green-700 opacity-90" />
        <div className="relative z-10 w-full max-w-md">
          {branding}
        </div>
      </div>
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="block lg:hidden">
            {branding}
          </div>
          {form}
        </div>
      </div>
    </div>
  );
} 