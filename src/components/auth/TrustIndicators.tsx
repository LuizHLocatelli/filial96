
import { Shield, Users, Clock, Award } from "lucide-react";

export function TrustIndicators() {
  const indicators = [
    {
      icon: Shield,
      title: "Segurança SSL",
      description: "Dados protegidos com criptografia"
    },
    {
      icon: Users,
      title: "Equipe Confiável",
      description: "Sistema usado por toda a filial"
    },
    {
      icon: Clock,
      title: "Disponível 24/7",
      description: "Acesso a qualquer momento"
    },
    {
      icon: Award,
      title: "Sistema Certificado",
      description: "Tecnologia moderna e confiável"
    }
  ];

  return (
    <div className="mt-8 pt-8 border-t border-border/50">
      <h3 className="text-center text-sm font-medium text-muted-foreground mb-6">
        Por que escolher nosso sistema?
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {indicators.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-tight">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground leading-tight mt-1">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
