import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import SEOHead from '../components/SEOHead';

const StoryDetail = () => {
  const { slug } = useParams();

  // Sample stories data (this would come from your stories page)
  const stories = [
    {
      id: 1,
      title: "Ogla Shea Butter Expands to International Markets",
      excerpt: "We're excited to announce our expansion into European markets, bringing authentic Ghanaian shea butter to new customers worldwide.",
      content: `Our journey to international markets has been a remarkable one. Starting from our local roots in Ghana, we've built strong partnerships with European distributors who share our commitment to quality and sustainability.

This expansion represents not just business growth, but the global recognition of Ghanaian craftsmanship and natural products. Through careful planning and strategic partnerships, we've successfully entered markets in Germany, France, and the Netherlands.

The response from European customers has been overwhelmingly positive. They appreciate not only the quality of our products but also the story behind them - the women in rural Ghana who carefully harvest and process the shea nuts, the traditional methods we preserve, and the sustainable practices we maintain.

This expansion has created new opportunities for our local communities. We've been able to increase our production capacity, hire more local workers, and invest in better equipment while maintaining our commitment to fair trade practices.

Looking ahead, we're excited to continue our international growth while staying true to our roots and values. We believe that the world is ready for authentic, high-quality African products, and we're proud to be leading the way.`,
      author: "Elizabeth Simons",
      date: "August 28, 2024",
      category: "Business Growth",
      image: "/images/imageplaceholder.webp",
      slug: "international-expansion",
      readTime: "3 min read"
    },
    {
      id: 2,
      title: "New Partnership with Ghana Shea Alliance",
      excerpt: "Strategic collaboration with Ghana Shea Alliance to enhance quality standards and support local shea butter producers.",
      content: `This partnership represents a significant milestone in our commitment to supporting local communities and maintaining the highest quality standards. Through this collaboration, we're working together to improve production techniques, ensure fair trade practices, and create sustainable economic opportunities for shea butter producers across Ghana.

The Ghana Shea Alliance brings decades of experience in shea butter production and community development. Their expertise in quality control, sustainable farming practices, and market development perfectly complements our own strengths in product innovation and international distribution.

Together, we're implementing new quality assurance protocols that exceed international standards. This includes better testing methods, improved packaging, and more rigorous quality control processes throughout the entire production chain.

We're also working on educational programs for local producers, sharing best practices for sustainable harvesting, proper processing techniques, and quality control. This knowledge transfer ensures that all producers in our network can meet the highest standards.

The partnership has already resulted in improved product quality and increased market access for local producers. We're seeing better prices for our farmers and more consistent product quality for our customers.`,
      author: "Marketing Team",
      date: "August 25, 2024",
      category: "Partnerships",
      image: "/images/imageplaceholder.webp",
      slug: "ghana-shea-alliance-partnership",
      readTime: "4 min read"
    },
    {
      id: 3,
      title: "Sustainable Farming Practices in Our Supply Chain",
      excerpt: "Discover how we're implementing eco-friendly farming methods to protect the environment while maintaining product quality.",
      content: `Sustainability is at the heart of everything we do. Our commitment to eco-friendly farming practices ensures that we not only produce high-quality products but also protect the environment for future generations.

We've implemented a comprehensive sustainability program that covers every aspect of our supply chain. This includes organic farming methods, water conservation techniques, waste reduction initiatives, and renewable energy adoption.

Our farmers are trained in sustainable agricultural practices that preserve soil health and biodiversity. We use crop rotation, natural pest control methods, and organic fertilizers to maintain soil fertility without harming the environment.

Water conservation is another key focus area. We've introduced drip irrigation systems, rainwater harvesting techniques, and water-efficient processing methods. This not only reduces our environmental impact but also helps our farmers cope with changing weather patterns.

Waste reduction is achieved through comprehensive recycling programs, composting organic waste, and finding innovative uses for by-products. For example, shea nut shells are used as fuel for processing, and leftover plant material is composted to enrich the soil.

We're also investing in renewable energy sources, including solar panels for our processing facilities and biogas systems for waste management. This reduces our carbon footprint and provides reliable energy sources for our operations.`,
      author: "Sustainability Team",
      date: "August 22, 2024",
      category: "Sustainability",
      image: "/images/imageplaceholder.webp",
      slug: "sustainable-farming-practices",
      readTime: "5 min read"
    },
    {
      id: 4,
      title: "AfriSmocks Collection Launch Success",
      excerpt: "Our latest AfriSmocks collection has received overwhelming positive feedback from customers and fashion enthusiasts.",
      content: `The launch of our new AfriSmocks collection has been a tremendous success, showcasing the rich cultural heritage of Ghana through contemporary fashion. The collection features traditional patterns reimagined for modern wear, creating pieces that are both culturally significant and fashion-forward.

Our design team worked closely with local artisans and cultural experts to ensure that each piece authentically represents Ghanaian heritage while appealing to modern fashion sensibilities. The collection includes traditional smocks, modern interpretations, and fusion pieces that blend traditional elements with contemporary styles.

The response from customers has been overwhelmingly positive. We've received orders from across Ghana, neighboring African countries, and even international markets. Customers appreciate the quality of craftsmanship, the cultural significance, and the modern styling of our pieces.

The success of this collection has created new opportunities for local artisans. We've been able to expand our network of skilled craftspeople, providing them with fair compensation and stable income. This has helped preserve traditional crafting techniques while creating economic opportunities in rural communities.

We're already working on our next collection, which will feature new patterns, colors, and styles while maintaining the same commitment to quality and cultural authenticity.`,
      author: "Design Team",
      date: "August 20, 2024",
      category: "Product Launch",
      image: "/images/imageplaceholder.webp",
      slug: "afrismocks-launch-success",
      readTime: "3 min read"
    },
    {
      id: 5,
      title: "Supporting Local Artisans Through OgriBusiness",
      excerpt: "How our OgriBusiness initiative is creating economic opportunities for local artisans and craftspeople.",
      content: `Through our OgriBusiness initiative, we're proud to support local artisans and craftspeople, providing them with fair compensation and market access. This program not only helps preserve traditional crafts but also creates sustainable economic opportunities in rural communities.

The OgriBusiness program was designed to address the challenges faced by local artisans, including limited market access, inconsistent income, and lack of training opportunities. We work directly with artisans to understand their needs and develop solutions that benefit both them and our customers.

We provide training in modern business practices, quality control, and marketing while preserving traditional crafting techniques. This helps artisans improve their products and reach new markets while maintaining the authenticity that makes their work special.

Our fair trade practices ensure that artisans receive fair compensation for their work. We pay above-market rates and provide advance payments to help with material costs. This financial stability allows artisans to invest in better tools, materials, and training.

The program has already helped dozens of artisans improve their livelihoods. Many have been able to expand their workshops, hire additional workers, and send their children to school. This creates a positive ripple effect throughout their communities.

We're committed to expanding this program to reach more artisans across Ghana. Our goal is to create a sustainable ecosystem that supports traditional crafts while providing economic opportunities for rural communities.`,
      author: "Community Relations",
      date: "August 18, 2024",
      category: "Community",
      image: "/images/imageplaceholder.webp",
      slug: "supporting-local-artisans",
      readTime: "4 min read"
    },
    {
      id: 6,
      title: "Quality Assurance: Behind the Scenes",
      excerpt: "Take a look at our rigorous quality control processes that ensure every product meets our high standards.",
      content: `Quality is non-negotiable at Ogla Shea Butter. Our comprehensive quality assurance process involves multiple stages of testing and verification, from raw material inspection to final product evaluation. This commitment to excellence ensures that our customers receive only the best products.

Our quality control process begins at the source - the shea trees and farms where our raw materials are harvested. We work closely with our farmers to ensure that only the best quality nuts are selected and that harvesting is done at the optimal time for maximum quality.

Once harvested, the nuts undergo rigorous testing for moisture content, oil content, and purity. We use both traditional methods and modern testing equipment to ensure accuracy. Any nuts that don't meet our standards are rejected, even if it means reduced production volume.

During processing, we maintain strict hygiene standards and temperature controls. Our processing facilities are regularly inspected and certified to meet international food safety standards. Every batch is tested for consistency, purity, and quality before being approved for packaging.

Our packaging process includes additional quality checks to ensure that products are properly sealed, labeled, and stored. We use high-quality packaging materials that protect the product while being environmentally friendly.

The final step in our quality assurance process is customer feedback. We actively seek and respond to customer feedback to continuously improve our products and processes. This commitment to quality has earned us the trust of customers worldwide.`,
      author: "Quality Control Team",
      date: "August 15, 2024",
      category: "Quality",
      image: "/images/imageplaceholder.webp",
      slug: "quality-assurance-behind-scenes",
      readTime: "4 min read"
    }
  ];

  // Find the story by slug
  const story = stories.find(s => s.slug === slug);

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Story Not Found</h1>
          <p className="text-gray-600 mb-6">The story you're looking for doesn't exist.</p>
          <Link to="/stories" className="bg-golden-600 text-white px-6 py-3 rounded-lg hover:bg-golden-700 transition-colors">
            Back to Stories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${story.title} - Ogla Shea Butter & General Trading`}
        description={story.excerpt}
        keywords={`${story.category}, Ogla news, shea butter, Ghana business`}
        image={story.image}
        type="article"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Back Button */}
        <div className="bg-white border-b border-gray-200">
          <div className="container py-4">
            <Link 
              to="/stories" 
              className="inline-flex items-center text-golden-600 hover:text-golden-700 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Back to Stories
            </Link>
          </div>
        </div>

        {/* Story Content */}
        <div className="container py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            {/* Story Header */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="relative h-64 md:h-80">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="bg-golden-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-3 inline-block">
                    {story.category}
                  </span>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                    {story.title}
                  </h1>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <FiUser className="w-4 h-4" />
                      <span>{story.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" />
                      <span>{story.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4" />
                      <span>{story.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Story Body */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="prose prose-lg max-w-none">
                {story.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed mb-6">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Story Footer */}
              <div className="border-t border-gray-200 mt-8 pt-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Share this story:</span>
                    <div className="flex gap-2">
                      <button className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                        <span className="text-xs font-bold">f</span>
                      </button>
                      <button className="w-8 h-8 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                        <span className="text-xs font-bold">t</span>
                      </button>
                      <button className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors">
                        <span className="text-xs font-bold">w</span>
                      </button>
                    </div>
                  </div>
                  <Link 
                    to="/stories" 
                    className="text-golden-600 hover:text-golden-700 font-semibold transition-colors"
                  >
                    View All Stories →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default StoryDetail;
