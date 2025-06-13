
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border dark:border-blue-800">
        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{rotinasCount}</p>
        <p className="text-xs text-blue-600 dark:text-blue-400">Rotinas</p>
      </div>
      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border dark:border-purple-800">
        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{tarefasCount}</p>
        <p className="text-xs text-purple-600 dark:text-purple-400">Tarefas</p>
      </div>
      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border dark:border-green-800">
        <p className="text-lg font-bold text-green-600 dark:text-green-400">{concluidasCount}</p>
        <p className="text-xs text-green-600 dark:text-green-400">Concluídas</p>
      </div>
      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border dark:border-red-800">
        <p className="text-lg font-bold text-red-600 dark:text-red-400">{atrasadasCount}</p>
        <p className="text-xs text-red-600 dark:text-red-400">Atrasadas</p>
      </div>
    </div>
  );
}
