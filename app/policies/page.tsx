'use client';

import { useState } from 'react';

const policies = [
  {
    title: 'No Scams',
    description: 'We guarantee 100% legitimate transactions. All items are delivered instantly and verified through Roblox official systems.',
  },
  {
    title: 'Trusted Producers',
    description: 'All our products come from verified creators and official Roblox partners. Quality guaranteed on every purchase.',
  },
  {
    title: 'Secure Payments',
    description: 'Your payments are secured through Roblox official currency system. We never handle direct real-money transactions.',
  },
  {
    title: 'Instant Delivery',
    description: 'All purchases are delivered instantly to your Roblox account. No waiting, no delays.',
  },
];

export default function Policies() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="animate-fade-in">
      <h1 className="text-white font-bold text-2xl mb-6">POLICIES</h1>
      
      <div className="grid grid-cols-2 gap-4">
        {policies.map((policy, index) => (
          <div
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`bg-card-bg rounded-card p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
              activeIndex === index ? 'ring-2 ring-primary' : ''
            }`}
          >
            <h3 className="text-white font-bold text-lg mb-2">{policy.title}</h3>
            <p className="text-text-muted text-sm">{policy.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-card-bg rounded-card p-6 animate-fade-in-up" key={activeIndex}>
        <h3 className="text-white font-bold text-xl mb-3">{policies[activeIndex].title}</h3>
        <p className="text-text-muted text-sm leading-relaxed">{policies[activeIndex].description}</p>
      </div>
    </div>
  );
}
