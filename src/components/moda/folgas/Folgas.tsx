import { useState, useEffect } from 'react';
import { PlusCircle, Calendar, Users, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useModaFolgas } from "./useModaFolgas";
import { FolgasCalendar } from "./FolgasCalendar";
import { FolgasList } from "./FolgasList";
import { FolgasSummary } from "./FolgasSummary";
import { AddFolgaDialog } from "./AddFolgaDialog";
import { useMemo } from "react";
import { isSameMonth, addDays } from "date-fns";
import { useFolgas } from './hooks/useFolgas';
import { FolgasForm } from './components/FolgasForm';
import { useModaTracking } from '@/hooks/useModaTracking';
import { Badge } from '@/components/ui/badge';

export function Folgas() {
  const { trackFolgasEvent } = useModaTracking();
  const {
    currentMonth,
    consultores,
    isLoadingConsultores,
    isLoadingFolgas,
    folgas,
    openDialog,
    setOpenDialog,
    selectedDate,
    setSelectedDate,
    selectedConsultor,
    setSelectedConsultor,
    motivo,
    setMotivo,
    handlePrevMonth,
    handleNextMonth,
    handleAddFolga,
    handleDeleteFolga: handleDeleteFolgaHook,
    getConsultorById,
    getUserNameById,
    folgasDoDiaSelecionado,
    handleDateClick,
    allUsers,
    isLoadingUsers,
    refetchFolgas,
  } = useModaFolgas();

  const {
    showForm,
    setShowForm,
    editingFolga,
    setEditingFolga,
    createFolga,
    updateFolga,
    deleteFolga,
    estatisticas
  } = useFolgas();

  const getConsultorName = (id: string): string | undefined => {
    return getConsultorById(id)?.nome;
  };

  // Estatísticas gerais
  const estatisticasGerais = useMemo(() => {
    const folgasThisMonth = folgas.filter(folga => 
      isSameMonth(new Date(folga.data), currentMonth)
    );
    
    const hoje = new Date();
    const proximos7Dias = folgas.filter(folga => {
      const folgaDate = new Date(folga.data);
      const em7Dias = addDays(hoje, 7);
      return folgaDate >= hoje && folgaDate <= em7Dias;
    });

    const consultoresComFolgaNoMes = new Set(
      folgasThisMonth.map(f => f.consultorId)
    ).size;

    return {
      totalFolgasNoMes: folgasThisMonth.length,
      proximasFolgas: proximos7Dias.length,
      consultoresComFolga: consultoresComFolgaNoMes,
      totalConsultores: consultores.length
    };
  }, [folgas, currentMonth, consultores]);

  useEffect(() => {
    // Registrar acesso à seção de folgas
    trackFolgasEvent('acesso_folgas');
  }, [trackFolgasEvent]);

  const handleCreateFolga = async (dadosFolga: any) => {
    try {
      trackFolgasEvent('criar_folga_iniciado', dadosFolga);
      await createFolga(dadosFolga);
      trackFolgasEvent('folga_criada', dadosFolga);
      setShowForm(false);
      if (refetchFolgas) {
        await refetchFolgas();
      }
    } catch (error) {
      trackFolgasEvent('erro_criar_folga', { erro: error, dados: dadosFolga });
    }
  };

  const handleUpdateFolga = async (dadosFolga: any) => {
    try {
      trackFolgasEvent('editar_folga_iniciado', { ...dadosFolga, id: editingFolga?.id });
      await updateFolga(editingFolga!.id, dadosFolga);
      trackFolgasEvent('folga_editada', { ...dadosFolga, id: editingFolga?.id });
      setEditingFolga(null);
      setShowForm(false);
      if (refetchFolgas) {
        await refetchFolgas();
      }
    } catch (error) {
      trackFolgasEvent('erro_editar_folga', { erro: error, dados: dadosFolga });
    }
  };

  const handleDeleteFolgaUnified = async (folgaId: string) => {
    try {
      const folga = folgas.find(f => f.id === folgaId);
      trackFolgasEvent('deletar_folga_iniciado', folga);
      
      await handleDeleteFolgaHook(folgaId);
      
      trackFolgasEvent('folga_deletada', folga);
      
      if (refetchFolgas) {
        setTimeout(() => refetchFolgas(), 100);
      }
    } catch (error) {
      trackFolgasEvent('erro_deletar_folga', { erro: error, folga_id: folgaId });
      throw error;
    }
  };

  const handleEditFolga = (folga: any) => {
    trackFolgasEvent('editar_folga_clicado', folga);
    setEditingFolga(folga);
    setShowForm(true);
  };

  const handleCalendarNavigation = (action: string, date?: Date) => {
    trackFolgasEvent('navegacao_calendario', { acao: action, data: date?.toISOString() });
  };

  const handleFilterChange = (filtro: string, valor: any) => {
    trackFolgasEvent('filtro_aplicado', { filtro, valor });
  };

  const handleTrackedDateClick = (date: Date) => {
    trackFolgasEvent('data_selecionada', { data: date.toISOString() });
    handleDateClick(date);
  };

  const handleTrackedNavigation = (direction: 'prev' | 'next') => {
    trackFolgasEvent('navegacao_calendario', { direcao: direction });
    if (direction === 'prev') {
      handlePrevMonth();
    } else {
      handleNextMonth();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Folgas</h2>
          <p className="text-sm text-muted-foreground">
            Gerenciamento de folgas dos consultores de moda
          </p>
        </div>
        <Button onClick={() => {
          trackFolgasEvent('adicionar_folga_clicado');
          handleDateClick(selectedDate || new Date());
        }}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Folga
        </Button>
      </div>

      {/* Cards de Estatísticas */}
                <div className="grid-responsive-stats">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Folgas no Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingFolgas ? "..." : estatisticasGerais.totalFolgasNoMes}
            </div>
            <p className="text-xs text-muted-foreground">
              Total registrado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas 7 Dias</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingFolgas ? "..." : estatisticasGerais.proximasFolgas}
            </div>
            <p className="text-xs text-muted-foreground">
              Folgas agendadas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingConsultores ? "..." : `${estatisticasGerais.consultoresComFolga}/${estatisticasGerais.totalConsultores}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Com folgas no mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Folgas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingConsultores || isLoadingFolgas ? "..." : 
                estatisticasGerais.totalConsultores > 0 ? 
                  `${Math.round((estatisticasGerais.consultoresComFolga / estatisticasGerais.totalConsultores) * 100)}%` : 
                  "0%"
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Do total de consultores
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Layout principal */}
              <div className="grid-responsive-cards lg:grid-cols-3">
        {/* Calendário */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendário de Folgas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FolgasCalendar
                currentMonth={currentMonth}
                folgas={folgas}
                handlePrevMonth={handlePrevMonth}
                handleNextMonth={handleNextMonth}
                onDateClick={handleTrackedDateClick}
                getConsultorById={getConsultorById}
              />
            </CardContent>
          </Card>
        </div>

        {/* Lista de folgas */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Folgas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FolgasList
                folgas={folgas}
                handleDeleteFolga={handleDeleteFolgaUnified}
                getConsultorById={getConsultorById}
                getUserNameById={getUserNameById}
                isLoading={isLoadingFolgas}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Dialog */}
      <FolgasForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingFolga(null);
        }}
        onSubmit={editingFolga ? handleUpdateFolga : handleCreateFolga}
        editingFolga={editingFolga}
      />

      <AddFolgaDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        consultores={consultores}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedConsultor={selectedConsultor}
        setSelectedConsultor={setSelectedConsultor}
        motivo={motivo}
        setMotivo={setMotivo}
        handleAddFolga={handleAddFolga}
        isLoading={isLoadingConsultores}
        folgasNoDia={folgasDoDiaSelecionado}
        getConsultorNameById={getConsultorName}
        getUserNameForFolga={getUserNameById}
      />

      <FolgasSummary
        folgas={folgas}
        isLoading={isLoadingFolgas}
        currentMonth={currentMonth}
        getConsultorById={getConsultorById}
      />
    </div>
  );
} 