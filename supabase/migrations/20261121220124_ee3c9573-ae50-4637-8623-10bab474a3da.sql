DROP POLICY IF EXISTS "Anyone can log page views" ON public.page_views;
CREATE POLICY "Visitors can log plausible page views" ON public.page_views
FOR INSERT TO anon, authenticated
WITH CHECK (
  route LIKE '/%' AND length(route) <= 200
  AND (user_agent IS NULL OR length(user_agent) <= 1024)
  AND (referrer IS NULL OR length(referrer) <= 2048)
  AND created_at BETWEEN now() - interval '5 minutes' AND now() + interval '5 minutes'
);

DROP POLICY IF EXISTS "Anyone can log web vitals" ON public.web_vitals;
CREATE POLICY "Visitors can log plausible web vitals" ON public.web_vitals
FOR INSERT TO anon, authenticated
WITH CHECK (
  route LIKE '/%' AND length(route) <= 200
  AND metric_name IN ('LCP','FCP','CLS','FID','TTFB','INP')
  AND metric_value >= 0
  AND metric_value <= CASE WHEN metric_name = 'CLS' THEN 100 ELSE 600000 END
  AND (rating IS NULL OR rating IN ('good','needs-improvement','poor','unknown'))
  AND created_at BETWEEN now() - interval '5 minutes' AND now() + interval '5 minutes'
);