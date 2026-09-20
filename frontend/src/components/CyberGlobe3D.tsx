import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Globe, ShieldAlert, Zap } from 'lucide-react';
import { cyberSound } from '../utils/cyberSound';

interface ThreatArc {
  originName: string;
  originLat: number;
  originLng: number;
  threatType: string;
  severity: 'Critical' | 'High' | 'Medium';
  count: number;
}

export const CyberGlobe3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeThreat, setActiveThreat] = useState<ThreatArc | null>(null);

  const threatOrigins: ThreatArc[] = [
    { originName: 'Amsterdam Botnet Node', originLat: 52.36, originLng: 4.90, threatType: 'Volumetric DoS', severity: 'Critical', count: 48200 },
    { originName: 'Beijing Exploitation Host', originLat: 39.90, originLng: 116.40, threatType: 'SQL Injection', severity: 'Critical', count: 1420 },
    { originName: 'Moscow C2 Server', originLat: 55.75, originLng: 37.61, threatType: 'Botnet Command', severity: 'High', count: 850 },
    { originName: 'San Francisco Probe', originLat: 37.77, originLng: -122.41, threatType: 'Port Scanning', severity: 'Medium', count: 320 },
    { originName: 'Tokyo Relay Cluster', originLat: 35.67, originLng: 139.65, threatType: 'Brute Force SSH', severity: 'High', count: 640 }
  ];

  // SOC Target Hub Location (Bangalore, India)
  const targetLat = 12.97;
  const targetLng = 77.59;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 360;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 220;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Wireframe Globe Sphere
    const sphereRadius = 70;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 36, 36);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const globeMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(globeMesh);

    // Inner Glowing Core
    const innerGeo = new THREE.SphereGeometry(sphereRadius - 1, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x080e1e,
      transparent: true,
      opacity: 0.95
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    globeGroup.add(innerMesh);

    // Atmosphere Halo Ring
    const haloGeo = new THREE.RingGeometry(sphereRadius + 2, sphereRadius + 14, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.1
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    scene.add(haloMesh);

    // Helper: Convert Lat/Lng to 3D Coordinates on Sphere
    const latLngToVector3 = (lat: number, lng: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // Target SOC Hub Marker (Bangalore)
    const targetVec = latLngToVector3(targetLat, targetLng, sphereRadius);
    const targetDotGeo = new THREE.SphereGeometry(2.5, 16, 16);
    const targetDotMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const targetDot = new THREE.Mesh(targetDotGeo, targetDotMat);
    targetDot.position.copy(targetVec);
    globeGroup.add(targetDot);

    // Draw Threat Arcs & Origin Markers
    threatOrigins.forEach((threat) => {
      const originVec = latLngToVector3(threat.originLat, threat.originLng, sphereRadius);

      // Origin Marker
      const originGeo = new THREE.SphereGeometry(2, 16, 16);
      const originMat = new THREE.MeshBasicMaterial({
        color: threat.severity === 'Critical' ? 0xef4444 : 0xf59e0b
      });
      const originDot = new THREE.Mesh(originGeo, originMat);
      originDot.position.copy(originVec);
      globeGroup.add(originDot);

      // 3D Curved Bezier Arc
      const midPoint = new THREE.Vector3()
        .addVectors(originVec, targetVec)
        .multiplyScalar(0.5);
      const distance = originVec.distanceTo(targetVec);
      midPoint.normalize().multiplyScalar(sphereRadius + distance * 0.45);

      const curve = new THREE.QuadraticBezierCurve3(originVec, midPoint, targetVec);
      const points = curve.getPoints(50);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

      const arcMat = new THREE.LineBasicMaterial({
        color: threat.severity === 'Critical' ? 0xef4444 : 0xf59e0b,
        transparent: true,
        opacity: 0.7,
        linewidth: 2
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      globeGroup.add(arcLine);
    });

    // Outer Star/Particle Field
    const particlesCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 400;
      positions[i + 1] = (Math.random() - 0.5) * 400;
      positions[i + 2] = (Math.random() - 0.5) * 400;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 1.2,
      transparent: true,
      opacity: 0.4
    });
    const starField = new THREE.Points(particlesGeo, particlesMat);
    scene.add(starField);

    // Animation Loop & Interactive Rotation
    let animationFrameId: number;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const animate = () => {
      if (!isDragging) {
        globeGroup.rotation.y += 0.003;
      }
      starField.rotation.y += 0.0005;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Mouse Controls for 3D Drag Rotation
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      globeGroup.rotation.y += deltaMove.x * 0.005;
      globeGroup.rotation.x += deltaMove.y * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Resize Handler
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
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[360px] bg-[#060A14] rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl flex flex-col justify-between p-4 group">
      {/* Top Controls Overlay */}
      <div className="flex justify-between items-center z-10">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 font-sans">
            <Globe className="w-4 h-4 text-cyan-400 animate-spin" /> 3D Global Threat Telemetry Globe
          </h3>
          <p className="text-[10px] text-cyan-400/80 font-mono">Drag to rotate 3D WebGL sphere</p>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span> 5 Active Arcs
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            Hub: SOC Bangalore
          </span>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing z-0" />

      {/* Interactive Threat Selector Cards at Bottom */}
      <div className="z-10 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono">
        {threatOrigins.map((threat) => (
          <div
            key={threat.originName}
            onMouseEnter={() => {
              setActiveThreat(threat);
              cyberSound.playCyberClick();
            }}
            onMouseLeave={() => setActiveThreat(null)}
            className={`p-2 rounded-xl border transition-all cursor-pointer backdrop-blur-md ${
              activeThreat?.originName === threat.originName
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-950'
                : 'bg-[#0B101D]/80 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-white truncate">{threat.originName}</div>
            <div className="flex justify-between items-center mt-1">
              <span className={threat.severity === 'Critical' ? 'text-red-400 font-bold' : 'text-amber-400'}>
                {threat.threatType}
              </span>
              <span className="text-cyan-400 font-bold">{(threat.count).toLocaleString()} pps</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
