"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePointerRef } from "@/hooks/useMousePosition";

/**
 * Live WebGL depth: a 3D particle cloud you can push around with the cursor.
 * The whole field parallaxes toward the pointer, and nearby particles are
 * repelled in the vertex shader for a tactile "part the field" feel.
 */
export function ParticleField({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const pointer = usePointerRef();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 6.4);

    // --- build the cloud: a sphere shell with depth + colored by radius ---
    const COUNT = 4200;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const scales = new Float32Array(COUNT);

    const cyan = new THREE.Color(0x3fdcff);
    const blue = new THREE.Color(0x5b8cff);
    const violet = new THREE.Color(0x8b6cff);
    const tmp = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      // distribute on a slightly flattened sphere shell + scatter
      const r = 2.1 + Math.pow(Math.random(), 2.0) * 1.7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi) * 0.72;
      const z = r * Math.sin(phi) * Math.sin(theta);
      positions.set([x, y, z], i * 3);

      const t = THREE.MathUtils.clamp((r - 2.1) / 1.7, 0, 1);
      if (t < 0.5) tmp.copy(cyan).lerp(blue, t * 2);
      else tmp.copy(blue).lerp(violet, (t - 0.5) * 2);
      colors.set([tmp.r, tmp.g, tmp.b], i * 3);

      scales[i] = 0.6 + Math.random() * 1.8;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uSize: { value: 26 },
      uRes: { value: new THREE.Vector2(1, 1) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uSize;
        uniform vec2 uRes;
        attribute float aScale;
        attribute vec3 aColor;
        varying vec3 vColor;
        varying float vFade;
        void main(){
          vColor = aColor;
          vec3 pos = position;
          pos.y += sin(uTime * 0.6 + pos.x * 0.7) * 0.06;
          pos.x += cos(uTime * 0.5 + pos.z * 0.7) * 0.05;

          // repel from the cursor (mapped into the cloud's space)
          vec3 m = vec3(uMouse.x * 3.4, uMouse.y * 2.2, 0.0);
          vec2 d = pos.xy - m.xy;
          float dist = length(d);
          float force = smoothstep(1.7, 0.0, dist) * 0.95;
          pos.xy += normalize(d + 1e-4) * force;

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          vFade = clamp(1.6 / (-mv.z), 0.0, 1.6);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * aScale * (1.0 / -mv.z) * (uRes.y / 850.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec3 vColor;
        varying float vFade;
        void main(){
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float glow = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(vColor * (0.35 + glow), glow * vFade);
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const canvas = renderer.domElement;
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    mount.appendChild(canvas);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      uniforms.uRes.value.set(w, h * renderer.getPixelRatio());
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    const targetMouse = new THREE.Vector2(0, 0);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      const dt = clock.getDelta();
      uniforms.uTime.value += prefersReduced ? dt * 0.2 : dt;

      targetMouse.set(pointer.current.nx, pointer.current.ny);
      uniforms.uMouse.value.lerp(targetMouse, 0.05);

      // parallax: tilt the cloud toward the pointer
      const tx = pointer.current.ny * 0.25;
      const ty = pointer.current.nx * 0.4;
      points.rotation.x += (tx - points.rotation.x) * 0.04;
      points.rotation.y += (ty + uniforms.uTime.value * 0.02 - points.rotation.y) * 0.04;

      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (canvas.parentNode === mount) mount.removeChild(canvas);
    };
  }, [pointer]);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
