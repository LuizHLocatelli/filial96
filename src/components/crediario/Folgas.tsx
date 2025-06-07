
import { PlusCircle, Calendar, Users, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolgasSummary } from "./folgas/FolgasSummary";
import { FolgasCalendar } from "./folgas/FolgasCalendar";
import { FolgasList } from "./folgas/FolgasList";
import { AddFolgaDialog } from "./folgas/AddFolgaDialog";
import { ImagePreviewDialog } from "./folgas/ImagePreviewDialog";
import { useFolgas } from "./folgas/useFolgas";
import { useMemo } from "react";
import { startOfMonth, endOfMonth, isSameMonth, addDays } from "date-fns";

export function Folgas() {
  const {
    currentMonth,
    crediaristas,
    isLoadingCrediaristas,
    folgas,
    isLoadingFolgas,
    openDialog,
    setOpenDialog,
    selectedDate,
    setSelectedDate,
    selectedCrediarista,
    setSelectedCrediarista,
    motivo,
    setMotivo,
    viewImage,
    setViewImage,
    handlePrevMonth,
    handleNextMonth,
    handleAddFolga,
    handleDeleteFolga,
    getCrediaristaById,
    getUserNameById,
    weeks,
    allUsers,
    isLoadingUsers,
    folgasDoDiaSelecionado,
    handleDateClick,
  } = useFolgas();
  
  // Wrapper para obter apenas o nome do crediarista
  const getCrediaristaName = (id: string): string | undefined => {
    return getCrediaristaById(id)?.nome;
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

    const crediariastasComFolgaNoMes = new Set(
      folgasThisMonth.map(f => f.crediaristaId)
    ).size;

    return {
      totalFolgasNoMes: folgasThisMonth.length,
      proximasFolgas: proximos7Dias.length,
      crediariastasComFolga: crediariastasComFolgaNoMes,
      totalCrediaristas: crediaristas.length
    };
  }, [folgas, currentMonth, crediaristas]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Folgas</h2>
          <p className="text-sm text-muted-foreground">
            Gerenciamento de folgas dos crediaristas
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
            <CardTitle className="text-sm font-medium">Crediaristas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingCrediaristas ? "..." : `${estatisticas.crediariastasComFolga}/${estatisticas.totalCrediaristas}`}
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
              {isLoadingCrediaristas || isLoadingFolgas ? "..." : 
                estatisticas.totalCrediaristas > 0 ? 
                  `${Math.round((estatisticas.crediariastasComFolga / estatisticas.totalCrediaristas) * 100)}%` : 
                  "0%"
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Do total de crediaristas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <FolgasCalendar
          currentMonth={currentMonth}
          crediaristas={crediaristas}
          folgas={folgas}
          isLoadingCrediaristas={isLoadingCrediaristas}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onDateClick={handleDateClick}
        />

        <div className="mt-8">
          <h3 className="font-medium text-lg mb-4">Lista de Folgas</h3>
          <FolgasList
            folgas={folgas}
            getCrediaristaById={getCrediaristaById}
            onDeleteFolga={handleDeleteFolga}
            onAddFolga={() => handleDateClick(selectedDate || new Date())}
            getUserNameById={getUserNameById}
          />
        </div>
      </div>
      
      <AddFolgaDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedCrediarista={selectedCrediarista}
        setSelectedCrediarista={setSelectedCrediarista}
        motivo={motivo}
        setMotivo={setMotivo}
        crediaristas={crediaristas}
        onAddFolga={handleAddFolga}
        folgasNoDia={folgasDoDiaSelecionado}
        getCrediaristaNameById={getCrediaristaName}
        getUserNameForFolga={getUserNameById}
      />
      
      <ImagePreviewDialog
        viewImage={viewImage}
        setViewImage={setViewImage}
      />

      <FolgasSummary
        crediaristas={crediaristas}
        folgas={folgas}
        currentMonth={currentMonth}
        isLoading={isLoadingCrediaristas || isLoadingFolgas}
        getCrediaristaById={getCrediaristaById}
      />
    </div>
  );
}
