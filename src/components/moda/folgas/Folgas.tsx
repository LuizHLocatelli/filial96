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

export function Folgas() {
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
    handleDeleteFolga,
    getConsultorById,
    getUserNameById,
    folgasDoDiaSelecionado,
    handleDateClick,
    allUsers,
    isLoadingUsers,
  } = useModaFolgas();

  const getConsultorName = (id: string): string | undefined => {
    return getConsultorById(id)?.nome;
  };

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Folgas</h2>
          <p className="text-sm text-muted-foreground">
            Gerenciamento de folgas dos consultores de moda
          </p>
        </div>
        <Button onClick={() => handleDateClick(selectedDate || new Date())}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Folga
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Folgas no Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingFolgas ? "..." : estatisticas.totalFolgasNoMes}
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
              {isLoadingFolgas ? "..." : estatisticas.proximasFolgas}
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
              {isLoadingConsultores ? "..." : `${estatisticas.consultoresComFolga}/${estatisticas.totalConsultores}`}
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
                estatisticas.totalConsultores > 0 ? 
                  `${Math.round((estatisticas.consultoresComFolga / estatisticas.totalConsultores) * 100)}%` : 
                  "0%"
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Do total de consultores
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <FolgasCalendar
          currentMonth={currentMonth}
          folgas={folgas}
          handlePrevMonth={handlePrevMonth}
          handleNextMonth={handleNextMonth}
          onDateClick={handleDateClick}
          getConsultorById={getConsultorById}
        />

        <div className="mt-8">
          <h3 className="font-medium text-lg mb-4">Lista de Folgas</h3>
          <FolgasList
            folgas={folgas}
            isLoading={isLoadingFolgas}
            handleDeleteFolga={handleDeleteFolga}
            getConsultorById={getConsultorById}
            getUserNameById={getUserNameById}
          />
        </div>
      </div>

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