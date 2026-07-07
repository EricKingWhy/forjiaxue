import {
  AdditiveBlending,
  Color,
  ShaderMaterial,
  Vector2,
} from "three";

export const particleVertexShader = /* glsl */ `
attribute float size;
attribute vec3 initialPosition;
attribute vec3 targetPosition;
varying vec3 vColor;
uniform float particleScale;
uniform float pointSize;
uniform float progress;
uniform vec2 pointer;
uniform float scatterRadius;
uniform float scatterIntensity;
uniform float pointerWorldScale;
void main() {
  vColor = color;
  vec3 currentPosition = mix(initialPosition, targetPosition, progress);

  vec2 pointerWorld = pointer * pointerWorldScale;
  vec2 offset = currentPosition.xy - pointerWorld;
  float d = length(offset);
  if (d < scatterRadius && d > 0.0001) {
    vec2 dir = offset / d;
    float strength = 1.0 - d / scatterRadius;
    currentPosition.xy += dir * strength * scatterRadius * 0.6 * scatterIntensity;
  }

  vec4 viewPosition = modelViewMatrix * vec4(currentPosition, 1.0);
  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = max(1.0, size * particleScale * pointSize * (40.0 / max(1.0, -viewPosition.z)));
}
`;

export const particleFragmentShader = /* glsl */ `
precision highp float;
varying vec3 vColor;
uniform vec3 baseColor;
void main() {
  vec2 centered = gl_PointCoord - vec2(0.5);
  float distanceToCenter = length(centered);
  if (distanceToCenter > 0.5) discard;
  float alpha = smoothstep(0.5, 0.15, distanceToCenter);
  gl_FragColor = vec4(vColor * baseColor, alpha);
}
`;

interface ParticleMaterialOptions {
  color?: string;
  size?: number;
  pointSize?: number;
  scatterRadius?: number;
  pointerWorldScale?: number;
}

export function createParticleMaterial({
  color = "#ffffff",
  size = 0.34,
  pointSize = 1,
  scatterRadius = 0.75,
  pointerWorldScale = 4.0,
}: ParticleMaterialOptions = {}): ShaderMaterial {
  return new ShaderMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      baseColor: { value: new Color(color) },
      particleScale: { value: size },
      pointSize: { value: pointSize },
      progress: { value: 0 },
      pointer: { value: new Vector2(10, 10) },
      scatterRadius: { value: scatterRadius },
      scatterIntensity: { value: 1 },
      pointerWorldScale: { value: pointerWorldScale },
    },
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
  });
}
