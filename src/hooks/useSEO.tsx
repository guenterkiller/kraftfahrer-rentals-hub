import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  noindex?: boolean;
  structuredData?: object;
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
}

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

    // Enhanced structured data
    let structuredData = seoData.structuredData || {
      "@context": "https://schema.org",
      "@type": ["LocalBusiness", "EmploymentAgency"],
      "name": "Fahrerexpress-Agentur - Günter Killer",
      "description": "Bundesweite Vermittlung selbstständiger LKW-Fahrer, Kraftfahrer und Baumaschinenführer",
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
      "areaServed": {
        "@type": "Country",
        "name": "Deutschland"
      },
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
              "description": "Alle Speditions-Einsatzarten - Fahrmischer, ADR, Fernverkehr, Wechselbrücke, Container, Baustellenverkehr, Eventlogistik"
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
        "url": canonicalUrl,
        "description": seoData.description,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl
        }
      };

      if (seoData.articleData.articleSection) {
        (articleSchema as any).articleSection = seoData.articleData.articleSection;
      }

      // Combine schemas
      structuredData = [structuredData, articleSchema];
    }

    // Remove existing structured data
    const existingStructuredData = document.querySelectorAll('script[type="application/ld+json"][data-seo]');
    existingStructuredData.forEach(script => script.remove());

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'true');
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Add breadcrumb structured data for non-homepage
    if (location.pathname !== '/') {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Startseite",
            "item": "https://kraftfahrer-mieten.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": seoData.title.split(' | ')[0] || seoData.title,
            "item": canonicalUrl
          }
        ]
      };

      const breadcrumbScript = document.createElement('script');
      breadcrumbScript.type = 'application/ld+json';
      breadcrumbScript.setAttribute('data-seo', 'true');
      breadcrumbScript.text = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(breadcrumbScript);
    }

    // Add FAQ structured data if provided
    if (seoData.faqData && seoData.faqData.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": seoData.faqData.map((faq, index) => ({
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

  }, [seoData, canonicalUrl]);
};