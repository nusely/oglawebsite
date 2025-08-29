import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import ProductCard from './ProductCard';

const RelatedProducts = ({ currentProduct, products, maxProducts = 4 }) => {
  // Get related products based on same brand and category
  const getRelatedProducts = () => {
    if (!currentProduct || !products) return [];

    const related = products.filter(product => 
      product._id !== currentProduct._id && // Exclude current product
      (product.brandId === currentProduct.brandId || // Same brand
       product.categoryId === currentProduct.categoryId) // Same category
    );

    // Sort by relevance: same brand + category first, then same brand, then same category
    return related.sort((a, b) => {
      const aScore = (a.brandId === currentProduct.brandId ? 2 : 0) + 
                     (a.categoryId === currentProduct.categoryId ? 1 : 0);
      const bScore = (b.brandId === currentProduct.brandId ? 2 : 0) + 
                     (b.categoryId === currentProduct.categoryId ? 1 : 0);
      return bScore - aScore;
    }).slice(0, maxProducts);
  };

  const relatedProducts = getRelatedProducts();

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Related Products
          </h2>
          <p className="text-gray-600">
            You might also like these products
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {relatedProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* View All Products Link */}
        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 text-golden-600 hover:text-golden-700 font-semibold transition-colors duration-300"
          >
            <span>View All Products</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
