import React from 'react';
import { motion } from 'framer-motion';

// Skeleton animation
const skeletonAnimation = {
  initial: { opacity: 0.6 },
  animate: { 
    opacity: [0.6, 1, 0.6],
    transition: { 
      duration: 1.5, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }
  }
};

// Product Card Skeleton
export const ProductCardSkeleton = () => (
  <motion.div 
    className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col"
    variants={skeletonAnimation}
    initial="initial"
    animate="animate"
  >
    {/* Image skeleton */}
    <div className="relative overflow-hidden aspect-square bg-gray-200">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
    </div>
    
    {/* Content skeleton */}
    <div className="p-3 sm:p-4 flex-1 flex flex-col">
      {/* Brand name skeleton */}
      <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
      
      {/* Product name skeleton */}
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
      
      {/* Description skeleton */}
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
      
      {/* Price skeleton */}
      <div className="h-5 bg-gray-200 rounded w-20 mb-3 mt-auto"></div>
      
      {/* Buttons skeleton */}
      <div className="flex space-x-2 mt-auto">
        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  </motion.div>
);

// Hero Section Skeleton
export const HeroSkeleton = () => (
  <motion.div 
    className="relative h-96 bg-gray-200 overflow-hidden"
    variants={skeletonAnimation}
    initial="initial"
    animate="animate"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
    <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
      <div className="max-w-2xl">
        <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-gray-300 rounded w-full mb-2"></div>
        <div className="h-6 bg-gray-300 rounded w-2/3 mb-6"></div>
        <div className="flex space-x-4">
          <div className="h-10 bg-gray-300 rounded w-32"></div>
          <div className="h-10 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    </div>
  </motion.div>
);

// Brand Card Skeleton
export const BrandCardSkeleton = () => (
  <motion.div 
    className="relative h-64 rounded-lg overflow-hidden bg-gray-200"
    variants={skeletonAnimation}
    initial="initial"
    animate="animate"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
    <div className="relative z-10 h-full flex flex-col justify-end p-6">
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-gray-300 rounded w-24"></div>
    </div>
  </motion.div>
);

// Testimonial Skeleton
export const TestimonialSkeleton = () => (
  <motion.div 
    className="bg-white rounded-lg p-6 shadow-md"
    variants={skeletonAnimation}
    initial="initial"
    animate="animate"
  >
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </motion.div>
);

// Search Results Skeleton
export const SearchResultsSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

// Page Loading Skeleton
export const PageLoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <HeroSkeleton />
    <div className="container mx-auto px-4 py-12">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
      <SearchResultsSkeleton count={9} />
    </div>
  </div>
);

// Generic Skeleton
export const Skeleton = ({ className = "h-4 bg-gray-200 rounded", width = "w-full" }) => (
  <motion.div 
    className={`${className} ${width}`}
    variants={skeletonAnimation}
    initial="initial"
    animate="animate"
  />
);

export default {
  ProductCardSkeleton,
  HeroSkeleton,
  BrandCardSkeleton,
  TestimonialSkeleton,
  SearchResultsSkeleton,
  PageLoadingSkeleton,
  Skeleton
};
