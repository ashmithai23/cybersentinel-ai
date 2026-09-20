import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Radar, Radio } from 'lucide-react';
import { cyberSound } from '../utils/cyberSound';

export const CyberRadar3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 75, 110);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const radarGroup = new THREE.Group();
    scene.add(radarGroup);

    // Tilted Radial Grid Rings
    const ringRadius = [15, 30, 45, 60];
    ringRadius.forEach((r, idx) => {
      const ringGeo = new THREE.RingGeometry(r - 0.5, r + 0.5, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2 + idx * 0.1
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      radarGroup.add(ringMesh);
    });

    // Crosshairs
    const lineMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.2 });
    const cross1Geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-60, 0, 0), new THREE.Vector3(60, 0, 0)]);
    const cross2Geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -60), new THREE.Vector3(0, 0, 60)]);
    radarGroup.add(new THREE.Line(cross1Geo, lineMat));
    radarGroup.add(new THREE.Line(cross2Geo, lineMat));

    // Rotating 3D Scan Cone Beam
    const coneGeo = new THREE.ConeGeometry(60, 30, 32, 1, true, 0, Math.PI / 3);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25
    });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.position.y = 15;
    coneMesh.rotation.x = Math.PI;
    radarGroup.add(coneMesh);

    // 3D Threat Blips with Elevation
    const blipCoords = [
      { x: 25, z: -20, y: 12, color: 0xef4444 }, // DoS
      { x: -35, z: 15, y: 8, color: 0xf59e0b },  // PortScan
      { x: -15, z: -30, y: 10, color: 0x06b6d4 } // Clean Node
    ];

    blipCoords.forEach((b) => {
      const bGeo = new THREE.SphereGeometry(2.5, 16, 16);
      const bMat = new THREE.MeshBasicMaterial({ color: b.color });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(b.x, b.y, b.z);
      radarGroup.add(bMesh);

      // Height stalk line
      const stalkGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(b.x, 0, b.z),
        new THREE.Vector3(b.x, b.y, b.z)
      ]);
      const stalkLine = new THREE.Line(stalkGeo, lineMat);
      radarGroup.add(stalkLine);
    });

    let animationId: number;
    const animate = () => {
      coneMesh.rotation.y += 0.03;
      radarGroup.rotation.y += 0.002;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[280px] bg-[#060A14] rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl flex flex-col justify-between p-4 group">
      <div className="flex justify-between items-center z-10">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 font-sans">
            <Radar className="w-4 h-4 text-cyan-400 animate-spin" /> 3D Holographic Volumetric Radar
          </h3>
          <p className="text-[10px] text-cyan-400/80 font-mono">Real-time height-field threat detection</p>
        </div>
        <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold">
          2 Active Threats
        </span>
      </div>

      <div ref={mountRef} className="absolute inset-0 z-0 cursor-pointer" />

      <div className="z-10 flex justify-between items-center text-[10px] font-mono text-slate-400 bg-[#0B101D]/80 p-2 rounded-xl border border-slate-800 backdrop-blur-md">
        <span>Freq: 2.4 GHz Volumetric</span>
        <span className="text-cyan-400 font-bold">Elevation Angle: 35°</span>
      </div>
    </div>
  );
};
