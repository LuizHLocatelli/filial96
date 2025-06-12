import { CompanyLogo } from "@/components/layout/CompanyLogo";

export function EnhancedAuthHeader() {
  return (
    <div className="text-center space-y-4 sm:space-y-6 mb-6 sm:mb-8">
      {/* Company Logo Section */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/20 rounded-full blur-xl animate-pulse" />
          <div className="relative bg-gradient-to-r from-primary to-primary/90 p-3 sm:p-4 rounded-full shadow-2xl">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center">
              <img 
                src="/lovable-uploads/4061bf61-813c-40ee-a09e-17b6f303bc20.png" 
                alt="Filial 96 Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Text */}
      <div className="space-y-2 sm:space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Bem-vindo à Filial 96
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto leading-relaxed">
          Sistema de Gestão
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Conexão Segura</span>
        </div>
      </div>
    </div>
  );
}
