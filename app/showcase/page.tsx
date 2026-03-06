'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

type ModelType = 'man' | 'woman' | 'blocky' | 'curvy';
type LightingPreset = 'day' | 'night' | 'studio';
type QualityPreset = 'low' | 'medium' | 'high';

export default function ShowcasePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [shirtImage, setShirtImage] = useState<string | null>(null);
  const [pantsImage, setPantsImage] = useState<string | null>(null);
  const [modelType, setModelType] = useState<ModelType>('man');
  const [lighting, setLighting] = useState<LightingPreset>('day');
  const [quality, setQuality] = useState<QualityPreset>('medium');
  const [rendering, setRendering] = useState(false);
  const [preview2D, setPreview2D] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Three.js scene
    initScene();
  }, []);

  const initScene = async () => {
    setLoading(false);
  };

  const handleShirtUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setShirtImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePantsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPantsImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRender = () => {
    setRendering(true);
    setTimeout(() => {
      setRendering(false);
      // Generate 2D preview
      if (canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setPreview2D(dataUrl);
      }
    }, 2000);
  };

  const handleReset = () => {
    setShirtImage(null);
    setPantsImage(null);
    setPreview2D(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-white font-bold text-3xl mb-8">Clothing Showcase</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 3D Preview */}
        <div className="bg-card-bg rounded-xl p-4">
          <h2 className="text-white font-bold mb-4">3D Preview</h2>
          <div className="relative bg-[#1a1a1a] rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <canvas ref={canvasRef} className="w-full h-full" />
            {rendering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="animate-spin text-primary" size={40} />
              </div>
            )}
            {!shirtImage && !pantsImage && (
              <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                Upload clothing to preview
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-text-muted text-sm block mb-2">Model</label>
              <div className="flex gap-2">
                {(['man', 'woman', 'blocky', 'curvy'] as ModelType[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setModelType(m)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      modelType === m ? 'bg-primary text-black' : 'bg-app-bg text-white hover:bg-border'
                    }`}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-text-muted text-sm block mb-2">Lighting</label>
              <div className="flex gap-2">
                {(['day', 'night', 'studio'] as LightingPreset[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLighting(l)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      lighting === l ? 'bg-primary text-black' : 'bg-app-bg text-white hover:bg-border'
                    }`}
                  >
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-text-muted text-sm block mb-2">Quality</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as QualityPreset[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      quality === q ? 'bg-primary text-black' : 'bg-app-bg text-white hover:bg-border'
                    }`}
                  >
                    {q.charAt(0).toUpperCase() + q.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upload & Settings */}
        <div className="space-y-4">
          {/* Shirt Upload */}
          <div className="bg-card-bg rounded-xl p-4">
            <h3 className="text-white font-bold mb-3">Shirt</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleShirtUpload}
              className="w-full text-text-muted text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:opacity-90"
            />
            {shirtImage && (
              <div className="mt-3 flex items-center gap-3">
                <img src={shirtImage} alt="Shirt" className="w-16 h-16 object-cover rounded" />
                <button onClick={() => setShirtImage(null)} className="text-red-400 text-sm">Remove</button>
              </div>
            )}
          </div>

          {/* Pants Upload */}
          <div className="bg-card-bg rounded-xl p-4">
            <h3 className="text-white font-bold mb-3">Pants</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handlePantsUpload}
              className="w-full text-text-muted text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:opacity-90"
            />
            {pantsImage && (
              <div className="mt-3 flex items-center gap-3">
                <img src={pantsImage} alt="Pants" className="w-16 h-16 object-cover rounded" />
                <button onClick={() => setPantsImage(null)} className="text-red-400 text-sm">Remove</button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleRender}
              disabled={!shirtImage && !pantsImage}
              className="flex-1 py-3 bg-primary text-black font-bold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Render Preview
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-app-bg text-white font-bold rounded-lg hover:bg-border transition"
            >
              Reset
            </button>
          </div>

          {/* 2D Preview */}
          {preview2D && (
            <div className="bg-card-bg rounded-xl p-4">
              <h3 className="text-white font-bold mb-3">2D Export</h3>
              <img src={preview2D} alt="2D Preview" className="w-full rounded-lg" />
              <a
                href={preview2D}
                download="showcase.png"
                className="block mt-3 text-center py-2 bg-primary text-black font-bold rounded-lg hover:opacity-90"
              >
                Download
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
