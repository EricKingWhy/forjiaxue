"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { getPhotos, resolveApiUrl } from "@/lib/api-client";
import { useConfigStore } from "@/stores";
import { usePerformance } from "@/hooks/usePerformance";
import { shouldEnableBloom } from "@/lib/performance";
import { SceneErrorBoundary } from "@/components/ui/SceneErrorBoundary";

// --- Config ---
const TREE_CONFIG = {
  colors: {
    champagneGold: 0xffd966,
    deepGreen: 0x03180a,
    accentRed: 0x990000,
  },
  particles: {
    count: 1200,
    treeHeight: 24,
    treeRadius: 8,
  },
  camera: { z: 50 },
};

// --- Candy cane texture ---
function createCaneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = "#880000";
  ctx.beginPath();
  for (let i = -128; i < 256; i += 32) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 32, 128);
    ctx.lineTo(i + 16, 128);
    ctx.lineTo(i - 16, 0);
  }
  ctx.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

// --- Particle data structure ---
interface TreeParticle {
  mesh: THREE.Mesh | THREE.Group;
  type: "BOX" | "GOLD_BOX" | "GOLD_SPHERE" | "RED" | "CANE" | "PHOTO";
  posTree: THREE.Vector3;
  posScatter: THREE.Vector3;
  baseScale: number;
  spinSpeed: THREE.Vector3;
}

function calculateTreePosition(treeHeight: number, treeRadius: number): THREE.Vector3 {
  const h = treeHeight;
  const halfH = h / 2;
  const t = Math.pow(Math.random(), 0.8);
  const y = t * h - halfH;
  let rMax = treeRadius * (1.0 - t);
  if (rMax < 0.5) rMax = 0.5;
  const angle = t * 50 * Math.PI + Math.random() * Math.PI;
  const r = rMax * (0.8 + Math.random() * 0.4);
  return new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r);
}

function calculateScatterPosition(): THREE.Vector3 {
  const rScatter = 8 + Math.random() * 12;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  return new THREE.Vector3(
    rScatter * Math.sin(phi) * Math.cos(theta),
    rScatter * Math.sin(phi) * Math.sin(theta),
    rScatter * Math.cos(phi),
  );
}

function calculatePhotoPosition(index: number, total: number): THREE.Vector3 {
  if (total === 0) return new THREE.Vector3(0, 0, 0);
  const h = TREE_CONFIG.particles.treeHeight * 0.9;
  const bottomY = -h / 2;
  const stepY = h / total;
  const y = bottomY + stepY * index + stepY / 2;
  const fullH = TREE_CONFIG.particles.treeHeight;
  const normalizedH = (y + fullH / 2) / fullH;
  let rMax = TREE_CONFIG.particles.treeRadius * (1.0 - normalizedH);
  if (rMax < 1.0) rMax = 1.0;
  const r = rMax + 3.0;
  const loops = 3;
  const angle = normalizedH * Math.PI * 2 * loops + Math.PI / 4;
  return new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r);
}

// --- Star shape ---
function createStarGeometry(): THREE.ExtrudeGeometry {
  const starShape = new THREE.Shape();
  const points = 5;
  const outerRadius = 1.5;
  const innerRadius = 0.7;
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points + Math.PI / 2;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) starShape.moveTo(x, y);
    else starShape.lineTo(x, y);
  }
  starShape.closePath();
  const geo = new THREE.ExtrudeGeometry(starShape, {
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 2,
  });
  geo.center();
  return geo;
}

// --- Scene component ---
interface TreeSceneProps {
  enableBloom: boolean;
}

