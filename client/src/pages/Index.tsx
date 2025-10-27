import { useState } from 'react';
import { VoiceButton } from '@/components/VoiceButton';
import { VoiceResponse } from '@/components/VoiceResponse';
import { TicketView } from '@/components/TicketView';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Sparkles } from 'lucide-react';

interface VoiceInteraction {
  command: string;
  response: string;
}

const Index = () => {
  const [interactions, setInteractions] = useState<VoiceInteraction[]>([]);
  const [isListening, setIsListening] = useState(false);
  const { speak, isSpeaking } = useTextToSpeech();

  const processVoiceCommand = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    let response = '';

    if (lowerTranscript.includes('ticket summary') || lowerTranscript.includes('summarize')) {
      response = "This is a vendor request ticket from Ammar Habib created yesterday. The requester wants to set up a new vendor for Division 17. They need to submit the Requirements sheet and completed New Vendor Request Form to VendorRelations@medline.com with a business justification.";
    } else if (lowerTranscript.includes('suggest assignee') || lowerTranscript.includes('who can handle')) {
      response = "Based on the ticket content about vendor relations and Division 17 setup, I recommend assigning this to Sarah Chen from the Vendor Management team. She has handled 15 similar cases this month with an average resolution time of 2.3 days.";
    } else if (lowerTranscript.includes('save ticket') || lowerTranscript.includes('save')) {
      response = "Ticket #485 has been saved successfully. All changes are now stored.";
    } else if (lowerTranscript.includes('change status') || lowerTranscript.includes('status')) {
      response = "Status has been updated to 'In Progress'. The ticket is now ready for assignment.";
    } else {
      response = `I heard: "${transcript}". Try commands like "tell me ticket summary", "suggest assignee", "save ticket", or "change status".`;
    }

    setInteractions(prev => [{ command: transcript, response }, ...prev]);
    
    // Speak the response
    speak(response);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2" style={{ background: 'var(--gradient-primary)' }}>
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Vox Agent Workspace</h1>
                <p className="text-sm text-muted-foreground">Voice-powered productivity tools</p>
              </div>
            </div>
            
            <VoiceButton 
              onTranscript={processVoiceCommand}
              onListeningChange={setIsListening}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket View */}
          <div className="lg:col-span-2">
            <TicketView />
          </div>

          {/* Voice Interactions Sidebar */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
                Voice Assistant
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Try these commands:</p>
                <ul className="space-y-2 pl-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>"Tell me ticket summary"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>"Suggest assignee who can handle this"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>"Save ticket"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>"Change status"</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Voice Interactions History */}
            {interactions.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground text-sm">Recent Interactions</h3>
                {interactions.map((interaction, index) => (
                  <VoiceResponse
                    key={index}
                    command={interaction.command}
                    response={interaction.response}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
