import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  noindex?: boolean;
  structuredData?: object;
  breadcrumbs?: BreadcrumbItem[];
  faqData?: Array<{
    question: string;
    answer: string;
  }>;
  articleData?: {
    headline: string;
    datePublished: string;
    dateModified?: string;
    author: string;
    articleSection?: string;
  };
  // Internationale SEO
  hreflang?: {
    de?: string; // Deutschland
    'de-AT'?: string; // Österreich
    'de-CH'?: string; // Schweiz
    en?: string; // International English
    pl?: string; // Polen
    ro?: string; // Rumänien
    bg?: string; // Bulgarien
    hu?: string; // Ungarn
    'x-default'?: string; // Default für alle anderen
  };
}

// Automatische Breadcrumb-Generierung basierend auf Route
const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const baseUrl = 'https://kraftfahrer-mieten.com';
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Startseite', url: baseUrl }
  ];

  // Route-zu-Name Mapping
  const routeNames: Record<string, string> = {
    '/lkw-fahrer-buchen': 'LKW CE Fahrer buchen',
    '/baumaschinenfuehrer-buchen': 'Baumaschinenführer buchen',
    '/kraftfahrer-mieten': 'Kraftfahrer mieten',
    '/fahrer-registrierung': 'Fahrer werden',
    '/begleitfahrzeuge-bf3': 'BF3 Begleitfahrzeuge',
    '/bf3-ablauf-kosten': 'BF3 Ablauf & Kosten',
    '/preise-und-ablauf': 'Preise & Ablauf',
    '/projekte': 'Erfolgreiche Projekte',
    '/versicherung': 'Versicherungen',
    '/wissenswertes': 'Wissenswertes',
    '/vermittlung': 'Vermittlung',
    '/impressum': 'Impressum',
    '/datenschutz': 'Datenschutz',
  };

  if (pathname !== '/') {
    const pageName = routeNames[pathname] || pathname.slice(1).replace(/-/g, ' ');
    breadcrumbs.push({
      name: pageName,
      url: `${baseUrl}${pathname}`
    });
  }

  return breadcrumbs;
};

