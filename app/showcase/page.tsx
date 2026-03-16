'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, RotateCcw, Search, User, Shirt, Scissors, Package } from 'lucide-react';

type LightingPreset = 'none' | 'studio' | 'sunset';

interface RobloxAccessory {
  id: number;
  assetType: string;
  name: string;
}

interface RobloxAvatar {
  userId: number;
  userName: string;
  shirtAssetId?: number;
  pantsAssetId?: number;
  accessories: RobloxAccessory[];
}

export default function ShowcasePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [shirtImage, setShirtImage] = useState<string | null>(null);
  const [pantsImage, setPantsImage] = useState<string | null>(null);
  const [lighting, setLighting] = useState<LightingPreset>('studio');
  const [error, setError] = useState<string | null>(null);
  
  const [robloxInput, setRobloxInput] = useState('');
  const [fetchingAvatar, setFetchingAvatar] = useState(false);
  const [avatarData, setAvatarData] = useState<RobloxAvatar | null>(null);
  const [customShirtUrl, setCustomShirtUrl] = useState('');
  const [customPantsUrl, setCustomPantsUrl] = useState('');

  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const torsoMeshRef = useRef<any>(null);
  const legsMeshRef = useRef<any>(null);
  const handsMeshRef = useRef<any>(null);
  const headMeshRef = useRef<any>(null);
  const accessoriesGroupRef = useRef<any>(null);
  const materialsRef = useRef<{ torso: any; legs: any; hands: any; head: any }>({ torso: null, legs: null, hands: null, head: null });
  const loadedRef = useRef(false);
  const animationRef = useRef<number>(0);
  const sceneInitializedRef = useRef(false);
  const THREEref = useRef<any>(null);

  const clearAccessories = useCallback(() => {
    if (sceneRef.current && accessoriesGroupRef.current) {
      sceneRef.current.remove(accessoriesGroupRef.current);
    }
    accessoriesGroupRef.current = null;
  }, []);

  const applyTextureToModel = async (url: string, type: 'shirt' | 'pants') => {
    if (!THREEref.current || !sceneInitializedRef.current) return;

    const THREE = THREEref.current;
    
    try {
      const textureLoader = new THREE.TextureLoader();
      
      textureLoader.load(
        url,
        (texture: any) => {
          texture.flipY = false;
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(1, 1);
          
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
        },
        undefined,
        (err: any) => {
          console.error('[Showcase] Failed to load texture:', type, err);
        }
      );
    } catch (err) {
      console.error('[Showcase] Error loading texture:', type, err);
    }
  };

  const loadAccessoryModel = async (accessory: RobloxAccessory) => {
    if (!sceneRef.current || !THREEref.current || !accessoriesGroupRef.current) return;

    const THREE = THREEref.current;
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');

    const loader = new GLTFLoader();
    
    const assetUrl = `/api/roblox-asset?id=${accessory.id}`;
    
    return new Promise<void>((resolve) => {
      loader.load(
        assetUrl,
        (gltf: any) => {
          const model = gltf.scene;
          
          let posY = 0.4;
          let posX = 0;
          let posZ = 0.15;
          let rotY = 0;
          let scale = 0.4;
          
          if (accessory.assetType === 'Hat' || accessory.assetType === 'Hair') {
            posY = 0.42;
            posX = 0;
            posZ = 0.12;
          } else if (accessory.assetType === 'FaceAccessory') {
            posY = 0.34;
            posZ = 0.16;
          } else if (accessory.assetType === 'NeckAccessory') {
            posY = 0.24;
            posZ = 0.12;
          } else if (accessory.assetType === 'ShoulderAccessory') {
            posY = 0.18;
            posX = 0.28;
            posZ = 0.08;
            rotY = -0.4;
          } else if (accessory.assetType === 'BackAccessory') {
            posY = 0.18;
            posZ = -0.18;
            rotY = 3.14159;
          } else if (accessory.assetType === 'FrontAccessory') {
            posY = 0.12;
            posZ = 0.18;
          } else if (accessory.assetType === 'WaistAccessory') {
            posY = 0.04;
            posZ = 0.1;
          }
          
          model.position.set(posX, posY, posZ);
          model.rotation.y = rotY;
          model.scale.setScalar(scale);
          
          model.traverse((node: any) => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
            }
          });
          
          accessoriesGroupRef.current.add(model);
          console.log('[Showcase] Loaded accessory:', accessory.assetType, accessory.name);
          resolve();
        },
        undefined,
        (err: any) => {
          console.error('[Showcase] Failed to load accessory:', accessory.id, accessory.name, err);
          resolve();
        }
      );
    });
  };

  const fetchRobloxAvatar = async () => {
    if (!robloxInput.trim()) {
      setError('Please enter a Roblox username');
      return;
    }

    setFetchingAvatar(true);
    setError(null);
    clearAccessories();

    try {
      let username = robloxInput.trim();
      
      if (username.includes('roblox.com')) {
        const match = username.match(/(?:users?|profile)\/(\d+)/);
        if (match) {
          const userId = match[1];
          const userRes = await fetch(`https://users.roblox.com/v1/users/${userId}`);
          const userData = await userRes.json();
          if (userData.name) {
            username = userData.name;
          }
        }
      }

      const res = await fetch('/api/roblox-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch avatar');
      }

      const { userId, userName, shirtAssetId, pantsAssetId, accessories } = data;

      setAvatarData({
        userId,
        userName: userName || 'Unknown',
        shirtAssetId,
        pantsAssetId,
        accessories: accessories || []
      });

      if (shirtAssetId) {
        const shirtUrl = `/api/roblox-image?id=${shirtAssetId}`;
        setShirtImage(shirtUrl);
        applyTextureToModel(shirtUrl, 'shirt');
      } else {
        setShirtImage(null);
      }

      if (pantsAssetId) {
        const pantsUrl = `/api/roblox-image?id=${pantsAssetId}`;
        setPantsImage(pantsUrl);
        applyTextureToModel(pantsUrl, 'pants');
      } else {
        setPantsImage(null);
      }

      if (accessories && accessories.length > 0) {
        if (!accessoriesGroupRef.current) {
          accessoriesGroupRef.current = new THREEref.current.Group();
          sceneRef.current.add(accessoriesGroupRef.current);
        }
        
        for (const accessory of accessories) {
          await loadAccessoryModel(accessory);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Roblox avatar');
    } finally {
      setFetchingAvatar(false);
    }
  };

  const applyCustomClothing = (type: 'shirt' | 'pants', url: string) => {
    if (!url.trim()) return;
    
    if (type === 'shirt') {
      setCustomShirtUrl(url);
      setShirtImage(url);
      applyTextureToModel(url, 'shirt');
    } else {
      setCustomPantsUrl(url);
      setPantsImage(url);
      applyTextureToModel(url, 'pants');
    }
  };

  const initScene = useCallback(async () => {
    if (typeof window === 'undefined' || !containerRef.current || !canvasRef.current || loadedRef.current) return;
    loadedRef.current = true;

    try {
      const THREE = await import('three');
      const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
      const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
      THREEref.current = THREE;

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
    if (!sceneInitializedRef.current || !sceneRef.current || !THREEref.current) return;

    const THREE = THREEref.current;
    
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
  }, [lighting]);

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
          applyTextureToModel(ev.target?.result as string, 'shirt');
        } else {
          setPantsImage(ev.target?.result as string);
          applyTextureToModel(ev.target?.result as string, 'pants');
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setShirtImage(null);
    setPantsImage(null);
    setCustomShirtUrl('');
    setCustomPantsUrl('');
    setAvatarData(null);
    setRobloxInput('');
    setError(null);
    clearAccessories();
    window.location.reload();
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
            <h2 className="text-white font-bold text-lg">3D Preview</h2>
            {avatarData && (
              <div className="flex items-center gap-2">
                <User size={16} className="text-primary" />
                <span className="text-white text-sm">{avatarData.userName}</span>
                {avatarData.accessories && avatarData.accessories.length > 0 && (
                  <Package size={14} className="text-green-400 ml-2" />
                )}
              </div>
            )}
          </div>

          <div 
            ref={containerRef}
            className="relative bg-[#0d0d0d] rounded-lg overflow-hidden"
            style={{ height: '50vh md:600px' }}
          >
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0d] z-10">
                <Loader2 className="animate-spin text-primary mb-4" size={48} />
                <p className="text-white font-medium">Loading... {loadingProgress}%</p>
              </div>
            )}

            <canvas ref={canvasRef} className="w-full h-full" />
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
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Search size={18} className="text-primary" />
              Fetch Roblox Avatar
            </h3>
            <p className="text-text-muted text-xs mb-4">Enter a Roblox username to load their clothing and accessories</p>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Username"
                value={robloxInput}
                onChange={(e) => setRobloxInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchRobloxAvatar()}
                className="flex-1 bg-app-bg border border-border rounded-lg px-4 py-3 text-white text-sm placeholder-text-muted"
              />
              <button
                onClick={fetchRobloxAvatar}
                disabled={fetchingAvatar}
                className="px-6 py-3 bg-primary text-black rounded-lg font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {fetchingAvatar ? <Loader2 className="animate-spin" size={20} /> : 'Fetch'}
              </button>
            </div>

            {avatarData && (
              <div className="mt-4 p-3 bg-app-bg rounded-lg">
                <p className="text-white text-sm font-bold mb-2">Avatar Loaded!</p>
                <div className="space-y-1">
                  {avatarData.shirtAssetId && (
                    <p className="text-green-400 text-xs">✓ Shirt loaded</p>
                  )}
                  {avatarData.pantsAssetId && (
                    <p className="text-green-400 text-xs">✓ Pants loaded</p>
                  )}
                  {avatarData.accessories && avatarData.accessories.length > 0 && (
                    <p className="text-green-400 text-xs">✓ {avatarData.accessories.length} accessories loaded</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-card-bg rounded-xl p-4">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Shirt size={18} className="text-primary" />
              Custom Clothing
            </h3>
            <p className="text-text-muted text-xs mb-4">Override with custom shirt/pant images (replaces fetched)</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-text-muted text-sm block mb-2">Custom Shirt URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/shirt.png"
                    value={customShirtUrl}
                    onChange={(e) => setCustomShirtUrl(e.target.value)}
                    className="flex-1 bg-app-bg border border-border rounded-lg px-3 py-2 text-white text-sm placeholder-text-muted"
                  />
                  <button
                    onClick={() => applyCustomClothing('shirt', customShirtUrl)}
                    className="px-4 py-2 bg-primary text-black rounded-lg font-bold text-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div>
                <label className="text-text-muted text-sm block mb-2">Custom Pants URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/pants.png"
                    value={customPantsUrl}
                    onChange={(e) => setCustomPantsUrl(e.target.value)}
                    className="flex-1 bg-app-bg border border-border rounded-lg px-3 py-2 text-white text-sm placeholder-text-muted"
                  />
                  <button
                    onClick={() => applyCustomClothing('pants', customPantsUrl)}
                    className="px-4 py-2 bg-primary text-black rounded-lg font-bold text-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card-bg rounded-xl p-4">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Scissors size={18} className="text-primary" />
              Upload Clothing
            </h3>
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
                    <button onClick={() => { setShirtImage(null); setCustomShirtUrl(''); }} className="text-red-400 text-sm hover:text-red-300">Remove</button>
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
                    <button onClick={() => { setPantsImage(null); setCustomPantsUrl(''); }} className="text-red-400 text-sm hover:text-red-300">Remove</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3 bg-app-bg text-white font-bold rounded-lg hover:bg-border transition flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
