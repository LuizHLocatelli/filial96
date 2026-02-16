import { RadioHubTool } from '@/components/radio/RadioHubTool';
import './RadioSection.css';

export function RadioSection() {
  return (
    <div className="radio-section">
      <RadioHubTool />
    </div>
  );
}

// Export default para lazy loading
export default RadioSection;
