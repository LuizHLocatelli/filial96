import React, { useState } from 'react';
import { Goal } from './types';
import { formatGoalValue } from './utils';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SetGoalModalProps {
  sector: Goal;
  onClose: () => void;
  onSave: (newGoal: number) => void;
}

const SetGoalModal: React.FC<SetGoalModalProps> = ({
  sector,
  onClose,
  onSave,
}) => {
  const [goal, setGoal] = useState<number>(0);

  React.useEffect(() => {
    if (sector) {
      setGoal(sector.monthlyGoal);
    }
  }, [sector]);

  const handleSave = () => {
    onSave(goal);
  };

  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 }
  };

  const modalVariants = {
    hidden: { y: "-50vh", opacity: 0 },
    visible: { y: "0", opacity: 1, transition: { type: "spring", stiffness: 120, damping: 20 } },
    exit: { y: "50vh", opacity: 0, transition: { duration: 0.3 } }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={e => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Definir Meta para{' '}
              <span className="text-emerald-500">{sector.sector}</span>
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mb-4">
            <label
              htmlFor="goal"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {sector.goalType === 'quantity'
                ? 'Quantidade da Meta Mensal'
                : 'Valor da Meta Mensal (R$)'}
            </label>
            <input
              type="number"
              id="goal"
              value={goal}
              onChange={e => setGoal(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="50000"
            />
          </div>
          <p className="mb-6 h-5 text-sm text-gray-500 dark:text-gray-400">
            {goal > 0 &&
              `Equivale a: ${formatGoalValue(goal, sector.goalType)}`}
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="rounded-lg bg-gray-200 px-5 py-2.5 font-semibold text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex transform items-center space-x-2 rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white transition-transform hover:scale-105 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              <Check size={20} />
              <span>Salvar Meta</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SetGoalModal; 