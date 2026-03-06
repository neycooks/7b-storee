'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, RotateCcw, Download, Image, Box } from 'lucide-react';

type LightingPreset = 'none' | 'studio' | 'sunset';

export default function ShowcasePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [shirtImage, setShirtImage] = useState<string | null>(null);
  const [pantsImage, setPantsImage] = useState<string | null>(null);
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
  const loadedRef = useRef(false);
  const animationRef = useRef<number>(0);
  const sceneInitializedRef = useRef(false);

  const initScene = useCallback(async () => {
    if (typeof window === 'undefined' || !containerRef.current || !canvasRef.current || loadedRef.current) return;
    loadedRef.current = true;

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

      const randomFaceNum = Math.floor(Math.random() * 13) + 1;
      const faceTexture = textureLoader.load(`/dripzels/models/textures/faces/${randomFaceNum}.webp`);
      faceTexture.flipY = false;
      faceTexture.colorSpace = THREE.SRGBColorSpace;

      const loadModel = (path: string, type: 'torso' | 'legs' | 'hands' | 'head', texture: any, scale: number = 0.3) => {
        return new Promise<any>((resolve, reject) => {
          const loader = new GLTFLoader();
          loader.load(
            path,
            (gltf: any) => {
              const model = gltf.scene;
              model.scale.set(scale, scale, scale);

              const material = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                map: texture.clone(),
              });
              if (material.map) {
                material.map.flipY = false;
              }

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
      try { await loadModel('/dripzels/models/Blocky_Head.glb', 'head', faceTexture); } catch (e) { console.warn('Head failed'); }
      setLoadingProgress(40);
      try { await loadModel('/dripzels/models/Blocky_Torso.glb', 'torso', baseShirtTexture); } catch (e) { console.warn('Torso failed'); }
      setLoadingProgress(60);
      try { await loadModel('/dripzels/models/Blocky_Hands.glb', 'hands', baseShirtTexture); } catch (e) { console.warn('Hands failed'); }
      setLoadingProgress(80);
      try { await loadModel('/dripzels/models/Blocky_Legs.glb', 'legs', basePantsTexture); } catch (e) { console.warn('Legs failed'); }
      setLoadingProgress(100);

      sceneInitializedRef.current = true;

      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      window.addEventListener('resize', () => {
        if (!containerRef.current) return;
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      });

      setLoading(false);
    } catch (err) {
      console.error('Scene error:', err);
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
    if (!sceneInitializedRef.current || !sceneRef.current) return;

    const updateLighting = async () => {
      const THREE = await import('three');
      const lights = sceneRef.current.children.filter((c: any) => c.isSpotLight);
      const spotLight1 = lights.find((c: any) => c.position.x === 1.5);
      const spotLight2 = lights.find((c: any) => c.position.x === -1);
      const spotLight3 = lights.find((c: any) => c.position.z === 3);
      const spotLight4 = lights.find((c: any) => c.position.z === -2);

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
          if (node.isMesh && node.material && node.material.map) {
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

  const applyTexture = async (imageSrc: string, type: 'shirt' | 'pants') => {
    if (!materialsRef.current.torso) return;

    try {
      const THREE = await import('three');
      const textureLoader = new THREE.TextureLoader();

      const texture = textureLoader.load(imageSrc);
      texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;

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
    } catch (err) {
      console.error('Error applying texture:', err);
    }
  };

  const generate2DPreview = useCallback(() => {
    const canvasWidth = 256;
    const canvasHeight = 384;
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.imageSmoothingEnabled = false;

    const drawCombined = (shirtImg: HTMLImageElement, pantsImg: HTMLImageElement) => {
      ctx.drawImage(shirtImg, 131, 0, 128, 64, 64, 0, 128, 64);
      ctx.drawImage(shirtImg, 131, 73, 128, 128, 64, 64, 128, 128);
      ctx.drawImage(shirtImg, 44, 73, 64, 128, 0, 64, 64, 128);
      ctx.drawImage(shirtImg, 438, 73, 64, 128, 192, 64, 64, 128);
      ctx.drawImage(pantsImg, 131, 273, 64, 128, 64, 192, 64, 128);
      ctx.drawImage(pantsImg, 195, 273, 64, 128, 128, 192, 64, 128);
    };

    const drawShirtOnly = (shirtImg: HTMLImageElement) => {
      ctx.drawImage(shirtImg, 131, 0, 128, 64, 64, 0, 128, 64);
      ctx.drawImage(shirtImg, 131, 73, 128, 128, 64, 64, 128, 128);
      ctx.drawImage(shirtImg, 44, 73, 64, 128, 0, 64, 64, 128);
      ctx.drawImage(shirtImg, 438, 73, 64, 128, 192, 64, 64, 128);
    };

    const drawPantsOnly = (pantsImg: HTMLImageElement) => {
      ctx.drawImage(pantsImg, 131, 273, 64, 128, 64, 0, 64, 128);
      ctx.drawImage(pantsImg, 195, 273, 64, 128, 128, 0, 64, 128);
    };

    if (shirtImage && pantsImage) {
      const shirtImg = document.createElement('img');
      shirtImg.crossOrigin = 'anonymous';
      shirtImg.src = shirtImage;
      
      const pantsImg = document.createElement('img');
      pantsImg.crossOrigin = 'anonymous';
      pantsImg.src = pantsImage;
      
      let loaded = 0;
      const checkDone = () => {
        loaded++;
        if (loaded === 2) {
          drawCombined(shirtImg, pantsImg);
          setPreview2D(canvas.toDataURL('image/png'));
        }
      };
      
      shirtImg.onload = checkDone;
      pantsImg.onload = checkDone;
    } else if (shirtImage) {
      const shirtImg = document.createElement('img');
      shirtImg.crossOrigin = 'anonymous';
      shirtImg.src = shirtImage;
      shirtImg.onload = () => {
        drawShirtOnly(shirtImg);
        setPreview2D(canvas.toDataURL('image/png'));
      };
    } else if (pantsImage) {
      const pantsImg = document.createElement('img');
      pantsImg.crossOrigin = 'anonymous';
      pantsImg.src = pantsImage;
      pantsImg.onload = () => {
        drawPantsOnly(pantsImg);
        setPreview2D(canvas.toDataURL('image/png'));
      };
    } else {
      const baseImg = document.createElement('img');
      baseImg.crossOrigin = 'anonymous';
      baseImg.src = '/2dprev.jpg';
      baseImg.onload = () => {
        ctx.drawImage(baseImg, 0, 0, 256, 384);
        setPreview2D(canvas.toDataURL('image/png'));
      };
    }
  }, [shirtImage, pantsImage]);

  useEffect(() => {
    if (!loading) {
      generate2DPreview();
    }
  }, [loading, shirtImage, pantsImage, generate2DPreview]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'shirt' | 'pants') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(png|jpe?g|webp)/)) {
      setError('Invalid file type! Only PNG, JPEG, JPG, and WEBP are allowed!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = document.createElement('img');
      img.onload = () => {
        if (img.width !== 585 || img.height !== 559) {
          setError('The image must be 585x559 pixels! This is the Roblox clothing standard.');
          return;
        }
        setError(null);

        if (type === 'shirt') {
          setShirtImage(ev.target?.result as string);
          applyTexture(ev.target?.result as string, 'shirt');
        } else {
          setPantsImage(ev.target?.result as string);
          applyTexture(ev.target?.result as string, 'pants');
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setShirtImage(null);
    setPantsImage(null);
    setPreview2D(null);
    setError(null);
    window.location.reload();
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
      <h1 className="text-white font-bold text-2xl mb-4 md:text-3xl md:mb-6">Clothing Showcase</h1>

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-4 md:mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-4 md:gap-6">
        <div className="bg-card-bg rounded-xl p-3 md:p-4">
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <h2 className="text-white font-bold text-lg">Preview</h2>
            <div className="flex gap-2">
              <button
                onClick={() => { setPreviewMode('3d'); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                  previewMode === '3d' ? 'bg-primary text-black' : 'bg-app-bg text-text-muted hover:text-white'
                }`}
              >
                <Box size={16} /> 3D
              </button>
              <button
                onClick={() => { setPreviewMode('2d'); generate2DPreview(); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                  previewMode === '2d' ? 'bg-primary text-black' : 'bg-app-bg text-text-muted hover:text-white'
                }`}
              >
                <Image size={16} /> 2D
              </button>
            </div>
          </div>

          <div 
            ref={containerRef}
            className="relative bg-[#0d0d0d] rounded-lg overflow-hidden"
            style={{ height: previewMode === '3d' ? '50vh md:600px' : '500px' }}
          >
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0d] z-10">
                <Loader2 className="animate-spin text-primary mb-4" size={48} />
                <p className="text-white font-medium">Loading... {loadingProgress}%</p>
              </div>
            )}

            {previewMode === '3d' ? (
              <canvas ref={canvasRef} className="w-full h-full" />
            ) : preview2D ? (
              <img src={preview2D} alt="2D Preview" className="w-full h-full object-contain" />
            ) : null}
          </div>

          <div className="mt-3 md:mt-4">
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

        <div className="space-y-4">
          <div className="bg-card-bg rounded-xl p-4">
            <h3 className="text-white font-bold mb-3">Upload Clothing</h3>
            <p className="text-text-muted text-xs mb-4">Required size: 585x559 pixels (Roblox standard)</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-text-muted text-sm block mb-2">Shirt Template</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => handleFileUpload(e, 'shirt')}
                  className="w-full text-text-muted text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:opacity-90"
                />
                {shirtImage && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={shirtImage} alt="Shirt" className="w-16 h-16 object-cover rounded border border-border" />
                    <button onClick={() => { setShirtImage(null); applyTexture('/dripzels/models/textures/baseShirt.png', 'shirt'); }} className="text-red-400 text-sm hover:text-red-300">Remove</button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-text-muted text-sm block mb-2">Pants Template</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => handleFileUpload(e, 'pants')}
                  className="w-full text-text-muted text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:opacity-90"
                />
                {pantsImage && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={pantsImage} alt="Pants" className="w-16 h-16 object-cover rounded border border-border" />
                    <button onClick={() => { setPantsImage(null); applyTexture('/dripzels/models/textures/basePants.png', 'pants'); }} className="text-red-400 text-sm hover:text-red-300">Remove</button>
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
            <button
              onClick={handleDownload}
              className="flex-1 py-3 bg-primary text-black font-bold rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <Download size={18} /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
