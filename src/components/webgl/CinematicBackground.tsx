"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePointerRef } from "@/hooks/useMousePosition";

/**
 * Full-bleed cinematic background — a domain-warped fractal-noise "nebula" in
 * the navy→cyan palette, rendered live in WebGL. This is the atmosphere behind
 * the hero (a procedural alternative to a looping video; drop a <video> behind
 * it instead if you have real footage).
 */
export function CinematicBackground({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const pointer = usePointerRef();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0, 0) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uRes;
        uniform vec2 uMouse;

        float hash(vec2 p){
          p = fract(p * vec2(123.34, 345.45));
          p += dot(p, p + 34.345);
          return fract(p.x * p.y);
        }
        float noise(vec2 p){
          vec2 i = floor(p), f = fract(p);
          float a = hash(i), b = hash(i + vec2(1.0,0.0));
          float c = hash(i + vec2(0.0,1.0)), d = hash(i + vec2(1.0,1.0));
          vec2 u = f*f*(3.0 - 2.0*f);
          return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
        }
        float fbm(vec2 p){
          float v = 0.0, a = 0.5;
          for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.0; a *= 0.5; }
          return v;
        }
        void main(){
          vec2 uv = vUv;
          vec2 p = (uv - 0.5) * vec2(uRes.x/uRes.y, 1.0) * 2.6;
          float t = uTime * 0.04;

          vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3 - t)));
          vec2 r = vec2(
            fbm(p + 3.4*q + vec2(1.7, 9.2) + uMouse*0.35 + t),
            fbm(p + 3.4*q + vec2(8.3, 2.8) - t)
          );
          float f = fbm(p + 3.6*r);

          vec3 deep   = vec3(0.012, 0.020, 0.045);
          vec3 navy   = vec3(0.035, 0.085, 0.215);
          vec3 cyan   = vec3(0.247, 0.862, 1.0);
          vec3 violet = vec3(0.36, 0.30, 0.85);

          vec3 col = deep;
          col = mix(col, navy,   clamp(f*f*2.3, 0.0, 1.0));
          col = mix(col, cyan,   clamp(r.x*r.x*0.85, 0.0, 1.0));
          col = mix(col, violet, clamp(q.y*0.45, 0.0, 0.55));

          float vig = smoothstep(1.25, 0.15, length(uv - 0.5));
          col *= 0.45 + 0.75*vig;
          col += (hash(uv*uRes + t) - 0.5) * 0.016;

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

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
      uniforms.uRes.value.set(w, h);
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
      uniforms.uTime.value += prefersReduced ? dt * 0.15 : dt;
      // ease the mouse uniform toward the pointer
      targetMouse.set(pointer.current.nx, pointer.current.ny);
      uniforms.uMouse.value.lerp(targetMouse, 0.04);
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (canvas.parentNode === mount) mount.removeChild(canvas);
    };
  }, [pointer]);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
