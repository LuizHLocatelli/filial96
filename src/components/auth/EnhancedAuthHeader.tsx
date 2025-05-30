
import { CompanyLogo } from "@/components/layout/CompanyLogo";

export function EnhancedAuthHeader() {
  return (
    <div className="text-center space-y-6 mb-8">
      {/* Company Logo Section */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/20 rounded-full blur-xl animate-pulse" />
          <div className="relative bg-gradient-to-r from-primary to-primary/90 p-4 rounded-full shadow-2xl">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <img 
                src="/lovable-uploads/c066d606-7e09-418e-a6ff-c3a603ac88c9.png" 
                alt="Filial 96 Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Text */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Bem-vindo à Filial 96
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
          Sistema de Gestão Integrado para Móveis e Crediário
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Conexão Segura</span>
        </div>
      </div>
    </div>
  );
}
