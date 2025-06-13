
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
      <div className="text-center p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border dark:border-blue-800 min-w-0">
        <p className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 truncate">
          {rotinasCount}
        </p>
        <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 leading-tight">
          Rotinas
        </p>
      </div>
      <div className="text-center p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border dark:border-purple-800 min-w-0">
        <p className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400 truncate">
          {tarefasCount}
        </p>
        <p className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 leading-tight">
          Tarefas
        </p>
      </div>
      <div className="text-center p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border dark:border-green-800 min-w-0">
        <p className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400 truncate">
          {concluidasCount}
        </p>
        <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 leading-tight">
          Concluídas
        </p>
      </div>
      <div className="text-center p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border dark:border-red-800 min-w-0">
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
