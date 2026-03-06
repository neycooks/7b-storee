'use client';

import { useState } from 'react';

export default function ShowcasePage() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="animate-fade-in">
      <h1 className="text-white font-bold text-2xl mb-4 md:text-3xl md:mb-6">Clothing Showcase</h1>

      <div className="w-full">
        <div className="bg-card-bg rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-text-muted">Loading...</div>
            </div>
          )}
          <iframe
            src="https://dripzels.com/clothing-preview"
            className="w-full h-full border-0 rounded-2xl"
            style={{ borderRadius: '16px' }}
            allow="accelerometer; camera; gyroscope; microphone; payment"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            onLoad={() => setLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}
