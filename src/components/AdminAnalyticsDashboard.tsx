import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Eye, Calendar, BarChart3, Activity, Gauge } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface PageView {
  id: string;
  route: string;
  user_agent: string | null;
  referrer: string | null;
  created_at: string;
}

interface WebVital {
  id: string;
  route: string;
  metric_name: string;
  metric_value: number;
  rating: string | null;
  created_at: string;
}

interface RouteStats {
  route: string;
  count: number;
  lastVisit: string;
}

export const AdminAnalyticsDashboard = () => {
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [webVitals, setWebVitals] = useState<WebVital[]>([]);
  const [routeStats, setRouteStats] = useState<RouteStats[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [todayViews, setTodayViews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch page views
      const { data: allViews, error: viewsError } = await supabase
        .from('page_views')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (viewsError) throw viewsError;

      setPageViews(allViews || []);
      setTotalViews(allViews?.length || 0);

      // Calculate today's views
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCount = allViews?.filter(
        (view) => new Date(view.created_at) >= today
      ).length || 0;
      setTodayViews(todayCount);

      // Calculate route statistics
      const routeMap = new Map<string, { count: number; lastVisit: string }>();
      allViews?.forEach((view) => {
        const existing = routeMap.get(view.route);
        if (existing) {
          existing.count++;
          if (new Date(view.created_at) > new Date(existing.lastVisit)) {
            existing.lastVisit = view.created_at;
          }
        } else {
          routeMap.set(view.route, { count: 1, lastVisit: view.created_at });
        }
      });

      const stats: RouteStats[] = Array.from(routeMap.entries())
        .map(([route, data]) => ({
          route,
          count: data.count,
          lastVisit: data.lastVisit,
        }))
        .sort((a, b) => b.count - a.count);

      setRouteStats(stats);

      // Fetch web vitals
      const { data: vitals, error: vitalsError } = await supabase
        .from('web_vitals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (vitalsError) throw vitalsError;
      setWebVitals(vitals || []);

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBrowserFromUserAgent = (userAgent: string | null): string => {
    if (!userAgent) return "Unbekannt";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Edge")) return "Edge";
    return "Andere";
  };

  const getRatingBadge = (rating: string | null) => {
    if (!rating) return <Badge variant="secondary">-</Badge>;
    
    if (rating === 'good') return <Badge className="bg-green-500">Gut</Badge>;
    if (rating === 'needs-improvement') return <Badge className="bg-yellow-500">Mittel</Badge>;
    if (rating === 'poor') return <Badge variant="destructive">Schlecht</Badge>;
    return <Badge variant="secondary">{rating}</Badge>;
  };

  const getAverageVital = (metricName: string) => {
    const metrics = webVitals.filter(v => v.metric_name === metricName);
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + Number(m.metric_value), 0);
    return (sum / metrics.length).toFixed(2);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Lade Analytics-Daten...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pageviews" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pageviews">
            <Eye className="h-4 w-4 mr-2" />
            Seitenaufrufe
          </TabsTrigger>
          <TabsTrigger value="webvitals">
            <Gauge className="h-4 w-4 mr-2" />
            Core Web Vitals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pageviews" className="space-y-6">
          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Gesamte Seitenaufrufe
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalViews}</div>
                <p className="text-xs text-muted-foreground">
                  Alle erfassten Aufrufe
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Heute</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayViews}</div>
                <p className="text-xs text-muted-foreground">
                  Aufrufe heute
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Verschiedene Seiten
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routeStats.length}</div>
                <p className="text-xs text-muted-foreground">
                  Unterschiedliche URLs
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Most Visited Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Meistbesuchte Seiten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead className="text-right">Aufrufe</TableHead>
                    <TableHead className="text-right">Letzter Besuch</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routeStats.map((stat) => (
                    <TableRow key={stat.route}>
                      <TableCell className="font-mono text-sm">
                        {stat.route}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{stat.count}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {format(new Date(stat.lastVisit), "dd.MM.yyyy HH:mm", {
                          locale: de,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Page Views */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Letzte 100 Seitenaufrufe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zeitpunkt</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Browser</TableHead>
                      <TableHead>Referrer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageViews.map((view) => (
                      <TableRow key={view.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {format(new Date(view.created_at), "dd.MM.yyyy HH:mm:ss", {
                            locale: de,
                          })}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {view.route}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getBrowserFromUserAgent(view.user_agent)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {view.referrer || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webvitals" className="space-y-6">
          {/* Core Web Vitals Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">LCP</CardTitle>
                <p className="text-xs text-muted-foreground">Largest Contentful Paint</p>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getAverageVital('LCP')} ms</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">FID</CardTitle>
                <p className="text-xs text-muted-foreground">First Input Delay</p>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getAverageVital('FID')} ms</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">CLS</CardTitle>
                <p className="text-xs text-muted-foreground">Cumulative Layout Shift</p>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getAverageVital('CLS')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">FCP</CardTitle>
                <p className="text-xs text-muted-foreground">First Contentful Paint</p>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getAverageVital('FCP')} ms</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">TTFB</CardTitle>
                <p className="text-xs text-muted-foreground">Time to First Byte</p>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getAverageVital('TTFB')} ms</div>
              </CardContent>
            </Card>
          </div>

          {/* Web Vitals Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Letzte 100 Messungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zeitpunkt</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Metrik</TableHead>
                      <TableHead className="text-right">Wert</TableHead>
                      <TableHead>Bewertung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webVitals.map((vital) => (
                      <TableRow key={vital.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {format(new Date(vital.created_at), "dd.MM.yyyy HH:mm:ss", {
                            locale: de,
                          })}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {vital.route}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{vital.metric_name}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {Number(vital.metric_value).toFixed(2)}
                          {vital.metric_name === 'CLS' ? '' : ' ms'}
                        </TableCell>
                        <TableCell>
                          {getRatingBadge(vital.rating)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
