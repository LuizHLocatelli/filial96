import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Phone,
  Mail,
  Link as LinkIcon,
  ExternalLink,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackgroundPattern } from "@/components/painel-regiao/BackgroundPattern";
import { CalculatorThemeToggle } from "@/components/theme/CalculatorThemeToggle";
import { procedimentosSSC, categorias, Procedimento } from "@/data/procedimentos-ssc";
import { AdminProcedimentosButton } from "@/components/ssc/AdminProcedimentosButton";
import { useProcedimentosSSC } from "@/hooks/useProcedimentosSSC";
import { ProcedimentoSSC } from "@/types/ssc-procedimentos";
import { useToast } from "@/hooks/use-toast";

// Função para converter Procedimento estático para ProcedimentoSSC
function toProcedimentoSSC(procedimento: Procedimento): ProcedimentoSSC {
  return {
    id: procedimento.id,
    fabricante: procedimento.fabricante,
    categoria: procedimento.categoria,
    procedimento: procedimento.procedimento,
    canais: procedimento.canais,
    observacoes: procedimento.observacoes,
    links_principais: procedimento.linksPrincipais,
    contatos_exclusivos: procedimento.contatosExclusivos,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export default function ProcedimentosSSC() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [useDatabase, setUseDatabase] = useState(false);

  const {
    procedimentos: procedimentosDb,
    loading: loadingDb,
    fetchProcedimentos,
  } = useProcedimentosSSC();

  // Usar dados do banco se disponíveis, senão usar dados estáticos
  const allProcedimentos = useMemo(() => {
    if (useDatabase && procedimentosDb.length > 0) {
      return procedimentosDb;
    }
    return procedimentosSSC.map(toProcedimentoSSC);
  }, [useDatabase, procedimentosDb]);

  // Tentar carregar do banco na primeira renderização
  useEffect(() => {
    const tryFetchDb = async () => {
      try {
        await fetchProcedimentos();
        setUseDatabase(true);
      } catch (error) {
        console.log("Banco não disponível, usando dados estáticos");
        setUseDatabase(false);
      }
    };
    tryFetchDb();
  }, []);

  // Filtrar procedimentos
  const filteredProcedimentos = useMemo(() => {
    return allProcedimentos.filter((proc) => {
      const matchesSearch =
        searchTerm === "" ||
        proc.fabricante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proc.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proc.procedimento.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || proc.categoria === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, allProcedimentos]);

  // Função para renderizar ícone baseado no tipo de canal
  const getChannelIcon = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    if (
      tipoLower.includes("sac") ||
      tipoLower.includes("fone") ||
      tipoLower.includes("telefone")
    ) {
      return <Phone className="h-3 w-3" />;
    }
    if (tipoLower.includes("email") || tipoLower.includes("e-mail")) {
      return <Mail className="h-3 w-3" />;
    }
    return <LinkIcon className="h-3 w-3" />;
  };

  // Função para verificar se é URL
  const isUrl = (text: string) => {
    return text.startsWith("http://") || text.startsWith("https://");
  };

  // Formatar texto para cópia
  const formatarParaCopia = (proc: ProcedimentoSSC): string => {
    let texto = `🏭 **${proc.fabricante}** - ${proc.categoria}\n\n`;
    texto += `📋 *Procedimento:*\n${proc.procedimento}\n\n`;
    texto += `📞 *Canais de Atendimento:*\n`;
    proc.canais.forEach((canal) => {
      texto += `• ${canal.tipo}: ${canal.valor}`;
      if (canal.horario) texto += ` (${canal.horario})`;
      texto += `\n`;
    });
    if (proc.observacoes && proc.observacoes.length > 0) {
      texto += `\n📝 *Observações:*\n`;
      proc.observacoes.forEach((obs) => {
        texto += `• ${obs}\n`;
      });
    }
    return texto;
  };

  // Copiar para clipboard
  const copiarProcedimento = async (proc: ProcedimentoSSC) => {
    const texto = formatarParaCopia(proc);
    try {
      await navigator.clipboard.writeText(texto);
      setCopiedId(proc.id);
      toast({
        title: "Copiado!",
        description: "Procedimento copiado para enviar ao cliente",
        duration: 2000,
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o procedimento",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <div className="sr-only">
        <h1>Procedimentos SSC - Assistência Técnica por Fabricante</h1>
        <p>
          Guia completo de procedimentos de assistência técnica para todos os
          fabricantes
        </p>
      </div>

      {/* Background Pattern */}
      <BackgroundPattern />

      <PageLayout spacing="normal" maxWidth="xl">
        {/* Header com navegação */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0 }
          }
          transition={
            shouldReduceMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }
          }
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/painel-da-regiao")}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Painel da Região
            </Button>
            <div className="flex items-center gap-2">
              {loadingDb && (
                <Badge variant="outline" className="text-xs">
                  Carregando...
                </Badge>
              )}
              <AdminProcedimentosButton />
              <CalculatorThemeToggle />
            </div>
          </div>

          <PageHeader
            title="Procedimentos SSC"
            description="Guia de assistência técnica por fabricante"
            icon={AlertCircle}
            iconColor="text-primary"
          />
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={
            shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.4, ease: "easeOut", delay: 0.1 }
          }
        >
          <Card className="glass-card mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar fabricante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-11 calculadora-input focus:ring-0 focus:ring-offset-0"
                  />
                </div>

                {/* Filtro por categoria */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-11 calculadora-select focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Filtrar por categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contador de resultados */}
              <div className="mt-4 text-sm text-muted-foreground">
                {filteredProcedimentos.length === allProcedimentos.length
                  ? `${allProcedimentos.length} fabricantes cadastrados`
                  : `${filteredProcedimentos.length} de ${allProcedimentos.length} fabricantes`}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lista de Procedimentos */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={
            shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.4, ease: "easeOut", delay: 0.2 }
          }
          className="space-y-4"
        >
          {filteredProcedimentos.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Nenhum procedimento encontrado com os filtros selecionados.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredProcedimentos.map((proc, index) => (
              <motion.div
                key={proc.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0 }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.3, ease: "easeOut", delay: index * 0.05 }
                }
              >
                <Card className="glass-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg sm:text-xl mb-2">
                          {proc.fabricante}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {proc.categoria}
                        </Badge>
                      </div>
                      <Button
                        variant={copiedId === proc.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => copiarProcedimento(proc)}
                        className="gap-1 shrink-0"
                      >
                        {copiedId === proc.id ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Procedimento */}
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <h4 className="text-sm font-semibold mb-2 text-primary">
                        Procedimento
                      </h4>
                      <p className="text-sm text-foreground leading-relaxed">
                        {proc.procedimento}
                      </p>
                    </div>

                    {/* Canais de Atendimento */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Canais de Atendimento
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {proc.canais.map((canal, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                          >
                            <div className="flex items-start gap-2">
                              <div className="mt-0.5 text-muted-foreground">
                                {getChannelIcon(canal.tipo)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  {canal.tipo}
                                </p>
                                {isUrl(canal.valor) ? (
                                  <a
                                    href={canal.valor}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline flex items-center gap-1 break-all"
                                  >
                                    Acessar
                                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                  </a>
                                ) : (
                                  <p className="text-sm font-mono break-all">
                                    {canal.valor}
                                  </p>
                                )}
                                {canal.horario && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {canal.horario}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Links Principais */}
                    {proc.links_principais && proc.links_principais.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <LinkIcon className="h-4 w-4" />
                          Links Úteis
                        </h4>
                        <div className="space-y-2">
                          {proc.links_principais.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-muted/50 rounded hover:bg-muted transition-colors group"
                            >
                              <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                              <span className="text-sm group-hover:text-primary">
                                {link.titulo}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contatos Exclusivos */}
                    {proc.contatos_exclusivos &&
                      proc.contatos_exclusivos.length > 0 && (
                        <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                          <h4 className="text-sm font-semibold mb-2 text-amber-800 dark:text-amber-300 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Contatos Exclusivos (Uso Interno)
                          </h4>
                          <div className="space-y-2">
                            {proc.contatos_exclusivos.map((contato, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="font-medium">{contato.nome}</span>
                                <span className="text-muted-foreground">
                                  {" "}
                                  - {contato.tipo}:{" "}
                                </span>
                                <span className="font-mono">{contato.valor}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Observações */}
                    {proc.observacoes && proc.observacoes.length > 0 && (
                      <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                        <h4 className="text-sm font-semibold mb-2 text-blue-800 dark:text-blue-300 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Observações Importantes
                        </h4>
                        <ul className="space-y-1">
                          {proc.observacoes.map((obs, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-blue-700 dark:text-blue-300 flex gap-2"
                            >
                              <span className="flex-shrink-0">•</span>
                              <span>{obs}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Footer Informativo */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={
            shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.4, ease: "easeOut", delay: 0.3 }
          }
          className="mt-8"
        >
          <Card className="glass-card">
            <CardContent className="py-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Informações Gerais</h3>
              <p className="text-sm text-muted-foreground mb-4">
                ZEEV - Sistema de Atendimentos Críticos
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                O SSC (Serviço de Suporte ao Cliente) disponibiliza atendimento
                para casos críticos dentro do sistema ZEEV (antigo Orquestra).
              </p>
              <a
                href="https://login.zeev.it/2.0/?c=eyJhcHBDb2RlljoiliwibGFuZ3VhZ2UiOiJwdC1CUilslm9yaWdpbil6lmh0dHBzOi8vemVldi5sZWJlcy5jb20uYnIvliwidXJsUmVkaXJlY3QiOiJiLCJmZWVkYmFjayI6IiIsImNvZFN5c3RlbSI6NX0="
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Acessar ZEEV
                <ExternalLink className="h-3 w-3" />
              </a>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>
                  Marcas não encontradas no ZEEV possuem sites alternativos:
                </p>
                <p>
                  Consul/Brastemp - SAR | Philips e AOC - PAR | Britânia e
                  Philco - Site próprio | Apple - Contato direto
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </PageLayout>
    </div>
  );
}
