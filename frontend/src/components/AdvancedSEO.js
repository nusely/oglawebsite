import React from 'react';
import { Helmet } from 'react-helmet-async';

const AdvancedSEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  author = 'Ogla Shea Butter & General Trading',
  siteName = 'Ogla Shea Butter & General Trading',
  structuredData,
  breadcrumbs,
  canonicalUrl,
  noindex = false,
  publishedTime,
  modifiedTime,
  section,
  tags = []
}) => {
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://oglasheabutter.com';
  const defaultDescription = 'Premium shea butter products, African textiles, and business solutions. Discover La Veeda, AfriSmocks, and OgriBusiness brands. B2B trading platform for quality African products.';
  const defaultKeywords = 'shea butter, African textiles, B2B trading, La Veeda, AfriSmocks, OgriBusiness, Ghana, African products, wholesale, business solutions, premium quality, natural skincare, traditional crafts';
  const defaultImage = `${baseUrl}/images/ogla-logo.png`;

  const seoTitle = title ? `${title} | ${siteName}` : siteName;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords || defaultKeywords;
  const seoImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : defaultImage;
  const seoUrl = url ? (url.startsWith('http') ? url : `${baseUrl}${url}`) : window.location.href;
  const seoCanonical = canonicalUrl ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${baseUrl}${canonicalUrl}`) : seoUrl;

  // Default structured data for organization
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": baseUrl,
    "logo": `${baseUrl}/images/ogla-logo.png`,
    "description": defaultDescription,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Lawra, Upper West Region",
      "addressLocality": "Lawra",
      "addressRegion": "Upper West Region",
      "addressCountry": "Ghana"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+233-54-152-8841",
      "contactType": "customer service",
      "email": "oglatrade@gmail.com"
    },
    "sameAs": [
      "https://www.facebook.com/oglasheabutter",
      "https://www.instagram.com/oglasheabutter",
      "https://www.linkedin.com/company/ogla-shea-butter"
    ]
  };

  // Breadcrumb structured data
  const breadcrumbStructuredData = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url ? (crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`) : undefined
    }))
  } : null;

  // Article structured data for blog posts
  const articleStructuredData = type === 'article' ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": seoDescription,
    "image": seoImage,
    "author": {
      "@type": "Organization",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/ogla-logo.png`
      }
    },
    "datePublished": publishedTime,
    "dateModified": modifiedTime || publishedTime,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": seoUrl
    }
  } : null;

  // Product structured data
  const productStructuredData = type === 'product' ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": title,
    "description": seoDescription,
    "image": seoImage,
    "brand": {
      "@type": "Brand",
      "name": "Ogla Shea Butter & General Trading"
    },
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "priceCurrency": "GHS",
      "seller": {
        "@type": "Organization",
        "name": siteName
      }
    }
  } : null;

  // Combine all structured data
  const allStructuredData = [
    defaultStructuredData,
    structuredData,
    breadcrumbStructuredData,
    articleStructuredData,
    productStructuredData
  ].filter(Boolean);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content={author} />
      
      {/* Robots Meta */}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow"} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={seoCanonical} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tags.map(tag => <meta key={tag} property="article:tag" content={tag} />)}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      <meta name="twitter:site" content="@oglasheabutter" />
      <meta name="twitter:creator" content="@oglasheabutter" />
      
      {/* Mobile Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="theme-color" content="#b5a033" />
      <meta name="msapplication-TileColor" content="#b5a033" />
      
      {/* Favicon */}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Structured Data */}
      {allStructuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
      
      {/* Additional SEO Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="geo.region" content="GH" />
      <meta name="geo.country" content="Ghana" />
      <meta name="geo.placename" content="Lawra" />
      <meta name="language" content="en" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
    </Helmet>
  );
};

export default AdvancedSEO;
