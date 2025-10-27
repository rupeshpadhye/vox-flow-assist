import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { User, Clock, AlertCircle } from 'lucide-react';

export const TicketView = () => {
  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground">Sample Ticket #485</h2>
              <Badge style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                New
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Via web form</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Requester</span>
            </div>
            <p className="text-sm font-medium">Ammar Habib</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Priority</span>
            </div>
            <p className="text-sm font-medium">Normal</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Created</span>
            </div>
            <p className="text-sm font-medium">Yesterday 16:27</p>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="rounded-full h-10 w-10 flex items-center justify-center text-sm font-medium"
              style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
              AH
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Ammar Habib</span>
                <span className="text-xs text-muted-foreground">Yesterday 16:27</span>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-foreground leading-relaxed">
                  If you would like to request that Division 17 set up a new vendor, 
                  please make sure your request includes the attached <span className="italic">Requirements sheet</span> and if it does, 
                  the <span className="italic">New Vendor Request Form</span> attached must be fully completed and sent to 
                  VendorRelations@medline.com.
                </p>
                <p className="text-sm text-foreground leading-relaxed mt-3">
                  Please also include a brief explanation on the business reason this vendor is needed for setup. 
                  Keep in mind, we typically do not duplicate category offerings, setup distributors when we 
                  already have access through the real manufacturer, or bring on non-MedSurg type items. 
                  Exceptions can always be made for "odd or special" setups, as long as we have a good 
                  understanding on the business need.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
