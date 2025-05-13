
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Monitor, UserRound, Settings, MessageSquare, ListTodo, Users, PiggyBank, Calendar } from "lucide-react";

interface QuickAccessProps {
  onNavigate: (tab: string) => void;
}

interface AccessCardProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  bgColor: string;
  hoverColor: string;
}

const AccessCard = ({ title, icon, onClick, bgColor, hoverColor }: AccessCardProps) => {
  return (
    <motion.div
      className={`${bgColor} rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 h-36 sm:h-44`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className={`${hoverColor} p-3 rounded-full mb-3`}>
        {icon}
      </div>
      <span className="font-medium text-lg text-green-800">{title}</span>
    </motion.div>
  );
};

export const QuickAccess = ({ onNavigate }: QuickAccessProps) => {
  const handleNavigation = useCallback(
    (tab: string) => {
      onNavigate(tab);
    },
    [onNavigate]
  );

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-green-800">Acesso Rápido</h2>
        <p className="text-green-700">Selecione uma opção para começar</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <AccessCard
          title="Listagens"
          icon={<ListTodo size={32} className="text-green-700" />}
          onClick={() => handleNavigation("listagens")}
          bgColor="bg-green-100"
          hoverColor="bg-green-200"
        />
        
        <AccessCard
          title="Clientes"
          icon={<Users size={32} className="text-blue-700" />}
          onClick={() => handleNavigation("clientes")}
          bgColor="bg-blue-100"
          hoverColor="bg-blue-200"
        />
        
        <AccessCard
          title="Depósitos"
          icon={<PiggyBank size={32} className="text-purple-700" />}
          onClick={() => handleNavigation("depositos")}
          bgColor="bg-purple-100"
          hoverColor="bg-purple-200"
        />
        
        <AccessCard
          title="Folgas"
          icon={<Calendar size={32} className="text-orange-700" />}
          onClick={() => handleNavigation("folgas")}
          bgColor="bg-orange-100"
          hoverColor="bg-orange-200"
        />
        
        <AccessCard
          title="Quadro Kanban"
          icon={<Settings size={32} className="text-yellow-700" />}
          onClick={() => handleNavigation("kanban")}
          bgColor="bg-yellow-100"
          hoverColor="bg-yellow-200"
        />
        
        <AccessCard
          title="Dashboard"
          icon={<Monitor size={32} className="text-emerald-700" />}
          onClick={() => window.location.href = "/"}
          bgColor="bg-emerald-100"
          hoverColor="bg-emerald-200"
        />
        
        <AccessCard
          title="Perfil"
          icon={<UserRound size={32} className="text-indigo-700" />}
          onClick={() => window.location.href = "/perfil"}
          bgColor="bg-indigo-100"
          hoverColor="bg-indigo-200"
        />
        
        <AccessCard
          title="Mensagens"
          icon={<MessageSquare size={32} className="text-pink-700" />}
          onClick={() => alert("Módulo de mensagens em desenvolvimento")}
          bgColor="bg-pink-100"
          hoverColor="bg-pink-200"
        />
      </div>
    </div>
  );
};
