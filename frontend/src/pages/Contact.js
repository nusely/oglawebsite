import React from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 lg:h-[500px] overflow-hidden">
                 {/* Background Image */}
         <div 
           className="absolute inset-0 bg-cover bg-center"
           style={{
             backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://res.cloudinary.com/dpznya3mz/image/upload/v1756651306/ogla/static/hero/laveeda%20-truck-Branding.webp/laveeda_-truck-Branding.jpg')`
           }}
         />
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container">
            <div className="text-center text-white max-w-4xl mx-auto">
              <h1 className="text-4xl lg:text-6xl font-bold mb-4 font-serif">
                Get in Touch
              </h1>
              <p className="text-xl lg:text-2xl opacity-90 font-light">
                We'd love to hear from you
              </p>
              <p className="text-lg opacity-80 mt-4 max-w-2xl mx-auto">
                Have questions about our products? Want to place an order? 
                Reach out to us and we'll get back to you as soon as possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-xl text-gray-600">
              Get in touch with us for any inquiries about our products
            </p>
          </div>

        {/* Contact Form Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden-500"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden-500"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden-500"
                      placeholder="Subject"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden-500"
                      placeholder="Your message..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full btn btn-primary py-3"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <FiPhone className="text-golden-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Phone</h3>
                      <p className="text-gray-600">+233 54 152 8841</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <FiMail className="text-golden-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">oglatrade@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <FiClock className="text-golden-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Business Hours</h3>
                      <p className="text-gray-600">
                        Monday - Friday: 8:00 AM - 6:00 PM<br />
                        Saturday: 9:00 AM - 4:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Locations Section */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Locations</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lawra Location */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FiMapPin className="text-golden-500 text-xl" />
                  <h3 className="text-2xl font-bold text-gray-900">Lawra Office</h3>
                </div>
                <div className="space-y-3 mb-6">
                  <p className="text-gray-600">
                    <strong>Address:</strong><br />
                    LIME STREET, AA15<br />
                    Lawra, Upper West Region<br />
                    Ghana
                  </p>
                  <p className="text-gray-600">
                    <strong>Digital Address:</strong><br />
                    XL-0027-9443
                  </p>
                </div>
              </div>
              <div className="h-64">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3058.2391213809005!2d-2.8793469999999997!3d10.650799000000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTDCsDM5JzAyLjkiTiAywrA1Mic0NS43Ilc!5e1!3m2!1sen!2sgh!4v1756299806812!5m2!1sen!2sgh" 
                  width="100%" 
                  height="100%" 
                  style={{border:0}} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lawra Office Location"
                />
              </div>
            </div>

            {/* Accra Location */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FiMapPin className="text-golden-500 text-xl" />
                  <h3 className="text-2xl font-bold text-gray-900">Accra Office</h3>
                </div>
                <div className="space-y-3 mb-6">
                  <p className="text-gray-600">
                    <strong>Address:</strong><br />
                    Madina Estates<br />
                    Accra, Ghana
                  </p>
                  <p className="text-gray-600 text-sm italic">
                    Map coordinates to be added
                  </p>
                </div>
              </div>
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FiMapPin className="text-4xl mx-auto mb-2" />
                  <p>Map coming soon</p>
                  <p className="text-sm">Madina Estates, Accra</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
