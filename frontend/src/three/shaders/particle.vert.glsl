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
uniform float audioScatter;

void main() {
  vColor = color;
  vec3 currentPosition = mix(initialPosition, targetPosition, progress);
  vec2 audioOffset = vec2(
    sin(initialPosition.x * 5.7 + initialPosition.z),
    cos(initialPosition.y * 6.1 - initialPosition.z)
  ) * audioScatter;
  currentPosition.xy += audioOffset;

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
