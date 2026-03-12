import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useEscalas } from "./hooks/useEscalas";
import { EscalaHeader } from "./components/EscalaHeader";
import { EscalaFilterBar } from "./components/EscalaFilterBar";
import { EscalaDayCard } from "./components/EscalaDayCard";
import { EscalaEmptyState } from "./components/EscalaEmptyState";
import { EditarTurnoPopover } from "./components/EditarTurnoPopover";
import { GeradorEscalaDialog } from "./GeradorEscalaDialog";
import { LimparEscalaDialog } from "./LimparEscalaDialog";
import { EscalaCarga } from "@/types/shared/escalas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HorariosAlmoco } from "./HorariosAlmoco";

export default function Escalas() {
  const { profile } = useAuth();
  const isManager = profile?.role === "gerente";

  const {
    monthLabel,
    goNextMonth,
    goPrevMonth,
    goToday,
    calendarDays,
    isLoading,
    stats,
    consultores,
    filterConsultantId,
    setFilterConsultantId,
    invalidateAndRefetch,
    hasData,
  } = useEscalas();

  const [showGerador, setShowGerador] = useState(false);
  const [showLimpar, setShowLimpar] = useState(false);
  const [editingShift, setEditingShift] = useState<EscalaCarga | null>(null);

  return (
    <div className="space-y-5">
      <Tabs defaultValue="carga" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
            <TabsTrigger value="carga">Escala de Carga</TabsTrigger>
            <TabsTrigger value="almoco">Horários de Almoço</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="carga" className="space-y-5 mt-0">
          <EscalaHeader
            monthLabel={monthLabel}
            onPrevMonth={goPrevMonth}
            onNextMonth={goNextMonth}
            onToday={goToday}
            isManager={isManager}
            onGenerate={() => setShowGerador(true)}
            onClear={() => setShowLimpar(true)}
          />

          {/* Filter bar */}
          {hasData && (
            <EscalaFilterBar
              consultores={consultores}
              filterConsultantId={filterConsultantId}
              onFilterChange={setFilterConsultantId}
              stats={stats}
            />
          )}

          {/* Calendar grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando escalas…</p>
            </div>
          ) : !hasData ? (
            <EscalaEmptyState isManager={isManager} onGenerate={() => setShowGerador(true)} />
          ) : (
            <>
              {/* Weekday headers */}
              <div className="hidden sm:grid grid-cols-7 gap-1.5 mb-1">
                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(d => (
                  <div key={d} className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold text-center py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-1.5">
                {/* Leading empty cells to align first day with correct weekday */}
                {(() => {
                  if (calendarDays.length === 0) return null;
                  const firstDay = calendarDays[0].date.getDay();
                  // Convert Sunday=0 to Monday-first: Mon=0, Tue=1, ..., Sun=6
                  const offset = firstDay === 0 ? 6 : firstDay - 1;
                  return Array.from({ length: offset }).map((_, i) => (
                    <div key={`empty-${i}`} className="hidden sm:block" />
                  ));
                })()}

                {calendarDays.map(day => (
                  <EscalaDayCard
                    key={day.dateStr}
                    day={day}
                    isManager={isManager}
                    onEditShift={setEditingShift}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground border-t border-border/40">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  Carga (08:30–17:30)
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary/40" />
                  Espelho (Ter/Qui/Sáb)
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                  Normal (09:30–18:30)
                </div>
              </div>
            </>
          )}

          {/* Dialogs */}
          {showGerador && (
            <GeradorEscalaDialog
              open={showGerador}
              onOpenChange={setShowGerador}
              onSuccess={invalidateAndRefetch}
            />
          )}
          {showLimpar && (
            <LimparEscalaDialog
              open={showLimpar}
              onOpenChange={setShowLimpar}
              onSuccess={invalidateAndRefetch}
            />
          )}
          <EditarTurnoPopover
            shift={editingShift}
            consultores={consultores}
            open={!!editingShift}
            onOpenChange={(open) => { if (!open) setEditingShift(null); }}
            onSuccess={invalidateAndRefetch}
          />
        </TabsContent>

        <TabsContent value="almoco" className="mt-0 pt-4 border-t border-border/40">
          <HorariosAlmoco />
        </TabsContent>
      </Tabs>
    </div>
  );
}
