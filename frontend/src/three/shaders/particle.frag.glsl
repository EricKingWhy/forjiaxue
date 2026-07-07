precision highp float;

varying vec3 vColor;
uniform vec3 baseColor;
uniform float audioIntensity;

void main() {
  vec2 centered = gl_PointCoord - vec2(0.5);
  float distanceToCenter = length(centered);
  if (distanceToCenter > 0.5) discard;
  float alpha = smoothstep(0.5, 0.15, distanceToCenter);
  float audioGlow = 1.0 + clamp(audioIntensity, 0.0, 1.0) * 0.35;
  gl_FragColor = vec4(vColor * baseColor * audioGlow, alpha);
}
