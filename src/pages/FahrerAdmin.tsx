import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Phone, Mail, MapPin, Clock, User, Car, FileText, ExternalLink, Eye } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

interface FahrerDokument {
  id: string;
  filename: string;
  filepath: string;
  type: string;
  uploaded_at: string;
}

interface FahrerProfile {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  adresse?: string;
  plz?: string;
  ort?: string;
  fuehrerscheinklassen: string[];
  erfahrung_jahre: number;
  spezialisierungen: string[];
  verfuegbare_regionen: string[];
  stundensatz: number;
  verfuegbarkeit?: string;
  beschreibung?: string;
  status: string;
  created_at: string;
  dokumente?: FahrerDokument[];
}

const FahrerAdmin = () => {
  useSEO({
    title: "Fahrer Administration | Fahrerexpress",
    description: "Geschützter Admin-Bereich für die Verwaltung registrierter Fahrer.",
    noindex: true
  });

  const { toast } = useToast();
  const [fahrer, setFahrer] = useState<FahrerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [documentPreviews, setDocumentPreviews] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchFahrer();
  }, []);

  // Force reload data when component mounts
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFahrer();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchFahrer = async () => {
    try {
      const { data, error } = await supabase
        .from('fahrer_profile')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch documents for each driver
      const fahrerWithDocs = await Promise.all(
        (data || []).map(async (fahrerProfile) => {
          const { data: dokumente, error: docError } = await supabase
            .from('fahrer_dokumente')
            .select('*')
            .eq('fahrer_id', fahrerProfile.id)
            .order('uploaded_at', { ascending: false });
          
          if (docError) {
            console.error('Error fetching documents for driver:', fahrerProfile.id, docError);
            return { ...fahrerProfile, dokumente: [] };
          }
          
          return { ...fahrerProfile, dokumente: dokumente || [] };
        })
      );
      
      setFahrer(fahrerWithDocs);
    } catch (error) {
      toast({
        title: "Fehler beim Laden",
        description: "Fahrer-Daten konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('fahrer_profile')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setFahrer(prev => 
        prev.map(f => f.id === id ? { ...f, status } : f)
      );

      toast({
        title: "Status aktualisiert",
        description: `Fahrer wurde ${status === 'approved' ? 'freigegeben' : 'abgelehnt'}.`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const previewDocument = async (filepath: string, filename: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('fahrer-dokumente')
        .createSignedUrl(filepath, 60); // 60 seconds expiry

      if (error) throw error;

      if (data?.signedUrl) {
        const isImage = filename.toLowerCase().match(/\.(jpg|jpeg|png)$/);
        
        if (isImage) {
          // For images, show in a new tab or modal
          setDocumentPreviews(prev => ({
            ...prev,
            [filepath]: data.signedUrl
          }));
        } else {
          // For PDFs, open in new tab
          window.open(data.signedUrl, '_blank');
        }
        
        toast({
          title: "Dokument geladen",
          description: `${filename} wurde erfolgreich geladen.`,
        });
      }
    } catch (error) {
      console.error('Error creating signed URL:', error);
      toast({
        title: "Fehler",
        description: "Dokument konnte nicht geladen werden.",
        variant: "destructive",
      });
    }
  };

  const filteredFahrer = fahrer.filter(f => {
    const matchesFilter = filter === 'all' || f.status === filter;
    const matchesSearch = searchTerm === '' || 
      `${f.vorname} ${f.nachname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.ort?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.spezialisierungen.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Freigegeben</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Abgelehnt</Badge>;
      default:
        return <Badge variant="secondary">Ausstehend</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div>
        <Navigation />
        <div className="min-h-screen bg-muted pt-20 flex items-center justify-center">
          <div className="text-center">Lade Fahrer-Daten...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-muted pt-20 pb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Fahrer-Administration</h1>
          
          {/* Filter und Suche */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select onValueChange={setFilter} defaultValue="all">
              <SelectTrigger className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Fahrer</SelectItem>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="approved">Freigegeben</SelectItem>
                <SelectItem value="rejected">Abgelehnt</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Suche nach Name, E-Mail, Ort oder Spezialisierung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{fahrer.length}</div>
                <div className="text-sm text-muted-foreground">Gesamt</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {fahrer.filter(f => f.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">Ausstehend</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {fahrer.filter(f => f.status === 'approved').length}
                </div>
                <div className="text-sm text-muted-foreground">Freigegeben</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {fahrer.filter(f => f.status === 'rejected').length}
                </div>
                <div className="text-sm text-muted-foreground">Abgelehnt</div>
              </CardContent>
            </Card>
          </div>

          {/* Fahrer-Liste */}
          <div className="grid gap-6">
            {filteredFahrer.map((fahrerProfile) => (
              <Card key={fahrerProfile.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {fahrerProfile.vorname} {fahrerProfile.nachname}
                    </CardTitle>
                    {getStatusBadge(fahrerProfile.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Kontaktdaten */}
                    <div>
                      <h4 className="font-semibold mb-3">Kontaktdaten</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{fahrerProfile.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{fahrerProfile.telefon}</span>
                        </div>
                        {fahrerProfile.ort && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {fahrerProfile.plz} {fahrerProfile.ort}
                            </span>
                          </div>
                        )}
                        {fahrerProfile.verfuegbarkeit && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{fahrerProfile.verfuegbarkeit}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Qualifikationen */}
                    <div>
                      <h4 className="font-semibold mb-3">Qualifikationen</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium">Führerscheinklassen:</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {fahrerProfile.fuehrerscheinklassen.map((klasse) => (
                              <Badge key={klasse} variant="outline" className="text-xs">
                                {klasse}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium">Erfahrung:</div>
                          <div className="text-sm text-muted-foreground">
                            {fahrerProfile.erfahrung_jahre} Jahre
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium">Stundensatz:</div>
                          <div className="text-sm font-bold text-primary">
                            {fahrerProfile.stundensatz}€/Stunde
                          </div>
                        </div>

                        {fahrerProfile.spezialisierungen.length > 0 && (
                          <div>
                            <div className="text-sm font-medium">Spezialisierungen:</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {fahrerProfile.spezialisierungen.map((spez) => (
                                <Badge key={spez} variant="secondary" className="text-xs">
                                  {spez}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Verfügbare Regionen */}
                  {fahrerProfile.verfuegbare_regionen.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Verfügbare Regionen:</div>
                      <div className="flex flex-wrap gap-1">
                        {fahrerProfile.verfuegbare_regionen.map((region) => (
                          <Badge key={region} variant="outline" className="text-xs">
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Beschreibung */}
                  {fahrerProfile.beschreibung && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Beschreibung:</div>
                      <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {fahrerProfile.beschreibung}
                      </div>
                    </div>
                  )}

                  {/* Dokumente */}
                  {fahrerProfile.dokumente && fahrerProfile.dokumente.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-3">Hochgeladene Dokumente:</div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {fahrerProfile.dokumente.map((doc) => {
                          const isImage = doc.filename.toLowerCase().match(/\.(jpg|jpeg|png)$/);
                          const isPDF = doc.filename.toLowerCase().endsWith('.pdf');
                          const previewUrl = documentPreviews[doc.filepath];
                          
                          return (
                            <div key={doc.id} className="border rounded-lg p-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="outline" className="text-xs">
                                  {doc.type}
                                </Badge>
                              </div>
                              
                              <div className="text-xs text-muted-foreground truncate" title={doc.filename}>
                                {doc.filename}
                              </div>
                              
                              <div className="text-xs text-muted-foreground">
                                {new Date(doc.uploaded_at).toLocaleDateString('de-DE')}
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => previewDocument(doc.filepath, doc.filename)}
                                  className="flex-1"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  {isPDF ? 'PDF öffnen' : 'Vorschau'}
                                </Button>
                              </div>
                              
                              {/* Image preview inline */}
                              {isImage && previewUrl && (
                                <div className="mt-2">
                                  <img 
                                    src={previewUrl} 
                                    alt={doc.filename}
                                    className="w-full h-32 object-cover rounded border"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Aktionen */}
                  {fahrerProfile.status === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => updateStatus(fahrerProfile.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Freigeben
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => updateStatus(fahrerProfile.id, 'rejected')}
                      >
                        Ablehnen
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFahrer.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Keine Fahrer gefunden.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FahrerAdmin;