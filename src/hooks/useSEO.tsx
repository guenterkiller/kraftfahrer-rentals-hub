import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  noindex?: boolean;
}

export const useSEO = (seoData: SEOData) => {
  const location = useLocation();
  const baseUrl = 'https://kraftfahrer-mieten.com';
  const canonicalUrl = `${baseUrl}${location.pathname}`;

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

    // Add structured data for organization
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Fahrerexpress-Agentur",
      "url": baseUrl,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+49-1577-1442285",
        "contactType": "customer service",
        "availableLanguage": "German"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Walther-von-Cronberg-Platz 12",
        "addressLocality": "Frankfurt am Main",
        "postalCode": "60594",
        "addressCountry": "DE"
      }
    };

    // Remove existing structured data
    const existingStructuredData = document.querySelector('script[type="application/ld+json"]');
    if (existingStructuredData) existingStructuredData.remove();

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

  }, [seoData, canonicalUrl]);
};