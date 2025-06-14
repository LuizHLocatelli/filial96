
interface ActivityStatisticsProps {
  rotinasCount: number;
  tarefasCount: number;
  concluidasCount: number;
  atrasadasCount: number;
}

export function ActivityStatistics({
  rotinasCount,
  tarefasCount,
  concluidasCount,
  atrasadasCount
}: ActivityStatisticsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 mt-4">
      <div className="text-center p-2 sm:p-3 bg-green-50 dark:bg-green-950/50 rounded-lg border dark:border-green-800 min-w-0">
        <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400 truncate">
          {rotinasCount}
        </p>
        <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 leading-tight">
          Rotinas
        </p>
      </div>
      <div className="text-center p-2 sm:p-3 bg-teal-50 dark:bg-teal-950/50 rounded-lg border dark:border-teal-800 min-w-0">
        <p className="text-base sm:text-lg font-bold text-teal-600 dark:text-teal-400 truncate">
          {tarefasCount}
        </p>
        <p className="text-[10px] sm:text-xs text-teal-600 dark:text-teal-400 leading-tight">
          Tarefas
        </p>
      </div>
      <div className="text-center p-2 sm:p-3 bg-green-50 dark:bg-green-950/50 rounded-lg border dark:border-green-800 min-w-0">
        <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400 truncate">
          {concluidasCount}
        </p>
        <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 leading-tight">
          Concluídas
        </p>
      </div>
      <div className="text-center p-2 sm:p-3 bg-red-50 dark:bg-red-950/50 rounded-lg border dark:border-red-800 min-w-0">
        <p className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400 truncate">
          {atrasadasCount}
        </p>
        <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 leading-tight">
          Atrasadas
        </p>
      </div>
    </div>
  );
}
