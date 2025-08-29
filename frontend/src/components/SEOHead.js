import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  author = 'Ogla Shea Butter & General Trading',
  siteName = 'Ogla Shea Butter & General Trading'
}) => {
  const defaultDescription = 'Premium shea butter products, African textiles, and business solutions. Discover La Veeda, AfriSmocks, and OgriBusiness brands. B2B trading platform for quality African products.';
  const defaultKeywords = 'shea butter, African textiles, B2B trading, La Veeda, AfriSmocks, OgriBusiness, Ghana, African products, wholesale, business solutions';
  const defaultImage = '/images/ogla-logo.png';
  const defaultUrl = window.location.href;

  const seoTitle = title ? `${title} | ${siteName}` : siteName;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords || defaultKeywords;
  const seoImage = image || defaultImage;
  const seoUrl = url || defaultUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content={author} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      <meta name="twitter:site" content="@oglasheabutter" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={seoUrl} />
      
      {/* Mobile Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="theme-color" content="#b5a033" />
      <meta name="msapplication-TileColor" content="#b5a033" />
      
      {/* Favicon */}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Helmet>
  );
};

export default SEOHead;
