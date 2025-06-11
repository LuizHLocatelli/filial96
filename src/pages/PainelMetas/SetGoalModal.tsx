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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={e => e.stopPropagation()}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">
              Definir Meta para <span className="text-primary">{sector.sector}</span>
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-border"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mb-4">
            <label
              htmlFor="goal"
              className="mb-2 block text-sm font-medium text-muted-foreground"
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
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-lg text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="50000"
            />
          </div>
          <p className="mb-8 h-5 text-sm text-muted-foreground">
            {goal > 0 &&
              `Equivale a: ${formatGoalValue(goal, sector.goalType)}`}
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-border bg-transparent px-5 py-2.5 font-semibold text-foreground transition-colors hover:bg-border"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex transform items-center space-x-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-transform hover:scale-105 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
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