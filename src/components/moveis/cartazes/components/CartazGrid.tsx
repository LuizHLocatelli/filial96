
import { CartazItem } from "../hooks/useCartazes";
import { CartazCard } from "./CartazCard";

interface CartazGridProps {
  cartazes: CartazItem[];
  onDelete: (id: string) => Promise<boolean>;
  onMoveToFolder: (cartazId: string, folderId: string | null) => Promise<boolean>;
  onUpdate: (id: string, newTitle: string) => void;
}

export function CartazGrid({ cartazes, onDelete, onMoveToFolder, onUpdate }: CartazGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cartazes.map((cartaz) => (
        <CartazCard
          key={cartaz.id}
          cartaz={cartaz}
          onDelete={onDelete}
          onMoveToFolder={onMoveToFolder}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
