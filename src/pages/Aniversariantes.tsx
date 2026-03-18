import { useState, useMemo } from "react";
import { format, parseISO, isValid } from "date-fns";
import { Plus, Gift, Trash2, CalendarDays, MapPin, ArrowLeft, Star } from "@/components/ui/emoji-icons";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AniversarianteFormDialog } from "@/components/aniversariantes/AniversarianteFormDialog";
import { useAniversariantes } from "@/hooks/aniversariantes/useAniversariantes";
import { Aniversariante, AniversarianteFormData } from "@/types/aniversariantes";
import { BackgroundPattern } from "@/components/painel-regiao/BackgroundPattern";

export default function Aniversariantes() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { aniversariantes, isLoading, addAniversariante, isAdding, removeAniversariante } = useAniversariantes();

  const handleAdd = (data: AniversarianteFormData) => {
    addAniversariante(data, {
      onSuccess: () => setIsDialogOpen(false)
    });
  };

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Group by month and order by day
  const groupedAniversariantes = useMemo(() => {
    const groups: Record<number, Aniversariante[]> = {};
    
    // Inicializar os 12 meses
    for (let i = 0; i < 12; i++) {
      groups[i] = [];
    }

    aniversariantes.forEach(aniv => {
      const date = parseISO(aniv.data_aniversario);
      if (isValid(date)) {
        const month = date.getMonth();
        groups[month].push(aniv);
      }
    });

    // Ordenar cada grupo por dia
    Object.keys(groups).forEach(key => {
      groups[Number(key)].sort((a, b) => {
        const dateA = parseISO(a.data_aniversario);
        const dateB = parseISO(b.data_aniversario);
        return dateA.getDate() - dateB.getDate();
      });
    });

    return groups;
  }, [aniversariantes]);

  // Determine the next upcoming birthday(s)
  const proximosAniversariantes = useMemo(() => {
    if (!aniversariantes.length) return [];
    
    const nextList: Aniversariante[] = [];
    let foundUpcoming = false;

    // Verificar próximos meses deste ano a partir de hoje
    for (let m = currentMonth; m < 12; m++) {
      const pessoasDoMes = groupedAniversariantes[m];
      if (pessoasDoMes && pessoasDoMes.length > 0) {
        for (const pessoa of pessoasDoMes) {
          const diaAniv = parseISO(pessoa.data_aniversario).getDate();
          
          if (m > currentMonth || (m === currentMonth && diaAniv >= currentDay)) {
            if (!foundUpcoming) {
              nextList.push(pessoa);
              foundUpcoming = true;
            } else {
              // Adiciona pessoas que fazem aniversário no mesmo dia
              const firstDate = parseISO(nextList[0].data_aniversario);
              if (diaAniv === firstDate.getDate() && m === firstDate.getMonth()) {
                nextList.push(pessoa);
              }
            }
          }
        }
      }
      if (foundUpcoming) break;
    }

    // Se não achou ninguém neste ano, o próximo é do ano que vem (começo da lista de janeiro em diante)
    if (!foundUpcoming) {
      for (let m = 0; m < currentMonth; m++) {
        const pessoasDoMes = groupedAniversariantes[m];
        if (pessoasDoMes && pessoasDoMes.length > 0) {
          for (const pessoa of pessoasDoMes) {
            if (!foundUpcoming) {
              nextList.push(pessoa);
              foundUpcoming = true;
            } else {
              const firstDate = parseISO(nextList[0].data_aniversario);
              const diaAniv = parseISO(pessoa.data_aniversario).getDate();
              if (diaAniv === firstDate.getDate() && m === firstDate.getMonth()) {
                nextList.push(pessoa);
              }
            }
          }
        }
        if (foundUpcoming) break;
      }
    }

    return nextList;
  }, [aniversariantes, groupedAniversariantes, currentMonth, currentDay]);

  // Criar uma lista de meses ordenada a partir do mês atual
  const orderedMonthIndices = useMemo(() => {
    const indices = [];
    for (let i = 0; i < 12; i++) {
      indices.push((currentMonth + i) % 12);
    }
    return indices;
  }, [currentMonth]);

  return (
    <div className="min-h-screen bg-background pb-10">
      <BackgroundPattern />

      <PageLayout spacing="normal" maxWidth="xl">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/painel-da-regiao')}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Painel da Região
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <PageHeader
            title="Aniversariantes da Região"
            description="Controle e visualização de todos os aniversariantes das filiais."
            icon={Gift}
            iconColor="text-primary"
          />
          
          <Button onClick={() => setIsDialogOpen(true)} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Aniversariante
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : aniversariantes.length === 0 ? (
          <Card className="glass-card text-center py-16">
            <CardContent>
              <div className="flex justify-center mb-4">
                <Gift className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-medium mb-2">Nenhum aniversariante cadastrado</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Comece adicionando as pessoas e as filiais para acompanhar os aniversários da região.
              </p>
              <Button onClick={() => setIsDialogOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Aniversariante
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Banner de Próximos Aniversariantes */}
            {proximosAniversariantes.length > 0 && (
              <Card className="glass-card border-primary/20 bg-primary/10 shadow-md">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-shrink-0 h-14 w-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm">
                    <Star className="h-7 w-7" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold text-primary mb-1">
                      {proximosAniversariantes.length === 1 ? 'Próximo Aniversariante!' : 'Próximos Aniversariantes!'}
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
                      {proximosAniversariantes.map(p => {
                        const anivDate = parseISO(p.data_aniversario);
                        const isToday = anivDate.getMonth() === currentMonth && anivDate.getDate() === currentDay;
                        return (
                          <div key={p.id} className="flex flex-col">
                            <span className="font-semibold text-foreground text-lg">{p.nome}</span>
                            <span className="text-sm text-muted-foreground">{p.filial}</span>
                            <Badge variant="outline" className={`w-fit mt-1 self-center sm:self-start border-transparent ${isToday ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground'}`}>
                              {isToday ? "Hoje!" : `${format(anivDate, 'dd')} de ${monthNames[anivDate.getMonth()]}`}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista dos Meses Otimizada */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orderedMonthIndices.map(monthIndex => {
                const pessoas = groupedAniversariantes[monthIndex];
                if (pessoas.length === 0) return null;

                const isCurrentMonth = monthIndex === currentMonth;

                return (
                  <Card key={monthIndex} className={`glass-card overflow-hidden h-fit transition-all ${isCurrentMonth ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}>
                    <CardHeader className={`pb-3 ${isCurrentMonth ? 'bg-primary/10' : 'bg-muted/30'} border-b flex flex-row items-center justify-between`}>
                      <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                        {monthNames[monthIndex]}
                        {isCurrentMonth && <Badge variant="outline" className="ml-2 text-xs bg-primary/20 text-primary border-transparent">Mês Atual</Badge>}
                      </CardTitle>
                      <CalendarDays className={`h-5 w-5 ${isCurrentMonth ? 'text-primary' : 'text-muted-foreground'}`} />
                    </CardHeader>
                    <CardContent className="p-0">
                      <ul className="divide-y divide-border/50">
                        {pessoas.map(pessoa => {
                          const anivDate = parseISO(pessoa.data_aniversario);
                          const isToday = isCurrentMonth && anivDate.getDate() === currentDay;
                          
                          return (
                            <li 
                              key={pessoa.id} 
                              className={`p-4 flex items-center justify-between transition-colors hover:bg-accent/50 group ${isToday ? 'bg-primary/10' : ''}`}
                            >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className={`flex items-center justify-center h-10 w-10 shrink-0 rounded-full font-bold text-lg ${isToday ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground'}`}>
                                  {format(anivDate, 'dd')}
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                  <div className="flex items-center gap-2">
                                    <p className={`font-semibold text-base truncate ${isToday ? 'text-primary' : 'text-foreground'}`} title={pessoa.nome}>
                                      {pessoa.nome}
                                    </p>
                                    {isToday && <Gift className="h-3 w-3 text-primary shrink-0" />}
                                  </div>
                                  <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                                    <MapPin className="h-3 w-3 mr-1 shrink-0" />
                                    <span className="truncate" title={pessoa.filial}>{pessoa.filial}</span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0 focus:opacity-100"
                                onClick={() => removeAniversariante(pessoa.id)}
                                title="Remover"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </PageLayout>

      <AniversarianteFormDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSubmit={handleAdd}
        isSubmitting={isAdding}
      />
    </div>
  );
}
