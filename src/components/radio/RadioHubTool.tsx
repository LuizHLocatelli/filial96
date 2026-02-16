import { RadioPlayerModern } from './RadioPlayerModern';

interface RadioHubToolProps {
  className?: string;
}

export function RadioHubTool({ 
  className = ''
}: RadioHubToolProps) {
  return (
    <div className={`radio-hub-tool ${className}`}>
      <RadioPlayerModern />
    </div>
  );
}
