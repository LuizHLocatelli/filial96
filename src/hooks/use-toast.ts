
// Re-export from the component
export { useToast, toast } from '@/components/ui/use-toast';

// Add re-export for sonner toast if not already using it in some components
export { toast as sonnerToast } from 'sonner';
