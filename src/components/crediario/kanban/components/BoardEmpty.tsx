
import React from "react";

export function BoardEmpty() {
  return (
    <div className="text-center py-10">
      <h3 className="text-lg font-medium">Nenhum quadro encontrado</h3>
      <p className="text-muted-foreground">Ocorreu um erro ao carregar o quadro.</p>
    </div>
  );
}
