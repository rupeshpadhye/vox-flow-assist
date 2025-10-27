import { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface VoiceResponseProps {
  command: string;
  response: string;
}

export const VoiceResponse = ({ command, response }: VoiceResponseProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <Card 
      className={cn(
        "p-4 transition-all duration-500 border-l-4",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{ borderLeftColor: 'hsl(var(--primary))' }}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full p-2" style={{ background: 'hsl(var(--accent))' }}>
          <Sparkles className="h-4 w-4" style={{ color: 'hsl(var(--accent-foreground))' }} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">You said:</span>
            <span className="text-sm text-muted-foreground italic">"{command}"</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
              <span className="text-sm font-medium">Vox Response:</span>
            </div>
            <p className="text-sm text-foreground pl-6">{response}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
