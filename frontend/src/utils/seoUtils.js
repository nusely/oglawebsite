// SEO utility functions for generating page-specific SEO data

export const generateProductSEO = (product) => {
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://oglasheabutter.com';
  
  return {
    title: `${product.name} - Premium ${product.brandName || 'African'} Product`,
    description: product.shortDescription || product.description || `Discover ${product.name}, a premium quality product from ${product.brandName || 'our collection'}. Natural, authentic, and sustainably sourced.`,
    keywords: `${product.name}, ${product.brandName}, shea butter, African products, natural skincare, premium quality, Ghana, wholesale, B2B`,
    image: product.images?.[0] || '/images/ogla-logo.png',
    url: `/product/${product.slug}`,
    type: 'product',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.shortDescription || product.description,
      "image": product.images || ['/images/ogla-logo.png'],
      "brand": {
        "@type": "Brand",
        "name": product.brandName || "Ogla Shea Butter & General Trading"
      },
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "priceCurrency": "GHS",
        "price": product.price || product.pricing?.base || "Contact for pricing",
        "seller": {
          "@type": "Organization",
          "name": "Ogla Shea Butter & General Trading"
        }
      },
      "category": product.category || "African Products"
    }
  };
};

export const generateBrandSEO = (brand) => {
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://oglasheabutter.com';
  
  const brandDescriptions = {
    'la-veeda': 'Premium Quality Shea Butter, African Black Soap, and Natural Skincare Products. Sustainably sourced and traditionally handcrafted.',
    'afrismocks': 'Authentic African smocks, traditional kente cloth, and contemporary African fashion pieces. Celebrating Ghanaian heritage.',
    'ogribusiness': 'Innovative business solutions and agricultural products. Supporting local communities with sustainable practices.'
  };

  return {
    title: `${brand.name} - Premium ${brand.category} Products`,
    description: brandDescriptions[brand.slug] || brand.description || `Discover ${brand.name}, premium quality products from Ghana. Authentic, natural, and sustainably sourced.`,
    keywords: `${brand.name}, ${brand.category}, African products, Ghana, premium quality, natural, authentic, wholesale, B2B`,
    image: brand.image || '/images/ogla-logo.png',
    url: `/brands/${brand.slug}`,
    type: 'website',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Brand",
      "name": brand.name,
      "description": brandDescriptions[brand.slug] || brand.description,
      "logo": brand.image || '/images/ogla-logo.png',
      "url": `${baseUrl}/brands/${brand.slug}`,
      "sameAs": brand.socialLinks || []
    }
  };
};

export const generateStorySEO = (story) => {
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://oglasheabutter.com';
  
  return {
    title: `${story.title} - Our Story`,
    description: story.excerpt || story.content?.substring(0, 160) || `Read about ${story.title} and discover our commitment to quality and community.`,
    keywords: `${story.title}, story, community, Ghana, shea butter, African products, sustainability, tradition`,
    image: story.image || '/images/ogla-logo.png',
    url: `/stories/${story.slug}`,
    type: 'article',
    publishedTime: story.publishedAt,
    modifiedTime: story.updatedAt,
    section: 'Stories',
    tags: story.tags || ['community', 'sustainability', 'tradition'],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": story.title,
      "description": story.excerpt || story.content?.substring(0, 160),
      "image": story.image || '/images/ogla-logo.png',
      "author": {
        "@type": "Organization",
        "name": "Ogla Shea Butter & General Trading"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Ogla Shea Butter & General Trading",
        "logo": {
          "@type": "ImageObject",
          "url": "/images/ogla-logo.png"
        }
      },
      "datePublished": story.publishedAt,
      "dateModified": story.updatedAt
    }
  };
};

export const generatePageSEO = (pageData) => {
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://oglasheabutter.com';
  
  return {
    title: pageData.title,
    description: pageData.description,
    keywords: pageData.keywords,
    image: pageData.image || '/images/ogla-logo.png',
    url: pageData.url,
    type: pageData.type || 'website',
    structuredData: pageData.structuredData
  };
};

// Generate breadcrumb data for structured data
export const generateBreadcrumbs = (pathname, pageTitle) => {
  const baseUrl = process.env.REACT_APP_BASE_URL || 'https://oglasheabutter.com';
  const pathSegments = pathname.split('/').filter(segment => segment);
  
  const breadcrumbs = [
    { name: 'Home', url: '/' }
  ];
  
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    
    let name = segment;
    if (segment === 'products') name = 'Products';
    else if (segment === 'brands') name = 'Brands';
    else if (segment === 'stories') name = 'Stories';
    else if (segment === 'about') name = 'About';
    else if (segment === 'contact') name = 'Contact';
    else if (segment === 'la-veeda') name = 'La Veeda';
    else if (segment === 'afrismocks') name = 'AfriSmocks';
    else if (segment === 'ogribusiness') name = 'OgriBusiness';
    else if (isLast && pageTitle) name = pageTitle;
    else name = segment.charAt(0).toUpperCase() + segment.slice(1);
    
    breadcrumbs.push({
      name,
      url: isLast ? undefined : currentPath
    });
  });
  
  return breadcrumbs;
};

// Generate FAQ structured data
export const generateFAQStructuredData = (faqs) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

// Generate local business structured data
export const generateLocalBusinessStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Ogla Shea Butter & General Trading",
    "description": "Premium shea butter products, African textiles, and business solutions from Ghana",
    "url": "https://oglasheabutter.com",
    "telephone": "+233-54-152-8841",
    "email": "oglatrade@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Lawra, Upper West Region",
      "addressLocality": "Lawra",
      "addressRegion": "Upper West Region",
      "addressCountry": "Ghana"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "10.8469",
      "longitude": "-2.8856"
    },
    "openingHours": "Mo-Fr 08:00-18:00, Sa 09:00-16:00",
    "priceRange": "$$",
    "paymentAccepted": "Cash, Bank Transfer",
    "currenciesAccepted": "GHS, USD"
  };
};
