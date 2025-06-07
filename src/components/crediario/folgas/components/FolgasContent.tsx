
import { FolgasCalendar } from "../FolgasCalendar";
import { FolgasList } from "../FolgasList";
import { FolgasSummary } from "../FolgasSummary";
import { Crediarista, Folga } from "../types";

interface FolgasContentProps {
  currentMonth: Date;
  crediaristas: Crediarista[];
  folgas: Folga[];
  isLoadingCrediaristas: boolean;
  isLoadingFolgas: boolean;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  handleDateClick: (date: Date) => void;
  handleDeleteFolga: (id: string) => void;
  getCrediaristaById: (id: string) => Crediarista | undefined;
  getUserNameById: (id: string) => string | undefined;
  selectedDate: Date | null;
}

export function FolgasContent({
  currentMonth,
  crediaristas,
  folgas,
  isLoadingCrediaristas,
  isLoadingFolgas,
  handlePrevMonth,
  handleNextMonth,
  handleDateClick,
  handleDeleteFolga,
  getCrediaristaById,
  getUserNameById,
  selectedDate,
}: FolgasContentProps) {
  return (
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
