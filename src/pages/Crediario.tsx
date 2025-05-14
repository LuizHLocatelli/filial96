
import { useState, useEffect } from "react";
import { Listagens } from "@/components/crediario/Listagens";
import { ClientesAgendados } from "@/components/crediario/ClientesAgendados";
import { Depositos } from "@/components/crediario/Depositos";
import { Folgas } from "@/components/crediario/Folgas";
import { Kanban } from "@/components/crediario/kanban/Kanban";
import { Diretorio } from "@/components/crediario/diretorio/Diretorio";
import { useSearchParams, useNavigate } from "react-router-dom";
import { QuickAccess } from "@/components/crediario/QuickAccess";

const Crediario = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "welcome");
  const navigate = useNavigate();

  // Update URL when the tab changes
  useEffect(() => {
    if (activeTab) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, setSearchParams]);

  // Update the tab when URL changes
  useEffect(() => {
    if (tabFromUrl && ["welcome", "listagens", "clientes", "depositos", "folgas", "kanban", "diretorio"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "welcome":
        return <QuickAccess onNavigate={handleTabChange} />;
      case "listagens":
        return <Listagens />;
      case "clientes":
        return <ClientesAgendados />;
      case "depositos":
        return <Depositos />;
      case "folgas":
        return <Folgas />;
      case "kanban":
        return <Kanban />;
      case "diretorio":
        return <Diretorio />;
      default:
        return <QuickAccess onNavigate={handleTabChange} />;
    }
  };

  const showCompactMenu = activeTab !== "welcome";

  return (
    <div className="space-y-4"> {/* Reduzido o espaçamento vertical de space-y-6 para space-y-4 */}
      {/* Título removido */}
      
      {showCompactMenu && (
        <div className="mb-2"> {/* Reduzido o espaçamento inferior de mb-4 para mb-2 */}
          <QuickAccess onNavigate={handleTabChange} compact={true} />
        </div>
      )}
      
      {renderContent()}
    </div>
  );
};

export default Crediario;
