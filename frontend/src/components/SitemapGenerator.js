import React from 'react';

// This component generates a sitemap for SEO purposes
const SitemapGenerator = () => {
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://oglasheabutter.com';
  
  // Define all your pages with their priorities and change frequencies
  const pages = [
    {
      url: '/',
      priority: '1.0',
      changefreq: 'daily',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      url: '/products',
      priority: '0.9',
      changefreq: 'weekly',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      url: '/about',
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      url: '/contact',
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      url: '/brands/la-veeda',
      priority: '0.9',
      changefreq: 'weekly',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      url: '/brands/afrismocks',
      priority: '0.9',
      changefreq: 'weekly',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      url: '/brands/ogribusiness',
      priority: '0.9',
      changefreq: 'weekly',
      lastmod: new Date().toISOString().split('T')[0]
    },
    {
      url: '/stories',
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: new Date().toISOString().split('T')[0]
    }
  ];

  const generateSitemap = () => {
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    pages.forEach(page => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
      sitemap += `    <lastmod>${page.lastmod}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });
    
    sitemap += '</urlset>';
    return sitemap;
  };

  // This would typically be used server-side to generate the actual sitemap.xml file
  // For now, we'll just return the structure
  return null;
};

export default SitemapGenerator;

// Function to generate robots.txt content
export const generateRobotsTxt = () => {
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://oglasheabutter.com';
  
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify-email
Disallow: /verify-email-pending
Disallow: /request-form
Disallow: /request-confirmation
Disallow: /my-requests

# Allow important pages
Allow: /products
Allow: /brands/
Allow: /stories
Allow: /about
Allow: /contact`;
};
