import assert from "node:assert/strict";
import test from "node:test";
import { ShaderMaterial } from "three";

import { createParticleMaterial } from "./ParticleMaterial.ts";

test("creates a shader material with color and size uniforms", () => {
  const material = createParticleMaterial({ color: "#ff4080", size: 2 });

  assert.ok(material instanceof ShaderMaterial);
  assert.equal(material.uniforms.particleScale.value, 2);
  assert.equal(material.uniforms.baseColor.value.getHexString(), "ff4080");
  assert.match(material.vertexShader, /gl_Position/);
  assert.match(material.fragmentShader, /gl_FragColor/);
});

test("exposes pointSize as a global particle scale", () => {
  const material = createParticleMaterial({ pointSize: 1.75 });

  assert.equal(material.uniforms.pointSize.value, 1.75);
  assert.match(material.vertexShader, /uniform float pointSize/);
});

test("starts aggregation progress at zero", () => {
  const material = createParticleMaterial();

  assert.equal(material.uniforms.progress.value, 0);
});

test("interpolates initial and target positions by progress", () => {
  const material = createParticleMaterial();

  assert.match(
    material.vertexShader,
    /mix\(initialPosition,\s*targetPosition,\s*progress\)/,
  );
});

test("provides an off-screen pointer uniform", () => {
  const material = createParticleMaterial();
  assert.deepEqual(material.uniforms.pointer.value.toArray(), [10, 10]);
});

test("provides a configurable scatter radius", () => {
  const material = createParticleMaterial({ scatterRadius: 1.25 });
  assert.equal(material.uniforms.scatterRadius.value, 1.25);
});

test("does not redeclare Three.js injected vertex color attribute", () => {
  const material = createParticleMaterial();
  assert.doesNotMatch(material.vertexShader, /attribute\s+vec3\s+color\s*;/);
});

test("attenuates pointer scatter inside the configured radius", () => {
  const shader = createParticleMaterial().vertexShader;
  assert.match(shader, /d < scatterRadius/);
  assert.match(shader, /scatterIntensity/);
  assert.match(shader, /1\.0 - d \/ scatterRadius/);
});
