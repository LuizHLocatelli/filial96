import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useCacheControl } from '@/hooks/useCacheControl';

export function ForceUpdateButton() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { forceAppUpdate } = useCacheControl();

  const handleForceUpdate = async () => {
    setIsUpdating(true);
    await forceAppUpdate();
    // A página será recarregada, então não precisamos resetar o estado
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleForceUpdate}
      disabled={isUpdating}
      className="fixed bottom-4 right-4 z-50 bg-background/90 backdrop-blur-sm border-primary/20 hover:bg-primary/10"
      title="Forçar atualização do app"
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
      {isUpdating ? 'Atualizando...' : 'Atualizar App'}
    </Button>
  );
}