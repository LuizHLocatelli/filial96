
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMoveiFolgas } from "./useMoveiFolgas";
import { FolgasCalendar } from "./FolgasCalendar";
import { FolgasList } from "./FolgasList";
import { FolgasSummary } from "./FolgasSummary";
import { AddFolgaDialog } from "./AddFolgaDialog";

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
    weeks,
  } = useMoveiFolgas();

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setOpenDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Folgas</h2>
          <p className="text-sm text-muted-foreground">
            Gerenciamento de folgas dos consultores de móveis
          </p>
        </div>
        <Button onClick={() => setOpenDialog(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Folga
        </Button>
      </div>

      <FolgasSummary
        folgas={folgas}
        isLoading={isLoadingFolgas}
        currentMonth={currentMonth}
        getConsultorById={getConsultorById}
      />

      <div className="space-y-6">
        <FolgasCalendar
          currentMonth={currentMonth}
          weeks={weeks}
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
      />
    </div>
  );
}
