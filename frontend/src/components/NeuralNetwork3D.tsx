import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Cpu, Sparkles, Layers, Zap } from 'lucide-react';
import { cyberSound } from '../utils/cyberSound';

interface LayerInfo {
  name: string;
  type: string;
  nodesCount: number;
  activation: string;
  params: string;
}

export const NeuralNetwork3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredLayer, setHoveredLayer] = useState<LayerInfo | null>(null);

  const layers: LayerInfo[] = [
    { name: 'Input Layer', type: 'CIC-IDS Features', nodesCount: 78, activation: 'Raw Floats', params: '78 Features' },
    { name: 'Dense Layer 1', type: 'Fully Connected', nodesCount: 128, activation: 'ReLU + BatchNorm', params: '9,984 Weights' },
    { name: '1D Conv / LSTM', type: 'Spatial / Temporal', nodesCount: 64, activation: 'Dropout (0.3)', params: '8,192 Weights' },
    { name: 'Dense Layer 2', type: 'Classification', nodesCount: 32, activation: 'ReLU', params: '2,048 Weights' },
    { name: 'Output Layer', type: 'Threat Category', nodesCount: 15, activation: 'Softmax / CrossEntropy', params: '480 Weights' }
  ];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 320;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 160);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    // Node Positions Layout
    const layerPositionsX = [-110, -55, 0, 55, 110];
    const nodeGeometries: THREE.Mesh[] = [];

    layers.forEach((layer, layerIdx) => {
      const x = layerPositionsX[layerIdx];
      const count = Math.min(layer.nodesCount, 8); // Render representative nodes
      const spacingY = 18;
      const startY = -((count - 1) * spacingY) / 2;

      for (let i = 0; i < count; i++) {
        const y = startY + i * spacingY;
        const geo = new THREE.SphereGeometry(3.5, 16, 16);
        const mat = new THREE.MeshBasicMaterial({
          color: layerIdx === 0 ? 0x06b6d4 : layerIdx === 4 ? 0xef4444 : 0x3b82f6
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, 0);
        networkGroup.add(mesh);
        nodeGeometries.push(mesh);

        // Synaptic Lines to Next Layer
        if (layerIdx < layers.length - 1) {
          const nextCount = Math.min(layers[layerIdx + 1].nodesCount, 8);
          const nextStartX = layerPositionsX[layerIdx + 1];
          const nextStartY = -((nextCount - 1) * spacingY) / 2;

          for (let j = 0; j < nextCount; j++) {
            const nextY = nextStartY + j * spacingY;

            const lineGeo = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(x, y, 0),
              new THREE.Vector3(nextStartX, nextY, 0)
            ]);
            const lineMat = new THREE.LineBasicMaterial({
              color: 0x06b6d4,
              transparent: true,
              opacity: 0.15
            });
            const line = new THREE.Line(lineGeo, lineMat);
            networkGroup.add(line);
          }
        }
      }
    });

    // Animated Signal Pulses Moving Forward
    const pulseCount = 12;
    const pulseMeshes: THREE.Mesh[] = [];

    for (let p = 0; p < pulseCount; p++) {
      const pGeo = new THREE.SphereGeometry(1.5, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set(-110, (Math.random() - 0.5) * 60, 0);
      scene.add(pMesh);
      pulseMeshes.push(pMesh);
    }

    let animationId: number;
    let angle = 0;

    const animate = () => {
      angle += 0.005;
      networkGroup.rotation.y = Math.sin(angle) * 0.15;
      networkGroup.rotation.x = Math.cos(angle * 0.7) * 0.08;

      // Move pulses across layers
      pulseMeshes.forEach((pulse, idx) => {
        pulse.position.x += 1.8;
        if (pulse.position.x > 110) {
          pulse.position.x = -110;
          pulse.position.y = (Math.random() - 0.5) * 60;
        }
      });

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
    <div className="relative w-full h-[320px] bg-[#060A14] rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl flex flex-col justify-between p-4 group">
      {/* Top Header Controls */}
      <div className="flex justify-between items-center z-10">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 font-sans">
            <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" /> 3D Deep Learning Neural Architecture (ANN / 1D-CNN)
          </h3>
          <p className="text-[10px] text-cyan-400/80 font-mono">Live forward-pass synaptic signal flow visualizer</p>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
            PyTorch v2.2 Engine
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            98.3% F1-Score
          </span>
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-pointer" />

      {/* Layer Hover Metadata Cards */}
      <div className="z-10 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono">
        {layers.map((layer) => (
          <div
            key={layer.name}
            onMouseEnter={() => {
              setHoveredLayer(layer);
              cyberSound.playCyberClick();
            }}
            onMouseLeave={() => setHoveredLayer(null)}
            className={`p-2 rounded-xl border transition-all cursor-pointer backdrop-blur-md ${
              hoveredLayer?.name === layer.name
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-950'
                : 'bg-[#0B101D]/80 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-white truncate">{layer.name}</div>
            <div className="text-cyan-400 text-[9px] mt-0.5">{layer.type}</div>
            <div className="text-slate-400 text-[9px] truncate">{layer.params}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
