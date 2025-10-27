import { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { cn } from '@/lib/utils';

interface VoiceButtonProps {
  onTranscript: (transcript: string) => void;
  onListeningChange?: (isListening: boolean) => void;
}

export const VoiceButton = ({ onTranscript, onListeningChange }: VoiceButtonProps) => {
  const [isListening, setIsListening] = useState(false);
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    setIsListening(listening);
    onListeningChange?.(listening);
  }, [listening, onListeningChange]);

  useEffect(() => {
    if (transcript && !listening) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, listening, onTranscript, resetTranscript]);

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: false });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="text-sm text-muted-foreground">
        Browser doesn't support speech recognition.
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={toggleListening}
        variant="ghost"
        size="icon"
        className={cn(
          "relative h-12 w-12 rounded-full transition-all duration-300",
          "hover:scale-105",
          isListening && "animate-pulse"
        )}
        style={{
          background: isListening ? 'var(--gradient-primary)' : 'hsl(var(--secondary))',
          boxShadow: isListening ? 'var(--shadow-voice)' : 'none',
        }}
      >
        {isListening ? (
          <Mic className="h-5 w-5 text-white" />
        ) : (
          <MicOff className="h-5 w-5 text-muted-foreground" />
        )}
        
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping opacity-75" 
              style={{ background: 'hsl(var(--voice-glow))' }} />
            <span className="absolute inset-0 rounded-full animate-pulse opacity-50"
              style={{ background: 'hsl(var(--voice-glow))' }} />
          </>
        )}
      </Button>
      
      {isListening && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <div className="bg-card border border-border rounded-lg px-3 py-1.5 shadow-lg">
            <p className="text-xs font-medium" style={{ color: 'hsl(var(--voice-active))' }}>
              Listening...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
