
import { ShoppingBag } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function AuthHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center">
        <ShoppingBag className="h-10 w-10 text-primary mr-2" />
        <h1 className="text-3xl font-bold text-primary">Filial 96</h1>
      </div>
      <ThemeToggle />
    </div>
  );
}
