import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Eye, Calendar, BarChart3, Activity, Gauge } from "lucide-react";
import { format, startOfDay, subDays, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

interface TimeSeriesData {
  date: string;
  total: number;
  [key: string]: number | string;
}

export const AdminAnalyticsDashboard = () => {
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [webVitals, setWebVitals] = useState<WebVital[]>([]);
  const [routeStats, setRouteStats] = useState<RouteStats[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [todayViews, setTodayViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'all'>('7days');
  const [isExpanded, setIsExpanded] = useState(false);
  const [pageViewsPage, setPageViewsPage] = useState(1);
  const pageViewsPerPage = 10;

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const now = new Date();
      let startDate: Date;
      
      if (timeRange === '7days') {
        startDate = subDays(now, 7);
      } else if (timeRange === '30days') {
        startDate = subDays(now, 30);
      } else {
        startDate = new Date(0); // All time
      }

      // Fetch page views
      const { data: allViews, error: viewsError } = await supabase
        .from('page_views')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

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
        const cleanRoute = getCleanRoute(view.route);
        const existing = routeMap.get(cleanRoute);
        if (existing) {
          existing.count++;
          if (new Date(view.created_at) > new Date(existing.lastVisit)) {
            existing.lastVisit = view.created_at;
          }
        } else {
          routeMap.set(cleanRoute, { count: 1, lastVisit: view.created_at });
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

      // Calculate time series data
      const dailyData = new Map<string, Map<string, number>>();
      
      allViews?.forEach((view) => {
        const dateKey = format(startOfDay(parseISO(view.created_at)), 'dd.MM.yyyy');
        const cleanRoute = getCleanRoute(view.route);
        const readableName = getReadableRouteName(cleanRoute);
        
        if (!dailyData.has(dateKey)) {
          dailyData.set(dateKey, new Map());
        }
        
        const dayData = dailyData.get(dateKey)!;
        dayData.set(readableName, (dayData.get(readableName) || 0) + 1);
      });

      // Convert to array format for recharts
      const timeSeriesArray: TimeSeriesData[] = Array.from(dailyData.entries())
        .map(([date, routes]) => {
          const dataPoint: TimeSeriesData = { date, total: 0 };
          let total = 0;
          
          routes.forEach((count, route) => {
            dataPoint[route] = count;
            total += count;
          });
          
          dataPoint.total = total;
          return dataPoint;
        })
        .sort((a, b) => {
          const [dayA, monthA, yearA] = a.date.split('.');
          const [dayB, monthB, yearB] = b.date.split('.');
          return new Date(+yearA, +monthA - 1, +dayA).getTime() - new Date(+yearB, +monthB - 1, +dayB).getTime();
        });

      setTimeSeriesData(timeSeriesArray);

      // Fetch web vitals
      const { data: vitals, error: vitalsError } = await supabase
        .from('web_vitals')
        .select('*')
        .gte('created_at', startDate.toISOString())
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
  
  const getCleanRoute = (route: string): string => {
    if (!route) return "/";
    const [path] = route.split("?");
    if (!path || path.trim() === "") return "/";
    return path;
  };

  const getReadableRouteName = (route: string): string => {
    const cleanRoute = getCleanRoute(route);
    const routeNames: Record<string, string> = {
      "/": "Startseite",
      "/admin": "Admin-Dashboard",
      "/admin/login": "Admin-Login",
      "/trucker-ladies": "Fahrer-Community-Chat",
      "/wissenswertes": "Wissenswertes",
      "/fahrer-werden": "Fahrer werden",
      "/kraftfahrer-mieten": "Kraftfahrer mieten",
      "/lkw-fahrer-buchen": "LKW-Fahrer buchen",
      "/baumaschinenfuehrer-buchen": "Baumaschinenführer buchen",
      "/begleitfahrzeuge-bf3": "Begleitfahrzeuge BF3",
      "/bf3-ablauf": "BF3 Ablauf",
      "/preise-und-ablauf": "Preise und Ablauf",
      "/projekte": "Projekte",
      "/vermittlung": "Vermittlung",
      "/versicherung": "Versicherung",
      "/impressum": "Impressum",
      "/datenschutz": "Datenschutz",
    };
    
    return routeNames[cleanRoute] || cleanRoute;
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
    <Card className="mb-6">
      <CardHeader 
        className="cursor-pointer hover:bg-accent/50 transition-colors py-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <CardTitle className="text-base">Analytics</CardTitle>
            <Badge variant="outline" className="text-xs">
              {totalViews} Aufrufe heute: {todayViews}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isExpanded ? '▲' : '▼'}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex gap-2 justify-end">
              <Badge 
                variant={timeRange === '7days' ? 'default' : 'outline'} 
                className="cursor-pointer text-xs"
                onClick={() => setTimeRange('7days')}
              >
                7 Tage
              </Badge>
              <Badge 
                variant={timeRange === '30days' ? 'default' : 'outline'} 
                className="cursor-pointer text-xs"
                onClick={() => setTimeRange('30days')}
              >
                30 Tage
              </Badge>
              <Badge 
                variant={timeRange === 'all' ? 'default' : 'outline'} 
                className="cursor-pointer text-xs"
                onClick={() => setTimeRange('all')}
              >
                Alle
              </Badge>
            </div>

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

          {/* Time Series Chart */}
          {timeSeriesData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Seitenaufrufe über Zeit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stackId="1"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      name="Gesamt"
                    />
                    {routeStats.slice(0, 5).map((stat, idx) => {
                      const routeName = getReadableRouteName(stat.route);
                      const colors = [
                        'hsl(var(--chart-1))',
                        'hsl(var(--chart-2))',
                        'hsl(var(--chart-3))',
                        'hsl(var(--chart-4))',
                        'hsl(var(--chart-5))',
                      ];
                      return (
                        <Area
                          key={stat.route}
                          type="monotone"
                          dataKey={routeName}
                          stackId="2"
                          stroke={colors[idx % colors.length]}
                          fill={colors[idx % colors.length]}
                          name={routeName}
                        />
                      );
                    })}
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

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
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{getReadableRouteName(stat.route)}</div>
                          <div className="font-mono text-xs text-muted-foreground">{stat.route}</div>
                        </div>
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
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4" />
                Letzte Seitenaufrufe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs">
                      <TableHead className="py-2">Zeitpunkt</TableHead>
                      <TableHead className="py-2">Route</TableHead>
                      <TableHead className="py-2">Browser</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageViews.slice((pageViewsPage - 1) * pageViewsPerPage, pageViewsPage * pageViewsPerPage).map((view) => (
                      <TableRow key={view.id} className="text-xs">
                        <TableCell className="text-xs whitespace-nowrap py-2">
                          {format(new Date(view.created_at), "dd.MM HH:mm", {
                            locale: de,
                          })}
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="text-xs">{getReadableRouteName(view.route)}</div>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge variant="outline" className="text-xs py-0">
                            {getBrowserFromUserAgent(view.user_agent)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {pageViews.length > pageViewsPerPage && (
                <div className="flex items-center justify-between mt-3 px-2">
                  <div className="text-xs text-muted-foreground">
                    Seite {pageViewsPage} von {Math.ceil(pageViews.length / pageViewsPerPage)}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageViewsPage(Math.max(1, pageViewsPage - 1))}
                      disabled={pageViewsPage === 1}
                      className="h-7 px-2 text-xs"
                    >
                      ‹
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageViewsPage(Math.min(Math.ceil(pageViews.length / pageViewsPerPage), pageViewsPage + 1))}
                      disabled={pageViewsPage === Math.ceil(pageViews.length / pageViewsPerPage)}
                      className="h-7 px-2 text-xs"
                    >
                      ›
                    </Button>
                  </div>
                </div>
              )}
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
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{getReadableRouteName(vital.route)}</div>
                            <div className="font-mono text-xs text-muted-foreground">{getCleanRoute(vital.route)}</div>
                          </div>
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
        </CardContent>
      )}
    </Card>
  );
};
