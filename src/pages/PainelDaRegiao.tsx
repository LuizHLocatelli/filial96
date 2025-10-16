import { MapPin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackgroundPattern } from "@/components/painel-regiao/BackgroundPattern";
import { QuickAccessSection } from "@/components/painel-regiao/QuickAccessSection";
import { ToolsSection } from "@/components/painel-regiao/ToolsSection";
import { painelConfig } from "@/config/painel-regiao.config";

export default function PainelDaRegiao() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <div className="sr-only">
        <h1>Painel da Região Litoral - Acesso Rápido</h1>
        <p>Central de ferramentas e recursos para a região Litoral</p>
      </div>

      {/* Background Pattern */}
      <BackgroundPattern />

      <PageLayout spacing="normal" maxWidth="xl">
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
        >
          <PageHeader
            title="Painel da Região"
            description="Região Litoral - Acesso rápido a ferramentas e recursos"
            icon={MapPin}
            iconColor="text-primary"
          />
        </motion.div>

        {/* Seção de Acesso Rápido */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut", delay: 0.1 }}
        >
          <QuickAccessSection links={painelConfig.externalLinks} />
        </motion.div>

        {/* Seção de Ferramentas */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut", delay: 0.2 }}
        >
          <ToolsSection tools={painelConfig.internalTools} />
        </motion.div>
      </PageLayout>
    </div>
  );
}
