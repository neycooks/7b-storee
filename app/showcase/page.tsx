'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, RotateCcw, Download, Image, Box } from 'lucide-react';

type ModelType = 'blocky' | 'man' | 'woman' | 'curvy';
type LightingPreset = 'none' | 'studio' | 'sunset';

export default function ShowcasePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [shirtImage, setShirtImage] = useState<string | null>(null);
  const [pantsImage, setPantsImage] = useState<string | null>(null);
  const [modelType, setModelType] = useState<ModelType>('blocky');
  const [lighting, setLighting] = useState<LightingPreset>('studio');
  const [previewMode, setPreviewMode] = useState<'3d' | '2d'>('3d');
  const [preview2D, setPreview2D] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const torsoMeshRef = useRef<any>(null);
  const legsMeshRef = useRef<any>(null);
  const handsMeshRef = useRef<any>(null);
  const headMeshRef = useRef<any>(null);
  const materialsRef = useRef<{ torso: any; legs: any; hands: any; head: any }>({ torso: null, legs: null, hands: null, head: null });
  const loadedModelsRef = useRef<Set<string>>(new Set());
  const animationRef = useRef<number>(0);

  const initScene = useCallback(async () => {
    if (typeof window === 'undefined' || !containerRef.current || !canvasRef.current) return;

    try {
      const THREE = await import('three');
      const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
      const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');

      const container = containerRef.current;
      const canvas = canvasRef.current;

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x0d0d0d, 7, 15);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.set(-0.5, 1.7, 3.5);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x0d0d0d, 1);
      rendererRef.current = renderer;

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.12;
      controls.maxDistance = 7;
      controls.minDistance = 0.7;
      controls.target.set(0, 0.7, 0);
      controls.enablePan = false;
      controlsRef.current = controls;

      const ambientLight = new THREE.AmbientLight(0xf2fcff, 2.3);
      scene.add(ambientLight);

      const spotLight1 = new THREE.SpotLight(0xffffff, 10);
      spotLight1.position.set(1.5, 2, 2);
      scene.add(spotLight1);

      const spotLight2 = new THREE.SpotLight(0xffffff, 10);
      spotLight2.position.set(-1, 2, -2);
      scene.add(spotLight2);

      const spotLight3 = new THREE.SpotLight(0xeb7f2d, 0);
      spotLight3.position.set(3, 4, 3);
      scene.add(spotLight3);

      const spotLight4 = new THREE.SpotLight(0x140078, 0);
      spotLight4.position.set(-3, 3, -2);
      scene.add(spotLight4);

      const gridHelper = new THREE.GridHelper(100, 130, 0x212121, 0x121212);
      scene.add(gridHelper);

      const textureLoader = new THREE.TextureLoader();

      const baseShirtTexture = textureLoader.load('/dripzels/models/textures/baseShirt.png');
      baseShirtTexture.flipY = false;
      baseShirtTexture.colorSpace = THREE.SRGBColorSpace;

      const basePantsTexture = textureLoader.load('/dripzels/models/textures/basePants.png');
      basePantsTexture.flipY = false;
      basePantsTexture.colorSpace = THREE.SRGBColorSpace;

      const skinTexture = textureLoader.load('/dripzels/models/textures/skin.webp');
      skinTexture.flipY = false;
      skinTexture.colorSpace = THREE.SRGBColorSpace;

      const loadModel = (path: string, type: 'torso' | 'legs' | 'hands' | 'head', scale: number = 0.3) => {
        return new Promise<any>((resolve, reject) => {
          const loader = new GLTFLoader();
          loader.load(
            path,
            (gltf) => {
              const model = gltf.scene;
              model.scale.set(scale, scale, scale);

              const texture = type === 'torso' || type === 'hands' ? baseShirtTexture : basePantsTexture;
              
              const material = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                map: texture.clone(),
              });
              material.map.flipY = false;

              model.traverse((node: any) => {
                if (node.isMesh) {
                  node.material = material;
                  node.castShadow = true;
                  node.receiveShadow = true;
                }
              });

              materialsRef.current[type] = material;

              if (type === 'torso') torsoMeshRef.current = model;
              else if (type === 'legs') legsMeshRef.current = model;
              else if (type === 'hands') handsMeshRef.current = model;
              else if (type === 'head') headMeshRef.current = model;

              scene.add(model);
              resolve(model);
            },
            undefined,
            reject
          );
        });
      };

      setLoadingProgress(20);
      
      try {
        await loadModel('/dripzels/models/Blocky_Head.glb', 'head');
      } catch (e) { console.warn('Head model failed to load'); }
      setLoadingProgress(40);

      try {
        await loadModel('/dripzels/models/Blocky_Torso.glb', 'torso');
      } catch (e) { console.warn('Torso model failed to load'); }
      setLoadingProgress(60);

      try {
        await loadModel('/dripzels/models/Blocky_Hands.glb', 'hands');
      } catch (e) { console.warn('Hands model failed to load'); }
      setLoadingProgress(80);

      try {
        await loadModel('/dripzels/models/Blocky_Legs.glb', 'legs');
      } catch (e) { console.warn('Legs model failed to load'); }
      setLoadingProgress(100);

      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      });

      setLoading(false);
    } catch (err) {
      console.error('Scene initialization error:', err);
      setError(String(err));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initScene();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [initScene]);

  useEffect(() => {
    if (!sceneRef.current || !torsoMeshRef.current) return;

    const updateLighting = async () => {
      const THREE = await import('three');
      
      const spotLight1 = sceneRef.current.children.find((c: any) => c.isSpotLight && c.position.x === 1.5);
      const spotLight2 = sceneRef.current.children.find((c: any) => c.isSpotLight && c.position.x === -1);
      const spotLight3 = sceneRef.current.children.find((c: any) => c.isSpotLight && c.position.z === 3);
      const spotLight4 = sceneRef.current.children.find((c: any) => c.isSpotLight && c.position.z === -2);

      if (lighting === 'none') {
        if (spotLight1) spotLight1.intensity = 10;
        if (spotLight2) spotLight2.intensity = 10;
        if (spotLight3) spotLight3.intensity = 0;
        if (spotLight4) spotLight4.intensity = 0;
      } else if (lighting === 'studio') {
        if (spotLight1) spotLight1.intensity = 10;
        if (spotLight2) spotLight2.intensity = 10;
        if (spotLight3) spotLight3.intensity = 0;
        if (spotLight4) spotLight4.intensity = 0;
      } else if (lighting === 'sunset') {
        if (spotLight1) spotLight1.intensity = 0;
        if (spotLight2) spotLight2.intensity = 0;
        if (spotLight3) spotLight3.intensity = 90;
        if (spotLight4) spotLight4.intensity = 100;
      }

      const meshes = [torsoMeshRef.current, legsMeshRef.current, handsMeshRef.current, headMeshRef.current];
      meshes.forEach((mesh) => {
        if (!mesh) return;
        mesh.traverse((node: any) => {
          if (node.isMesh) {
            if (lighting === 'none') {
              node.material = new THREE.MeshBasicMaterial({ map: node.material.map });
            } else {
              node.material = new THREE.MeshStandardMaterial({ map: node.material.map });
            }
          }
        });
      });
    };

    updateLighting();
  }, [lighting]);

  const handleShirtUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(png|jpe?g)/)) {
      setError('Invalid file type! Only PNG, JPEG, and JPG are allowed!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        if (img.width !== 585 || img.height !== 559) {
          setError('The image must be 585x559 pixels! This is the Roblox clothing standard.');
          return;
        }
        setError(null);
        setShirtImage(ev.target?.result as string);
        applyClothingTexture(ev.target?.result as string, 'shirt');
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePantsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(png|jpe?g)/)) {
      setError('Invalid file type! Only PNG, JPEG, and JPG are allowed!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        if (img.width !== 585 || img.height !== 559) {
          setError('The image must be 585x559 pixels! This is the Roblox clothing standard.');
          return;
        }
        setError(null);
        setPantsImage(ev.target?.result as string);
        applyClothingTexture(ev.target?.result as string, 'pants');
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const applyClothingTexture = async (imageSrc: string, type: 'shirt' | 'pants') => {
    if (!materialsRef.current.torso) return;

    try {
      const THREE = await import('three');
      const textureLoader = new THREE.TextureLoader();
      
      const texture = textureLoader.load(imageSrc);
      texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace;

      if (type === 'shirt') {
        if (materialsRef.current.torso) {
          materialsRef.current.torso.map = texture;
          materialsRef.current.torso.needsUpdate = true;
        }
        if (materialsRef.current.hands) {
          materialsRef.current.hands.map = texture.clone();
          materialsRef.current.hands.needsUpdate = true;
        }
      } else if (type === 'pants') {
        if (materialsRef.current.legs) {
          materialsRef.current.legs.map = texture;
          materialsRef.current.legs.needsUpdate = true;
        }
      }

      generate2DPreview();
    } catch (err) {
      console.error('Error applying texture:', err);
    }
  };

  const generate2DPreview = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 585;
    canvas.height = 559;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (shirtImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 585, 559);
        if (pantsImage) {
          const pantsImg = new Image();
          pantsImg.onload = () => {
            ctx.drawImage(pantsImg, 0, 0, 585, 559);
            setPreview2D(canvas.toDataURL('image/png'));
          };
          pantsImg.src = pantsImage;
        } else {
          setPreview2D(canvas.toDataURL('image/png'));
        }
      };
      img.src = shirtImage;
    } else if (pantsImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 585, 559);
        setPreview2D(canvas.toDataURL('image/png'));
      };
      img.src = pantsImage;
    }
  };

  const handleReset = () => {
    setShirtImage(null);
    setPantsImage(null);
    setPreview2D(null);
    setError(null);
    initScene();
  };

  const handleDownload = () => {
    if (!preview2D) return;
    const link = document.createElement('a');
    link.download = 'clothing-preview.png';
    link.href = preview2D;
    link.click();
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-white font-bold text-3xl mb-6">Clothing Showcase</h1>

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="bg-card-bg rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-bold text-lg">Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewMode('3d')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                    previewMode === '3d' ? 'bg-primary text-black' : 'bg-app-bg text-text-muted hover:text-white'
                  }`}
                >
                  <Box size={16} /> 3D
                </button>
                <button
                  onClick={() => { setPreviewMode('2d'); generate2DPreview(); }}
                  disabled={!shirtImage && !pantsImage}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                    previewMode === '2d' ? 'bg-primary text-black' : 'bg-app-bg text-text-muted hover:text-white disabled:opacity-50'
                  }`}
                >
                  <Image size={16} /> 2D
                </button>
              </div>
            </div>

            <div 
              ref={containerRef} 
              className="relative bg-[#0d0d0d] rounded-lg overflow-hidden"
              style={{ height: '600px' }}
            >
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0d] z-10">
                  <Loader2 className="animate-spin text-primary mb-4" size={48} />
                  <p className="text-white font-medium">Loading 3D Scene... {loadingProgress}%</p>
                </div>
              )}

              {previewMode === '3d' ? (
                <canvas ref={canvasRef} className="w-full h-full" />
              ) : preview2D ? (
                <img src={preview2D} alt="2D Preview" className="w-full h-full object-contain" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                  Upload clothing to see 2D preview
                </div>
              )}

              {!shirtImage && !pantsImage && previewMode === '3d' && !loading && (
                <div className="absolute inset-0 flex items-center justify-center text-text-muted pointer-events-none">
                  Upload clothing to preview
                </div>
              )}
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-text-muted text-sm block mb-2">Model</label>
                <div className="flex gap-2 flex-wrap">
                  {(['blocky', 'man', 'woman', 'curvy'] as ModelType[]).map((m) => (
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
                <div className="flex gap-2 flex-wrap">
                  {([
                    { id: 'none', label: 'None' },
                    { id: 'studio', label: 'Studio' },
                    { id: 'sunset', label: 'Sunset' }
                  ] as { id: LightingPreset; label: string }[]).map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLighting(l.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        lighting === l.id ? 'bg-primary text-black' : 'bg-app-bg text-white hover:bg-border'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card-bg rounded-xl p-4">
            <h3 className="text-white font-bold mb-3">Upload Clothing</h3>
            <p className="text-text-muted text-xs mb-4">Required size: 585x559 pixels (Roblox standard)</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-text-muted text-sm block mb-2">Shirt Template</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleShirtUpload}
                  className="w-full text-text-muted text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:opacity-90"
                />
                {shirtImage && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={shirtImage} alt="Shirt" className="w-16 h-16 object-cover rounded border border-border" />
                    <button onClick={() => setShirtImage(null)} className="text-red-400 text-sm hover:text-red-300">Remove</button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-text-muted text-sm block mb-2">Pants Template</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handlePantsUpload}
                  className="w-full text-text-muted text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:opacity-90"
                />
                {pantsImage && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={pantsImage} alt="Pants" className="w-16 h-16 object-cover rounded border border-border" />
                    <button onClick={() => setPantsImage(null)} className="text-red-400 text-sm hover:text-red-300">Remove</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 bg-app-bg text-white font-bold rounded-lg hover:bg-border transition flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> Reset
            </button>
            {preview2D && (
              <button
                onClick={handleDownload}
                className="flex-1 py-3 bg-primary text-black font-bold rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <Download size={18} /> Download
              </button>
            )}
          </div>

          {(shirtImage || pantsImage) && previewMode === '2d' && (
            <div className="bg-card-bg rounded-xl p-4">
              <h3 className="text-white font-bold mb-3">2D Export</h3>
              <img src={preview2D!} alt="2D Preview" className="w-full rounded-lg border border-border" />
              <button
                onClick={handleDownload}
                className="w-full mt-3 py-2 bg-primary text-black font-bold rounded-lg hover:opacity-90"
              >
                Download PNG
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
