import { useMemo } from 'react';

export const useBrandData = (brandSlug) => {
  const brandData = useMemo(() => {
    switch (brandSlug) {
      case 'la-veeda':
        return {
          testimonials: [
            {
              id: 1,
              customerImage: 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651280/ogla/static/brands/laveeda/la%20veeda%20model%202%202.jpg/la_veeda_model_2_2.jpg',
              customerName: 'Customer 1',
              reviewCount: '45',
              productName: 'Pure Shea Butter'
            },
            {
              id: 2,
              customerImage: 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651281/ogla/static/brands/laveeda/la%20veeda%20model%204.jpg/la_veeda_model_4.jpg',
              customerName: 'Customer 2',
              reviewCount: '231',
              productName: '250ml Shea Butter'
            }
          ],
          featuredProduct: null, // Will be fetched from database
          brandColors: {
            primary: '#1e4735',
            secondary: '#e8d77c',
            accent: '#ffffff'
          },
          customBackground: `linear-gradient(rgba(30, 71, 53, 0.4), rgba(30, 71, 53, 0.4)), url('/images/laveeda-truck-Branding.webp')`,
          customLogo: 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651327/ogla/static/la-veeda-icon.png/la-veeda-icon.png',
          showTestimonials: true
        };
      
             case 'afrismocks':
         return {
           testimonials: [
             {
               id: 1,
               customerImage: 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651266/ogla/static/brands/afrismocks/Image_testimonial3.webp/Image_testimonial3.jpg',
               customerName: 'Fashion Enthusiast',
               reviewCount: '20',
               productName: 'Traditional Smock'
             },
             {
               id: 2,
               customerImage: 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651268/ogla/static/brands/afrismocks/Image_testimonial4.webp/Image_testimonial4.jpg',
               customerName: 'Cultural Ambassador',
               reviewCount: '51',
               productName: 'Kente Cloth'
             }
           ],
                     featuredProduct: null, // Will be fetched from database
           brandColors: {
             primary: '#1E40AF',
             secondary: '#3B82F6',
             accent: '#FFFFFF'
           },
           customBackground: `linear-gradient(rgba(30, 64, 175, 0.4), rgba(59, 130, 246, 0.4)), url('https://res.cloudinary.com/dpznya3mz/image/upload/v1756651258/ogla/static/afrismocks_card.webp/afrismocks_card.jpg')`,
           customLogo: 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651255/ogla/static/afrismocks-icon.png/afrismocks-icon.png',
           showTestimonials: true
         };
      
      case 'ogribusiness':
        return {
          testimonials: [
            {
              id: 1,
              customerImage: 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651299/ogla/static/brands/ogribusiness/Image_testimonial1.webp/Image_testimonial1.jpg',
              customerName: 'Local Farmer',
              reviewCount: '15',
              productName: 'Premium Beans'
            },
            {
              id: 2,
              customerImage: 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651300/ogla/static/brands/ogribusiness/Image_testimonial2.webp/Image_testimonial2.jpg',
              customerName: 'Export Partner',
              reviewCount: '90',
              productName: 'Bulk Farm Produce'
            }
          ],
          featuredProduct: null, // Will be fetched from database
          brandColors: {
            primary: '#2E7D32',
            secondary: '#4CAF50',
            accent: '#8BC34A'
          },
          customBackground: `linear-gradient(rgba(46, 125, 50, 0.4), rgba(76, 175, 80, 0.4)), url('https://res.cloudinary.com/dpznya3mz/image/upload/v1756651338/ogla/static/ogribusiness_card.webp/ogribusiness_card.png')`,
          customLogo: 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651337/ogla/static/ogribusiness-icon.png/ogribusiness-icon.png',
          showTestimonials: true
        };
      
      default:
        return {
          testimonials: [],
          featuredProduct: null,
          brandColors: {
            primary: '#1e4735',
            secondary: '#e8d77c',
            accent: '#ffffff'
          },
          showTestimonials: false
        };
    }
  }, [brandSlug]);

  return brandData;
};
