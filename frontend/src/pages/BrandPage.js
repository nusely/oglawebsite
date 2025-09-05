import React from 'react';
import { useParams } from 'react-router-dom';
import { useScroll, useTransform } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import { useBrandData } from '../hooks/useBrandData';
import Loading from '../components/Loading';
import AdvancedSEO from '../components/AdvancedSEO';
import { generateBreadcrumbs, generateBrandSEO } from '../utils/seoUtils';

// Import sections
import {
  // La Veeda sections
  BrandHeroSection,
  ProductHighlightsSection,
  UltimateCollectionSection,
  BrandStorySection,
  IngredientPuritySection,
  ProductGridSection,
  LaVeedaProductShowcase,
  
  // AfriSmocks sections
  AfriSmocksHeroSection,
  AfriSmocksCollectionSection,
  AfriSmocksCraftsmanshipSection,
  AfriSmocksProductShowcase,
  
  // OgriBusiness sections
  OgriBusinessHeroSection,
  OgriBusinessQualitySection,
  OgriBusinessFarmingSection,
  OgriBusinessProductShowcase,
  
  // Shared sections
  CTASection,
  LegacyBrandPage
} from '../sections';

const BrandPage = () => {
  const { brandSlug } = useParams();
  const { getBrandBySlug, getProductsByBrand, products } = useProducts();
  const { scrollYProgress } = useScroll();
  const scaleTransform = useTransform(scrollYProgress, [0, 1], ['scale(1)', 'scale(1.1)']);
  
  const brand = getBrandBySlug(brandSlug);
  const brandProducts = brand ? getProductsByBrand(brand.id) : [];
  const brandData = useBrandData(brandSlug);

  if (!brand) {
    return <Loading message="Brand not found" />;
  }

  const getBrandDescription = (brandSlug) => {
    switch (brandSlug) {
      case 'la-veeda':
        return {
          subtitle: "Pure Shea, Pure Care",
          description: "Premium Quality Shea Butter, African Black Soap, and Natural Skincare Products. Sustainably sourced and traditionally handcrafted, our products deliver deep nourishment, gentle cleansing, and long-lasting care - pure beauty from nature, made for you.",
          features: [
            "100% Natural Ingredients",
            "Traditional African Formulations",
            "Modern Cosmetic Science",
            "Sustainable Sourcing"
          ]
        };
      case 'afrismocks':
        return {
          subtitle: "Authentic Ghanaian Fashion",
          description: "AfriSmocks celebrates the rich cultural heritage of Ghana through contemporary fashion that honors tradition. From handwoven smocks to vibrant African prints, each piece tells a story of craftsmanship and culture.",
          features: [
            "Handcrafted Traditional Smocks",
            "Vibrant African Prints",
            "Authentic Kente Cloth",
            "Cultural Heritage Design"
          ]
        };
      case 'ogribusiness':
        return {
          subtitle: "Premium Agricultural Products",
          description: "OgriBusiness connects farmers to global markets with quality agricultural products from Northern Ghana. We specialize in bulk farm produce, ensuring the highest standards of quality and sustainability.",
          features: [
            "Premium Quality Beans",
            "Bulk Farm Produce",
            "Export-Ready Products",
            "Sustainable Farming"
          ]
        };
      default:
        return {
          subtitle: "",
          description: brand.description,
          features: []
        };
    }
  };

  const brandInfo = getBrandDescription(brandSlug);

  // La Veeda - Premium cosmetics and skincare
  if (brandSlug === 'la-veeda') {
    const seoData = generateBrandSEO(brand);
    return (
      <div className="min-h-screen bg-white">
        <AdvancedSEO 
          {...seoData}
          breadcrumbs={generateBreadcrumbs(`/brands/${brandSlug}`, brand.name)}
        />
        {/* Hero Section */}
        <BrandHeroSection
          brand={brand}
          brandInfo={brandInfo}
          scaleTransform={scaleTransform}
          testimonials={brandData.testimonials}
          showTestimonials={brandData.showTestimonials}
          customBackground={brandData.customBackground}
          customLogo={brandData.customLogo}
        />

        {/* La Veeda Product Showcase */}
        <LaVeedaProductShowcase
          products={brandProducts}
          brandColors={brandData.brandColors}
        />

        {/* Featured Product Section */}
        <UltimateCollectionSection
          brandColors={brandData.brandColors}
        />

        {/* Brand Story Section */}
        <BrandStorySection
          brandColors={brandData.brandColors}
        />

        {/* Ingredient Purity Section */}
        <IngredientPuritySection
          brandColors={brandData.brandColors}
        />

        {/* Final CTA Section */}
        <CTASection
          title="Experience La Veeda Quality"
          description="Ready to discover authentic Ghanaian craftsmanship and natural beauty?"
          primaryButton={{
            text: "Shop All Products",
            to: "/products"
          }}
          secondaryButton={{
            text: "Get in Touch",
            to: "/contact"
          }}
          background="primary"
        />
      </div>
    );
  }

  // AfriSmocks - Traditional fashion and cultural heritage
  if (brandSlug === 'afrismocks') {
    const seoData = generateBrandSEO(brand);
    return (
      <div className="min-h-screen bg-white">
        <AdvancedSEO 
          {...seoData}
          breadcrumbs={generateBreadcrumbs(`/brands/${brandSlug}`, brand.name)}
        />
        {/* Hero Section */}
        <AfriSmocksHeroSection
          brand={brand}
          brandInfo={brandInfo}
          scaleTransform={scaleTransform}
          testimonials={brandData.testimonials}
          showTestimonials={brandData.showTestimonials}
          customBackground={brandData.customBackground}
          customLogo={brandData.customLogo}
        />

        {/* AfriSmocks Product Showcase */}
        <AfriSmocksProductShowcase
          products={brandProducts}
          brandColors={brandData.brandColors}
        />

        {/* Featured Product Section */}
        <AfriSmocksCollectionSection
          brandColors={brandData.brandColors}
        />

        {/* Craftsmanship Section */}
        <AfriSmocksCraftsmanshipSection
          brandColors={brandData.brandColors}
        />

        {/* Ingredient Purity Section - Adapted for Fashion */}
        <IngredientPuritySection
          title="Craftsmanship Excellence"
          features={[
            {
              title: 'Handcrafted',
              description: 'Traditional weaving techniques passed down through generations'
            },
            {
              title: 'Authentic Kente',
              description: 'Genuine Kente patterns and cultural significance'
            },
            {
              title: 'Quality Materials',
              description: 'Premium fabrics and sustainable sourcing'
            }
          ]}
          brandColors={brandData.brandColors}
        />

        {/* Final CTA Section */}
        <CTASection
          title="Experience AfriSmocks Quality"
          description="Ready to celebrate Ghanaian culture through authentic fashion?"
          primaryButton={{
            text: "Shop All Collections",
            to: "/products"
          }}
          secondaryButton={{
            text: "Get in Touch",
            to: "/contact"
          }}
          customBackground="#1E40AF"
        />
      </div>
    );
  }

  // OgriBusiness - Agricultural products and farm produce
  if (brandSlug === 'ogribusiness') {
    const seoData = generateBrandSEO(brand);
    return (
      <div className="min-h-screen bg-white">
        <AdvancedSEO 
          {...seoData}
          breadcrumbs={generateBreadcrumbs(`/brands/${brandSlug}`, brand.name)}
        />
        {/* Hero Section */}
        <OgriBusinessHeroSection
          brand={brand}
          brandInfo={brandInfo}
          scaleTransform={scaleTransform}
          testimonials={brandData.testimonials}
          showTestimonials={brandData.showTestimonials}
          customBackground={brandData.customBackground}
          customLogo={brandData.customLogo}
        />

        {/* OgriBusiness Product Showcase */}
        <OgriBusinessProductShowcase
          products={brandProducts}
          brandColors={brandData.brandColors}
        />

        {/* Featured Product Section */}
        <OgriBusinessQualitySection
          featuredProduct={brandData.featuredProduct}
          brandColors={brandData.brandColors}
        />

        {/* Farming Section */}
        <OgriBusinessFarmingSection
          brandColors={brandData.brandColors}
        />

        {/* Final CTA Section */}
        <CTASection
          title="Experience OgriBusiness Quality"
          description="Ready to source premium agricultural products from Northern Ghana?"
          primaryButton={{
            text: "View All Products",
            to: "/products"
          }}
          secondaryButton={{
            text: "Get in Touch",
            to: "/contact"
          }}
          background="primary"
        />
      </div>
    );
  }

  // Fallback for unknown brands
  return <LegacyBrandPage 
    brand={brand} 
    brandInfo={brandInfo}
    brandProducts={brandProducts}
    brandSlug={brandSlug}
  />;
};

export default BrandPage;
