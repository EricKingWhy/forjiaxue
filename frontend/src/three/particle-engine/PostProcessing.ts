import {
  EffectComposer,
} from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import {
  type Camera,
  type Scene,
  type WebGLRenderer,
  Vector2,
} from "three";

export interface BloomOptions {
  strength?: number;
  radius?: number;
  threshold?: number;
}

export interface BloomComposer {
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
  setSize: (width: number, height: number) => void;
  render: (deltaTime?: number) => void;
  dispose: () => void;
  setEnabled: (enabled: boolean) => void;
}

function resolveSize(renderer: WebGLRenderer): Vector2 {
  const size = new Vector2();
  renderer.getSize(size);
  return size;
}

/**
 * Creates an `EffectComposer` chain (RenderPass + UnrealBloomPass + OutputPass)
 * suitable for use inside an R3F `useFrame`. The consumer must call
 * `composer.render()` each frame and `setSize` on viewport resize, and must
 * disable R3F's default rendering (set `frameloop="always"` and avoid
 * `Canvas`'s own render — see ParticleCanvas).
 */
export function createBloomComposer(
  renderer: WebGLRenderer,
  scene: Scene,
  camera: Camera,
  options: BloomOptions = {},
): BloomComposer {
  const size = resolveSize(renderer);
  const composer = new EffectComposer(renderer);
  composer.setSize(size.width, size.height);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    size,
    options.strength ?? 0.8,
    options.radius ?? 0.4,
    options.threshold ?? 0.0,
  );
  composer.addPass(bloomPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  return {
    composer,
    bloomPass,
    setSize: (width, height) => {
      composer.setSize(width, height);
      bloomPass.setSize(width, height);
    },
    render: (deltaTime) => {
      composer.render(deltaTime);
    },
    dispose: () => composer.dispose(),
    setEnabled: (enabled) => {
      bloomPass.enabled = enabled;
    },
  };
}
