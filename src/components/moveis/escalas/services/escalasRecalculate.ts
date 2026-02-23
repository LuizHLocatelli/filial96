import { supabase } from '@/integrations/supabase/client';
import { generateEscalaWithAI, saveEscalas, fetchFolgasMoveisPeriod } from './escalasApi';

export async function recalculateEscalaAfterFolga(folgaDateStr: string) {
  // 1. Find if there are any schedules from this date onwards
  const { data: existingSchedules, error: checkError } = await supabase
    .from('escala_carga')
    .select('*')
    .gte('date', folgaDateStr)
    .order('date', { ascending: true });

  if (checkError) throw checkError;
  if (!existingSchedules || existingSchedules.length === 0) {
    // No future schedules generated yet, nothing to recalculate
    return false;
  }

  // Find the exact date to start recalculation. It must be a Monday!
  // The AI only accepts Mondays as startDate.
  // We must find the Monday of the week of the folgaDateStr.
  const folgaDateObj = new Date(folgaDateStr + "T12:00:00");
  const dayOfWeek = folgaDateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  
  // Calculate how many days to subtract to get to Monday (1)
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const mondayDateObj = new Date(folgaDateObj);
  mondayDateObj.setDate(mondayDateObj.getDate() - daysToSubtract);
  const mondayDateStr = mondayDateObj.toISOString().split('T')[0];

  // Get the end date of the currently generated schedule
  const maxDateStr = existingSchedules[existingSchedules.length - 1].date;
  
  // Calculate days to generate (from the Monday to the end date)
  const diffTime = Math.abs(new Date(maxDateStr + "T12:00:00").getTime() - mondayDateObj.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays <= 0) return false;

  // We need to know who the "firstPair" was on THAT Monday.
  // Let's get the schedule for THAT Monday from the DB (if it exists)
  const { data: mondaySchedule, error: monError } = await supabase
    .from('escala_carga')
    .select('user_id')
    .eq('date', mondayDateStr)
    .eq('is_carga', true);
    
  if (monError) throw monError;
  
  let firstPairIds: string[] = [];
  if (mondaySchedule && mondaySchedule.length >= 2) {
    firstPairIds = [mondaySchedule[0].user_id, mondaySchedule[1].user_id];
  } else {
    // If we don't have a schedule for that Monday, we can't reliably regenerate it.
    // Fallback: get any 2 available consultants
    const { data: available } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'consultor_moveis')
      .limit(2);
    if (available && available.length >= 2) {
      firstPairIds = [available[0].id, available[1].id];
    } else {
      throw new Error("Não há consultores suficientes para recalcular a escala.");
    }
  }

  // Get all available consultants
  const { data: consultores } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'consultor_moveis');
    
  const availableConsultantsIds = consultores?.map(c => c.id) || [];

  // Get folgas for the period
  const rawFolgas = await fetchFolgasMoveisPeriod(mondayDateStr, maxDateStr);
  const folgas = rawFolgas?.map(f => ({
    consultantId: f.consultor_id,
    date: f.data
  })) || [];

  // Call AI to generate from the Monday to the end date
  const newSchedule = await generateEscalaWithAI({
    startDate: mondayDateStr,
    daysToGenerate: diffDays,
    firstPairIds,
    availableConsultantsIds,
    folgas
  });

  // Save (this will delete and replace the old ones in that period)
  await saveEscalas(newSchedule, mondayDateStr, maxDateStr);
  
  return true;
}