function TreeScene({ enableBloom }: TreeSceneProps) {
  const { gl, scene, camera, size } = useThree();
  const mainGroupRef = useRef<THREE.Group>(null);
  const clockRef = useRef(new THREE.Clock());
  const particlesRef = useRef<TreeParticle[]>([]);
  const [photos, setPhotos] = useState<THREE.Texture[]>([]);
  const rotationRef = useRef({ x: 0, y: 0 });

  // --- Materials (shared, created once) ---
  const materials = useMemo(() => {
    const caneTexture = createCaneTexture();
    return {
      gold: new THREE.MeshStandardMaterial({
        color: TREE_CONFIG.colors.champagneGold,
        metalness: 1.0,
        roughness: 0.1,
        envMapIntensity: 2.0,
        emissive: 0x443300,
        emissiveIntensity: 0.3,
      }),
      green: new THREE.MeshStandardMaterial({
        color: TREE_CONFIG.colors.deepGreen,
        metalness: 0.2,
        roughness: 0.8,
        emissive: 0x002200,
        emissiveIntensity: 0.2,
      }),
      red: new THREE.MeshPhysicalMaterial({
        color: TREE_CONFIG.colors.accentRed,
        metalness: 0.3,
        roughness: 0.2,
        clearcoat: 1.0,
        emissive: 0x330000,
      }),
      candy: new THREE.MeshStandardMaterial({ map: caneTexture, roughness: 0.4 }),
      star: new THREE.MeshStandardMaterial({
        color: 0xffdd88,
        emissive: 0xffaa00,
        emissiveIntensity: 1.0,
        metalness: 1.0,
        roughness: 0,
      }),
      frame: new THREE.MeshStandardMaterial({
        color: TREE_CONFIG.colors.champagneGold,
        metalness: 1.0,
        roughness: 0.1,
      }),
    };
  }, []);

  // --- Geometries (shared) ---
  const geometries = useMemo(() => {
    const sphereGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const boxGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.5, 0),
      new THREE.Vector3(0, 0.3, 0),
      new THREE.Vector3(0.1, 0.5, 0),
      new THREE.Vector3(0.3, 0.4, 0),
    ]);
    const candyGeo = new THREE.TubeGeometry(curve, 16, 0.08, 8, false);
    const starGeo = createStarGeometry();
    const photoPlaneGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const photoFrameGeo = new THREE.BoxGeometry(1.4, 1.4, 0.05);
    return {
      sphere: sphereGeo,
      box: boxGeo,
      candy: candyGeo,
      star: starGeo,
      photoPlane: photoPlaneGeo,
      photoFrame: photoFrameGeo,
    };
  }, []);

  // --- Create ornament particles ---
  const ornamentMeshes = useMemo(() => {
    const meshes: THREE.Mesh[] = [];
    for (let i = 0; i < TREE_CONFIG.particles.count; i++) {
      const rand = Math.random();
      let mesh: THREE.Mesh;
      let type: TreeParticle["type"];

      if (rand < 0.40) {
        mesh = new THREE.Mesh(geometries.box, materials.green);
        type = "BOX";
      } else if (rand < 0.70) {
        mesh = new THREE.Mesh(geometries.box, materials.gold);
        type = "GOLD_BOX";
      } else if (rand < 0.92) {
        mesh = new THREE.Mesh(geometries.sphere, materials.gold);
        type = "GOLD_SPHERE";
      } else if (rand < 0.97) {
        mesh = new THREE.Mesh(geometries.sphere, materials.red);
        type = "RED";
      } else {
        mesh = new THREE.Mesh(geometries.candy, materials.candy);
        type = "CANE";
      }

      const s = 0.4 + Math.random() * 0.5;
      mesh.scale.set(s, s, s);
      mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      meshes.push(mesh);
    }
    return meshes;
  }, [geometries, materials]);

  // --- Create particle data ---
  const particleData = useMemo(() => {
    const data: TreeParticle[] = [];
    ornamentMeshes.forEach((mesh) => {
      const rand = Math.random();
      const type = mesh.material === materials.green ? "BOX"
        : mesh.material === materials.gold && mesh.geometry === geometries.box ? "GOLD_BOX"
        : mesh.material === materials.gold && mesh.geometry === geometries.sphere ? "GOLD_SPHERE"
        : mesh.material === materials.red ? "RED"
        : "CANE";

      // Ornament particles always use fast spin (photos handled separately)
      const speedMult = 2.0;
      const spinSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * speedMult,
        (Math.random() - 0.5) * speedMult,
        (Math.random() - 0.5) * speedMult,
      );
      const posTree = calculateTreePosition(
        TREE_CONFIG.particles.treeHeight,
        TREE_CONFIG.particles.treeRadius,
      );
      const posScatter = calculateScatterPosition();
      const baseScale = mesh.scale.x;

      data.push({ mesh, type, posTree, posScatter, baseScale, spinSpeed });
    });
    return data;
  }, [ornamentMeshes, materials, geometries]);

  // --- Load photos from API ---
  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();

    getPhotos()
      .then((response) => {
        if (cancelled) return;
        const urls = response.wall_photos.map((p) => resolveApiUrl(p.webp_url));
        // Also include main photo if available
        if (response.main_photo) {
          urls.unshift(resolveApiUrl(response.main_photo.webp_url));
        }
        const loadedTextures: THREE.Texture[] = [];
        urls.forEach((url) => {
          loader.load(
            url,
            (t) => {
              t.colorSpace = THREE.SRGBColorSpace;
              if (!cancelled) loadedTextures.push(t);
            },
            undefined,
            () => { /* skip failed */ },
          );
        });
        // Use a short timeout to allow textures to load, then set state
        setTimeout(() => {
          if (!cancelled && loadedTextures.length > 0) setPhotos(loadedTextures);
        }, 3000);
      })
      .catch(() => { /* no photos available */ });

    return () => { cancelled = true; };
  }, []);

  // --- Photo mesh groups ---
  const photoGroups = useMemo(() => {
    if (photos.length === 0) return [];
    const groups: THREE.Group[] = [];

    photos.forEach((texture, index) => {
      const group = new THREE.Group();

      // Photo frame (gold border)
      const frameMesh = new THREE.Mesh(geometries.photoFrame, materials.frame);

      // Photo plane
      let width = 1.2;
      let height = 1.2;
      if (texture.image) {
        const aspect = (texture.image as HTMLImageElement).width / (texture.image as HTMLImageElement).height;
        if (aspect > 1) height = width / aspect;
        else width = height * aspect;
      }
      const photoGeo = new THREE.PlaneGeometry(width, height);
      const photoMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
      const photoMesh = new THREE.Mesh(photoGeo, photoMat);
      photoMesh.position.z = 0.04;

      frameMesh.scale.set(width / 1.2, height / 1.2, 1);
      group.add(frameMesh);
      group.add(photoMesh);
      group.scale.set(0.8, 0.8, 0.8);

      groups.push(group);
    });

    return groups;
  }, [photos, geometries, materials]);

  // --- Update photo particle data ---
  useEffect(() => {
    if (photoGroups.length === 0) return;

    // Add photo groups to particle system
    const newPhotoParticles: TreeParticle[] = photoGroups.map((group, index) => {
      const posTree = calculatePhotoPosition(index, photoGroups.length);
      const posScatter = calculateScatterPosition();
      return {
        mesh: group,
        type: "PHOTO",
        posTree,
        posScatter,
        baseScale: 0.8,
        spinSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3,
        ),
      };
    });

    particlesRef.current = [...particleData, ...newPhotoParticles];
  }, [photoGroups, particleData]);

  // --- Bloom composer ---
  const bloom = useMemo(() => {
    if (!enableBloom) return null;
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.45, // strength
      0.4,  // radius
      0.85, // threshold
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
    return composer;
  }, [enableBloom, gl, scene, camera, size]);

  useEffect(() => {
    bloom?.setSize(size.width, size.height);
  }, [bloom, size]);

  useEffect(() => () => bloom?.dispose(), [bloom]);

  // --- Environment map ---
  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();
  }, [gl, scene]);

  // --- Animation loop ---
  useFrame(() => {
    const dt = clockRef.current.getDelta();
    const group = mainGroupRef.current;
    if (!group) return;

    // Auto rotation
    rotationRef.current.y += 0.3 * dt;
    rotationRef.current.x += (0 - rotationRef.current.x) * 2.0 * dt;
    group.rotation.y = rotationRef.current.y;
    group.rotation.x = rotationRef.current.x;

    // Update particles
    const particles = particlesRef.current;
    if (particles.length === 0 && particleData.length > 0) {
      particlesRef.current = particleData;
    }
    for (const p of particlesRef.current) {
      // In TREE mode: lerp to tree position
      p.mesh.position.lerp(p.posTree, 2.0 * dt);

      // In TREE mode: gentle rotation for ornaments, face-center for photos
      if (p.type === "PHOTO") {
        p.mesh.lookAt(0, p.mesh.position.y, 0);
        p.mesh.rotateY(Math.PI);
      } else {
        p.mesh.rotation.x = THREE.MathUtils.lerp(p.mesh.rotation.x, 0, dt);
        p.mesh.rotation.z = THREE.MathUtils.lerp(p.mesh.rotation.z, 0, dt);
        p.mesh.rotation.y += 0.5 * dt;
      }
    }

    if (bloom) {
      bloom.render(dt);
    } else {
      gl.render(scene, camera);
    }
  }, 1);

  // --- Cleanup ---
  useEffect(() => () => {
    Object.values(geometries).forEach((g) => g.dispose());
    Object.values(materials).forEach((m) => m.dispose());
    photos.forEach((t) => t.dispose());
  }, [geometries, materials, photos]);

  return (
    <group ref={mainGroupRef}>
      {/* Lights */}
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 5, 0]} intensity={2} distance={20} color={0xffaa00} />
      <spotLight position={[30, 40, 40]} intensity={1200} angle={0.5} penumbra={0.5} color={0xffcc66} />
      <spotLight position={[-30, 20, -30]} intensity={600} angle={0.5} penumbra={0.5} color={0x6688ff} />
      <directionalLight position={[0, 0, 50]} intensity={0.8} color={0xffeebb} />

      {/* Star */}
      <mesh
        geometry={geometries.star}
        material={materials.star}
        position={[0, TREE_CONFIG.particles.treeHeight / 2 + 1.2, 0]}
      />

      {/* Ornaments */}
      {ornamentMeshes.map((mesh, i) => (
        <primitive key={`ornament-${i}`} object={mesh} />
      ))}

      {/* Photo groups */}
      {photoGroups.map((group, i) => (
        <primitive key={`photo-${i}`} object={group} />
      ))}
    </group>
  );
}

// --- Canvas wrapper ---
export function ChristmasTreeCanvas({ active = true }: { active?: boolean } = {}) {
  const defaultTier = useConfigStore((state) => state.particle_tier);
  const bloomEnabled = useConfigStore((state) => state.bloom_enabled);
  const { tier } = usePerformance(defaultTier);
  const enableBloom = shouldEnableBloom(tier, bloomEnabled);

  return (
    <div className="h-full w-full">
      <SceneErrorBoundary>
        <Canvas
          frameloop={active ? "always" : "never"}
          aria-label="圣诞树3D场景"
          className="h-full w-full"
          camera={{ position: [0, 2, TREE_CONFIG.camera.z], fov: 42 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#000000"]} />
          <fog attach="fog" args={["#000000", 0.01]} />
          <TreeScene enableBloom={enableBloom} />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
