import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ScheduleEntry {
  date: string;
  user_id: string;
  is_carga: boolean;
  shift_start: string;
  shift_end: string;
}

/**
 * Pure deterministic schedule generator.
 * No AI needed — the rules are fully algorithmic:
 * 
 * - Mon/Wed/Fri → 2 people on Carga (08:30-17:30), rest Normal (09:30-18:30)
 * - Tue/Thu/Sat → Mirror: same 2 from previous day repeat Carga schedule
 * - Sunday → skip entirely
 * - Round-robin rotation for Carga pairs
 * - Respects folgas (specific day-offs) and excluded consultants
 */
function generateSchedule(
  startDate: string,
  daysToGenerate: number,
  firstPairIds: string[],
  availableConsultantsIds: string[],
  excludedConsultantsIds: string[],
  folgas: { consultantId: string; date: string }[]
): ScheduleEntry[] {
  const schedule: ScheduleEntry[] = [];

  // Filter out excluded consultants
  const activeConsultants = availableConsultantsIds.filter(
    id => !excludedConsultantsIds.includes(id)
  );

  if (activeConsultants.length < 2) {
    throw new Error("Pelo menos 2 consultores disponíveis são necessários para gerar a escala.");
  }

  // Build folgas lookup: Set<"userId|date">
  const folgaSet = new Set(folgas.map(f => `${f.consultantId}|${f.date}`));
  const hasFolga = (userId: string, date: string) => folgaSet.has(`${userId}|${date}`);

  // Build round-robin queue for carga pairs, starting with firstPairIds
  // The queue contains individual consultants; we pick 2 at a time
  const cargaQueue: string[] = [];
  
  // Start with firstPairIds, then add remaining in order
  for (const id of firstPairIds) {
    if (activeConsultants.includes(id)) cargaQueue.push(id);
  }
  for (const id of activeConsultants) {
    if (!firstPairIds.includes(id)) cargaQueue.push(id);
  }

  let queueIndex = 0;

  // Pick next available pair from round-robin, skipping those with folga
  function pickCargaPair(dateStr: string): [string, string] {
    const pair: string[] = [];
    const startIndex = queueIndex;
    let attempts = 0;
    
    while (pair.length < 2 && attempts < cargaQueue.length * 2) {
      const candidate = cargaQueue[queueIndex % cargaQueue.length];
      queueIndex++;
      attempts++;
      
      if (!hasFolga(candidate, dateStr) && !pair.includes(candidate)) {
        pair.push(candidate);
      }
    }

    // Fallback: if we couldn't find 2, just use whoever is available
    if (pair.length < 2) {
      for (const id of activeConsultants) {
        if (!hasFolga(id, dateStr) && !pair.includes(id)) {
          pair.push(id);
          if (pair.length === 2) break;
        }
      }
    }

    return [pair[0], pair[1]];
  }

  // Iterate through days
  const start = new Date(startDate + "T12:00:00Z");
  let lastCargaPair: [string, string] | null = null;

  for (let i = 0; i < daysToGenerate; i++) {
    const current = new Date(start);
    current.setDate(current.getDate() + i);

    const dow = current.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const dateStr = current.toISOString().split("T")[0];

    // Skip Sundays
    if (dow === 0) continue;

    const isNewCargaDay = dow === 1 || dow === 3 || dow === 5; // Mon, Wed, Fri
    const isMirrorDay = dow === 2 || dow === 4 || dow === 6;   // Tue, Thu, Sat

    let cargaPair: [string, string];

    if (isNewCargaDay) {
      cargaPair = pickCargaPair(dateStr);
      lastCargaPair = cargaPair;
    } else if (isMirrorDay && lastCargaPair) {
      // Mirror: same pair, but replace anyone with folga
      cargaPair = [...lastCargaPair] as [string, string];
      for (let p = 0; p < 2; p++) {
        if (hasFolga(cargaPair[p], dateStr)) {
          // Find a replacement
          const replacement = activeConsultants.find(
            id => !hasFolga(id, dateStr) && !cargaPair.includes(id)
          );
          if (replacement) cargaPair[p] = replacement;
        }
      }
    } else {
      cargaPair = lastCargaPair || pickCargaPair(dateStr);
    }

    // Generate entries for ALL active consultants on this day
    for (const consultantId of activeConsultants) {
      if (hasFolga(consultantId, dateStr)) continue;

      const isCarga = cargaPair.includes(consultantId);

      schedule.push({
        date: dateStr,
        user_id: consultantId,
        is_carga: isCarga,
        shift_start: isCarga ? "08:30:00" : "09:30:00",
        shift_end: isCarga ? "17:30:00" : "18:30:00",
      });
    }
  }

  return schedule;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      startDate,
      daysToGenerate,
      firstPairIds,
      availableConsultantsIds,
      excludedConsultantsIds = [],
      folgas = [],
    } = await req.json();

    if (!startDate || !daysToGenerate || !firstPairIds || !availableConsultantsIds) {
      throw new Error("Parâmetros obrigatórios ausentes.");
    }

    if (firstPairIds.length !== 2) {
      throw new Error("Exatamente 2 consultores devem ser selecionados para a primeira carga.");
    }

    const schedule = generateSchedule(
      startDate,
      daysToGenerate,
      firstPairIds,
      availableConsultantsIds,
      excludedConsultantsIds,
      folgas
    );

    console.log(`Schedule generated: ${schedule.length} entries for ${daysToGenerate} days starting ${startDate}`);

    return new Response(
      JSON.stringify({ schedule }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
