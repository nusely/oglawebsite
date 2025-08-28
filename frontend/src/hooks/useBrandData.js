import { useMemo } from 'react';

export const useBrandData = (brandSlug) => {
  const brandData = useMemo(() => {
    switch (brandSlug) {
      case 'la-veeda':
        return {
          testimonials: [
            {
              id: 1,
              customerImage: '/images/brands/laveeda/la veeda model 2 2.jpg',
              customerName: 'Customer 1',
              reviewCount: '45',
              productName: 'Pure Shea Butter'
            },
            {
              id: 2,
              customerImage: '/images/brands/laveeda/la veeda model 4.jpg',
              customerName: 'Customer 2',
              reviewCount: '231',
              productName: '250ml Shea Butter'
            }
          ],
          featuredProduct: {
            name: 'Avocado infused body butter',
            description: 'Advanced hydration with natural shea butter and essential oils',
            price: '₵156.00',
            image: '/images/brands/laveeda/renew.jpg'
          },
          brandColors: {
            primary: '#1e4735',
            secondary: '#e8d77c',
            accent: '#ffffff'
          },
          customBackground: `linear-gradient(rgba(30, 71, 53, 0.4), rgba(30, 71, 53, 0.4)), url('/images/laveeda-truck-Branding.webp')`,
          customLogo: '/images/la-veeda-icon.png',
          showTestimonials: true
        };
      
             case 'afrismocks':
         return {
           testimonials: [
             {
               id: 1,
               customerImage: '/images/brands/afrismocks/Image_testimonial3.webp',
               customerName: 'Fashion Enthusiast',
               reviewCount: '20',
               productName: 'Traditional Smock'
             },
             {
               id: 2,
               customerImage: '/images/brands/afrismocks/Image_testimonial4.webp',
               customerName: 'Cultural Ambassador',
               reviewCount: '51',
               productName: 'Kente Cloth'
             }
           ],
           featuredProduct: {
             name: 'Premium Kente Smock Collection',
             description: 'Handcrafted traditional smocks with authentic Kente patterns',
             price: '₵450.00',
             image: '/images/brands/afrismock_cat/Kente_afrismock.webp'
           },
           brandColors: {
             primary: '#1E40AF',
             secondary: '#3B82F6',
             accent: '#FFFFFF'
           },
           customBackground: `linear-gradient(rgba(30, 64, 175, 0.4), rgba(59, 130, 246, 0.4)), url('/images/afrismocks_card.webp')`,
           customLogo: '/images/afrismocks-icon.png',
           showTestimonials: true
         };
      
      case 'ogribusiness':
        return {
          testimonials: [
            {
              id: 1,
              customerImage: '/images/brands/ogribusiness/Image_testimonial1.webp',
              customerName: 'Local Farmer',
              reviewCount: '15',
              productName: 'Premium Beans'
            },
            {
              id: 2,
              customerImage: '/images/brands/ogribusiness/Image_testimonial2.webp',
              customerName: 'Export Partner',
              reviewCount: '90',
              productName: 'Bulk Farm Produce'
            }
          ],
          featuredProduct: {
            name: 'Premium White Beans - 25kg',
            description: 'High-quality white beans sourced from Northern Ghana farms',
            price: '₵280.00',
            image: '/images/brands/ogribusiness_cat/5kg_Ogri_Beans.webp'
          },
          brandColors: {
            primary: '#2E7D32',
            secondary: '#4CAF50',
            accent: '#8BC34A'
          },
          customBackground: `linear-gradient(rgba(46, 125, 50, 0.4), rgba(76, 175, 80, 0.4)), url('/images/ogribusiness_card.webp')`,
          customLogo: '/images/ogribusiness-icon.png',
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
