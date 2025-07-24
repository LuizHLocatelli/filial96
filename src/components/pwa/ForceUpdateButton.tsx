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
      variant="ghost"
      size="icon"
      onClick={handleForceUpdate}
      disabled={isUpdating}
      className="h-10 w-10 rounded-xl"
      title="Forçar atualização do app"
    >
      <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
    </Button>
  );
}