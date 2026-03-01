'use client';

import { useState } from 'react';

const aboutInfo = [
  {
    title: 'High Quality',
    description: 'We provide only the highest quality football kits and accessories. Every item is carefully selected and verified for quality assurance.',
  },
  {
    title: 'Widespread Community',
    description: 'Join thousands of satisfied customers worldwide. Our community continues to grow every day with players from all corners of Roblox.',
  },
  {
    title: 'Fast Delivery',
    description: 'Instant delivery system ensures you get your items immediately after purchase. No waiting, just gaming.',
  },
  {
    title: 'Best Prices',
    description: 'Competitive pricing on all products. We offer the best value for your Robux with regular discounts and deals.',
  },
  {
    title: 'Exclusive Items',
    description: 'Access exclusive kits and items you won\'t find anywhere else. Limited edition products available for a limited time.',
  },
  {
    title: 'Trusted Platform',
    description: 'Years of experience serving the Roblox community. Trusted by thousands of players worldwide.',
  },
];

export default function About() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="animate-fade-in">
      <h1 className="text-white font-bold text-2xl mb-6">ABOUT US</h1>
      
      <div className="grid grid-cols-2 gap-4">
        {aboutInfo.map((info, index) => (
          <div
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`bg-card-bg rounded-card p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
              activeIndex === index ? 'ring-2 ring-primary' : ''
            }`}
          >
            <h3 className="text-white font-bold text-lg mb-2">{info.title}</h3>
            <p className="text-text-muted text-sm">{info.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-card-bg rounded-card p-6 animate-fade-in-up" key={activeIndex}>
        <h3 className="text-white font-bold text-xl mb-3">{aboutInfo[activeIndex].title}</h3>
        <p className="text-text-muted text-sm leading-relaxed">{aboutInfo[activeIndex].description}</p>
      </div>

      <div className="mt-8 text-center">
        <p className="text-text-muted text-sm">Owned by <span className="text-white font-bold">Alonso</span></p>
        <p className="text-text-muted text-sm mt-1">Site made by <span className="text-white font-bold">ney</span></p>
      </div>
    </div>
  );
}
