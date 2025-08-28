import React from 'react';
import { useParams } from 'react-router-dom';
import { useScroll, useTransform } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import { useBrandData } from '../hooks/useBrandData';
import Loading from '../components/Loading';

// Import sections
import {
  // La Veeda sections
  BrandHeroSection,
  ProductHighlightsSection,
  UltimateCollectionSection,
  BrandStorySection,
  IngredientPuritySection,
  ProductGridSection,
  
  // AfriSmocks sections
  AfriSmocksHeroSection,
  AfriSmocksCollectionSection,
  AfriSmocksCraftsmanshipSection,
  
  // OgriBusiness sections
  OgriBusinessHeroSection,
  OgriBusinessQualitySection,
  OgriBusinessFarmingSection,
  
  // Shared sections
  CTASection,
  LegacyBrandPage
} from '../sections';

const BrandPage = () => {
  const { brandSlug } = useParams();
  const { getBrandBySlug, getProductsByBrand } = useProducts();
  const { scrollYProgress } = useScroll();
  const scaleTransform = useTransform(scrollYProgress, [0, 1], ['scale(1)', 'scale(1.1)']);
  
  const brand = getBrandBySlug(brandSlug);
  const brandProducts = brand ? getProductsByBrand(brand._id) : [];
  const brandData = useBrandData(brandSlug);

  if (!brand) {
    return <Loading message="Brand not found" />;
  }

  const getBrandDescription = (brandSlug) => {
    switch (brandSlug) {
      case 'la-veeda':
        return {
          subtitle: "Pure Shea, Pure Care",
          description: "La Veeda brings you premium cosmetics and skincare products made with the finest natural ingredients from Lawra, Northern Ghana. Our products combine traditional African beauty wisdom with modern cosmetic science.",
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
    return (
      <div className="min-h-screen bg-white">
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

        {/* Product Highlights Section */}
        <ProductHighlightsSection
          products={brandProducts}
          brandColors={brandData.brandColors}
        />

        {/* Ultimate Skincare Collection Section */}
        <UltimateCollectionSection
          featuredProduct={brandData.featuredProduct}
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
    return (
      <div className="min-h-screen bg-white">
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

        {/* Product Highlights Section */}
        <ProductHighlightsSection
          products={brandProducts}
          title="Our Fashion Collection"
          subtitle="Discover our handcrafted traditional smocks and contemporary African fashion pieces"
          brandColors={brandData.brandColors}
        />

        {/* Ultimate Fashion Collection Section */}
        <AfriSmocksCollectionSection
          featuredProduct={brandData.featuredProduct}
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
            text: "Shop All Products",
            to: "/products"
          }}
          secondaryButton={{
            text: "Get in Touch",
            to: "/contact"
          }}
          background="gradient"
          customBackground={`linear-gradient(135deg, ${brandData.brandColors.primary}, ${brandData.brandColors.secondary})`}
        />
      </div>
    );
  }

  // OgriBusiness - Agricultural products and farming
  if (brandSlug === 'ogribusiness') {
    return (
      <div className="min-h-screen bg-white">
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

        {/* Product Highlights Section */}
        <ProductHighlightsSection
          products={brandProducts}
          title="Our Agricultural Products"
          subtitle="Discover our premium farm produce and quality agricultural products"
          brandColors={brandData.brandColors}
        />

        {/* Quality Section */}
        <OgriBusinessQualitySection
          featuredProduct={brandData.featuredProduct}
          brandColors={brandData.brandColors}
        />

        {/* Farming Section */}
        <OgriBusinessFarmingSection
          brandColors={brandData.brandColors}
        />

        {/* Ingredient Purity Section - Adapted for Agriculture */}
        <IngredientPuritySection
          title="Agricultural Excellence"
          features={[
            {
              title: 'Sustainable Farming',
              description: 'Environmentally conscious farming practices'
            },
            {
              title: 'Quality Standards',
              description: 'Export-ready products meeting international standards'
            },
            {
              title: 'Local Farmers',
              description: 'Supporting Northern Ghana farming communities'
            }
          ]}
          brandColors={brandData.brandColors}
        />

        {/* Final CTA Section */}
        <CTASection
          title="Experience OgriBusiness Quality"
          description="Ready to source premium agricultural products from Northern Ghana?"
          primaryButton={{
            text: "Shop All Products",
            to: "/products"
          }}
          secondaryButton={{
            text: "Get in Touch",
            to: "/contact"
          }}
          background="gradient"
          customBackground={`linear-gradient(135deg, ${brandData.brandColors.primary}, ${brandData.brandColors.secondary})`}
        />
      </div>
    );
  }

  // For any other brands, use the legacy design
  return (
    <LegacyBrandPage
      brand={brand}
      brandInfo={brandInfo}
      brandProducts={brandProducts}
      brandSlug={brandSlug}
    />
  );
};

export default BrandPage;