export const useSEO = (seoData: SEOData) => {
  const location = useLocation();
  const baseUrl = 'https://kraftfahrer-mieten.com';
  // Für die Startseite explizit mit trailing slash
  const canonicalUrl = location.pathname === '/' 
    ? 'https://kraftfahrer-mieten.com/' 
    : `${baseUrl}${location.pathname}`;

  useEffect(() => {
    // Set page title
    document.title = seoData.title;

    // Remove existing SEO meta tags
    const existingMetas = document.querySelectorAll('meta[data-seo]');
    existingMetas.forEach(meta => meta.remove());

    // Remove existing canonical link
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) existingCanonical.remove();

    // Add canonical URL
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = canonicalUrl;
    document.head.appendChild(canonical);

    // Add meta description
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = seoData.description;
    metaDescription.setAttribute('data-seo', 'true');
    document.head.appendChild(metaDescription);

    // Add keywords if provided
    if (seoData.keywords) {
      const metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      metaKeywords.content = seoData.keywords;
      metaKeywords.setAttribute('data-seo', 'true');
      document.head.appendChild(metaKeywords);
    }

    // Add robots meta
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = seoData.noindex ? 'noindex, nofollow' : 'index, follow';
    metaRobots.setAttribute('data-seo', 'true');
    document.head.appendChild(metaRobots);

    // Open Graph tags
    // Add language tag for international SEO
    const ogLocale = document.createElement('meta');
    ogLocale.setAttribute('property', 'og:locale');
    ogLocale.content = 'de_DE';
    ogLocale.setAttribute('data-seo', 'true');
    document.head.appendChild(ogLocale);

    // Alternative locales for DACH region
    const ogLocaleAT = document.createElement('meta');
    ogLocaleAT.setAttribute('property', 'og:locale:alternate');
    ogLocaleAT.content = 'de_AT';
    ogLocaleAT.setAttribute('data-seo', 'true');
    document.head.appendChild(ogLocaleAT);

    const ogLocaleCH = document.createElement('meta');
    ogLocaleCH.setAttribute('property', 'og:locale:alternate');
    ogLocaleCH.content = 'de_CH';
    ogLocaleCH.setAttribute('data-seo', 'true');
    document.head.appendChild(ogLocaleCH);

    const ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.content = seoData.title;
    ogTitle.setAttribute('data-seo', 'true');
    document.head.appendChild(ogTitle);

    const ogDescription = document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.content = seoData.description;
    ogDescription.setAttribute('data-seo', 'true');
    document.head.appendChild(ogDescription);

    const ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    ogUrl.content = canonicalUrl;
    ogUrl.setAttribute('data-seo', 'true');
    document.head.appendChild(ogUrl);

    const ogType = document.createElement('meta');
    ogType.setAttribute('property', 'og:type');
    ogType.content = 'website';
    ogType.setAttribute('data-seo', 'true');
    document.head.appendChild(ogType);

    if (seoData.ogImage) {
      const ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      ogImage.content = seoData.ogImage;
      ogImage.setAttribute('data-seo', 'true');
      document.head.appendChild(ogImage);
    }

    // Twitter Card tags
    const twitterCard = document.createElement('meta');
    twitterCard.name = 'twitter:card';
    twitterCard.content = 'summary_large_image';
    twitterCard.setAttribute('data-seo', 'true');
    document.head.appendChild(twitterCard);

    const twitterTitle = document.createElement('meta');
    twitterTitle.name = 'twitter:title';
    twitterTitle.content = seoData.title;
    twitterTitle.setAttribute('data-seo', 'true');
    document.head.appendChild(twitterTitle);

    const twitterDescription = document.createElement('meta');
    twitterDescription.name = 'twitter:description';
    twitterDescription.content = seoData.description;
    twitterDescription.setAttribute('data-seo', 'true');
    document.head.appendChild(twitterDescription);

    if (seoData.ogImage) {
      const twitterImage = document.createElement('meta');
      twitterImage.name = 'twitter:image';
      twitterImage.content = seoData.ogImage;
      twitterImage.setAttribute('data-seo', 'true');
      document.head.appendChild(twitterImage);
    }

    // hreflang tags for international SEO (DACH region + international)
    // Remove existing hreflang tags
    const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflangs.forEach(link => link.remove());

    // Add hreflang tags if provided, otherwise add default DACH tags
    const hreflangData = seoData.hreflang || {
      'de': canonicalUrl,
      'de-AT': canonicalUrl,
      'de-CH': canonicalUrl,
      'x-default': canonicalUrl
    };

    Object.entries(hreflangData).forEach(([lang, url]) => {
      const hreflang = document.createElement('link');
      hreflang.rel = 'alternate';
      hreflang.hreflang = lang;
      hreflang.href = url;
      document.head.appendChild(hreflang);
    });

    // Remove existing structured data scripts
    const existingStructuredData = document.querySelectorAll('script[type="application/ld+json"][data-seo]');
    existingStructuredData.forEach(script => script.remove());

    // Breadcrumb structured data (automatisch oder manuell)
    const breadcrumbs = seoData.breadcrumbs || generateBreadcrumbs(location.pathname);
    if (breadcrumbs.length > 1) {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.url
        }))
      };

      const breadcrumbScript = document.createElement('script');
      breadcrumbScript.type = 'application/ld+json';
      breadcrumbScript.setAttribute('data-seo', 'true');
      breadcrumbScript.text = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(breadcrumbScript);
    }

    // Enhanced structured data
    let structuredData = seoData.structuredData || {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Fahrerexpress-Agentur - Günter Killer",
      "description": "Bundesweite Vermittlung selbstständiger LKW-Fahrer, Kraftfahrer und Baumaschinenführer für kurzfristige Einsätze",
      "url": baseUrl,
      "telephone": "+49-1577-1442285",
      "email": "info@kraftfahrer-mieten.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Walther-von-Cronberg-Platz 12",
        "addressLocality": "Frankfurt am Main",
        "postalCode": "60594",
        "addressCountry": "DE"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 50.110924,
        "longitude": 8.682127
      },
      "areaServed": [
        {
          "@type": "Country",
          "name": "Deutschland"
        },
        {
          "@type": "Country",
          "name": "Österreich"
        },
        {
          "@type": "Country",
          "name": "Schweiz"
        },
        {
          "@type": "Place",
          "name": "Europäische Union"
        }
      ],
      "serviceType": ["Baumaschinenführer Vermittlung", "LKW CE Fahrer Vermittlung", "Fahrerdienstleistungen Subunternehmer"],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Fahrerdienstleistungen",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Baumaschinenführer",
              "description": "Vermittelte Baumaschinenführer - Bagger, Radlader, Fahrmischer, Flüssigboden, Mischanlagen, Störungsbehebung, Baustellenlogistik"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "LKW CE Fahrer",
              "description": "Alle Einsatzarten - Fahrmischer, ADR, Fernverkehr, Wechselbrücke, Container, Baustellenverkehr, Eventlogistik"
            }
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "127"
      },
      "sameAs": [
        "https://kraftfahrer-mieten.com"
      ]
    };

    // Add article structured data if provided
    if (seoData.articleData) {
      const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": seoData.articleData.headline,
        "datePublished": seoData.articleData.datePublished,
        "dateModified": seoData.articleData.dateModified || seoData.articleData.datePublished,
        "author": {
          "@type": "Person",
          "name": seoData.articleData.author
        },
        "publisher": {
          "@type": "Organization",
          "name": "Fahrerexpress-Agentur",
          "logo": {
            "@type": "ImageObject",
            "url": "https://kraftfahrer-mieten.com/lovable-uploads/favicon-truck-512-full.png"
          }
        },
        "articleSection": seoData.articleData.articleSection || "Fahrerdienstleistungen"
      };

      // Combine schemas
      structuredData = [structuredData, articleSchema];
    }

    // Add main structured data
    const mainScript = document.createElement('script');
    mainScript.type = 'application/ld+json';
    mainScript.setAttribute('data-seo', 'true');
    mainScript.text = JSON.stringify(structuredData);
    document.head.appendChild(mainScript);

    // Add FAQ structured data if provided
    if (seoData.faqData && seoData.faqData.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": seoData.faqData.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer.replace(/<[^>]*>/g, '') // Remove HTML tags for schema
          }
        }))
      };

      const faqScript = document.createElement('script');
      faqScript.type = 'application/ld+json';
      faqScript.setAttribute('data-seo', 'true');
      faqScript.text = JSON.stringify(faqSchema);
      document.head.appendChild(faqScript);
    }

  }, [seoData, canonicalUrl, location.pathname]);
};
