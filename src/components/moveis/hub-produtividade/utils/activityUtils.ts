
import { ActivityItem } from '../types';
import { startOfDay, endOfDay, isWithinInterval, subDays, startOfWeek, startOfMonth } from 'date-fns';

export function filterActivitiesByDateRange(activities: ActivityItem[], range: string): ActivityItem[] {
  const now = new Date();
  
  switch (range) {
    case 'today':
      return activities.filter(activity => 
        isWithinInterval(new Date(activity.timestamp), {
          start: startOfDay(now),
          end: endOfDay(now)
        })
      );
      
    case 'yesterday':
      const yesterday = subDays(now, 1);
      return activities.filter(activity => 
        isWithinInterval(new Date(activity.timestamp), {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday)
        })
      );
      
    case 'week':
      return activities.filter(activity => 
        isWithinInterval(new Date(activity.timestamp), {
          start: startOfWeek(now),
          end: now
        })
      );
      
    case 'month':
      return activities.filter(activity => 
        isWithinInterval(new Date(activity.timestamp), {
          start: startOfMonth(now),
          end: now
        })
      );
      
    default:
      return activities;
  }
}

export function groupActivitiesByDate(activities: ActivityItem[]): Record<string, ActivityItem[]> {
  const groups: Record<string, ActivityItem[]> = {};
  
  activities.forEach(activity => {
    const date = startOfDay(new Date(activity.timestamp)).toISOString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
  });
  
  return groups;
}

export function calculateActivityStats(activities: ActivityItem[]) {
  const total = activities.length;
  const completed = activities.filter(a => a.status === 'concluida').length;
  const pending = activities.filter(a => a.status === 'pendente').length;
  const overdue = activities.filter(a => a.status === 'atrasada').length;
  const recent = activities.filter(a => a.status === 'nova').length;
  
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    total,
    completed,
    pending,
    overdue,
    recent,
    completionRate
  };
}

export function getActivityPriority(activity: ActivityItem): 'high' | 'medium' | 'low' | 'normal' {
  if (activity.status === 'atrasada') return 'high';
  if (activity.action === 'concluida') return 'low';
  if (activity.status === 'nova') return 'medium';
  return 'normal';
}

export function searchActivities(activities: ActivityItem[], searchTerm: string): ActivityItem[] {
  if (!searchTerm.trim()) return activities;
  
  const term = searchTerm.toLowerCase().trim();
  
  return activities.filter(activity => {
    return (
      activity.title.toLowerCase().includes(term) ||
      activity.description?.toLowerCase().includes(term) ||
      activity.user.toLowerCase().includes(term) ||
      activity.type.toLowerCase().includes(term) ||
      activity.action.toLowerCase().includes(term) ||
      activity.status.toLowerCase().includes(term)
    );
  });
}
