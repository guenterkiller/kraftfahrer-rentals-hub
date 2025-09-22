import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CRMPipeline {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'lead' | 'contacted' | 'quote_sent' | 'converted' | 'lost';
  source: string;
  created_at: string;
  notes?: string;
}

const CRMDashboard = () => {
  const [pipelines, setPipelines] = useState<CRMPipeline[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const statusLabels = {
    lead: "Lead",
    contacted: "Kontaktiert", 
    quote_sent: "Angebot gesendet",
    converted: "Gewonnen",
    lost: "Verloren"
  };

  const updateStatus = async (id: string, newStatus: CRMPipeline['status']) => {
    try {
      const { error } = await supabase
        .from('job_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setPipelines(prev => 
        prev.map(p => p.id === id ? { ...p, status: newStatus } : p)
      );

      toast({
        title: "Status aktualisiert",
        description: `Status wurde zu "${statusLabels[newStatus]}" geändert`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(statusLabels).map(([status, label]) => {
          const count = pipelines.filter(p => p.status === status).length;
          const percentage = pipelines.length > 0 ? (count / pipelines.length * 100).toFixed(1) : 0;
          
          return (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className="text-xs text-muted-foreground">{percentage}%</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-4">
        {pipelines.map((pipeline) => (
          <Card key={pipeline.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{pipeline.name}</h3>
                  <p className="text-sm text-muted-foreground">{pipeline.email}</p>
                  {pipeline.company && (
                    <p className="text-sm text-muted-foreground">{pipeline.company}</p>
                  )}
                </div>
                <Select 
                  value={pipeline.status} 
                  onValueChange={(value: CRMPipeline['status']) => 
                    updateStatus(pipeline.id, value)
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CRMDashboard;