import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface Cluster3DCubeProps {
  size?: number;
  interactive?: boolean;
  activeStatus?: 'stable' | 'healing' | 'alert';
}

export const Cluster3DCube: React.FC<Cluster3DCubeProps> = ({
  size = 36,
  interactive = true,
  activeStatus = 'stable',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.set(3.4, 2.6, 3.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Accent Colors
    const primaryHex = activeStatus === 'alert' ? 0xff4d4f : activeStatus === 'healing' ? 0x4cd7f6 : 0x8083ff;
    const secondaryHex = 0x4edea3;
    const tertiaryHex = 0x4cd7f6;

    // 1. Central Core Cube (Wireframe)
    const coreGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const coreEdges = new THREE.EdgesGeometry(coreGeo);
    const coreMat = new THREE.LineBasicMaterial({
      color: primaryHex,
      transparent: true,
      opacity: 0.95,
      linewidth: 2,
    });
    const coreCube = new THREE.LineSegments(coreEdges, coreMat);
    rootGroup.add(coreCube);

    // 2. Outer Hologram Cage
    const cageGeo = new THREE.BoxGeometry(1.7, 1.7, 1.7);
    const cageEdges = new THREE.EdgesGeometry(cageGeo);
    const cageMat = new THREE.LineBasicMaterial({
      color: tertiaryHex,
      transparent: true,
      opacity: 0.35,
    });
    const cageCube = new THREE.LineSegments(cageEdges, cageMat);
    rootGroup.add(cageCube);

    // 3. Cluster Pod Nodes
    const nodeGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({ color: secondaryHex });
    const alertMat = new THREE.MeshBasicMaterial({ color: 0xff4d4f });

    const nodePositions = [
      new THREE.Vector3(1.15, 0.6, 0.45),
      new THREE.Vector3(-1.05, 0.75, -0.5),
      new THREE.Vector3(0.35, -1.15, 0.8),
      new THREE.Vector3(-0.85, -0.65, -0.95),
      new THREE.Vector3(0.9, -0.55, -0.9),
      new THREE.Vector3(-0.45, 1.1, 0.85),
    ];

    const nodes: THREE.Mesh[] = [];
    nodePositions.forEach((pos, idx) => {
      const mesh = new THREE.Mesh(nodeGeo, idx === 0 && activeStatus === 'alert' ? alertMat : nodeMat);
      mesh.position.copy(pos);
      rootGroup.add(mesh);
      nodes.push(mesh);
    });

    // 4. Connecting Laser Lines
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      nodePositions[0],
      nodePositions[1],
      nodePositions[2],
      nodePositions[3],
      nodePositions[4],
      nodePositions[5],
      nodePositions[0],
    ]);
    const lineMat = new THREE.LineBasicMaterial({
      color: tertiaryHex,
      transparent: true,
      opacity: 0.25,
    });
    const connectionLines = new THREE.Line(lineGeo, lineMat);
    rootGroup.add(connectionLines);

    // 5. Telemetry Ambient Particles
    const particleCount = 24;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 3.2;
      particlePositions[i + 1] = (Math.random() - 0.5) * 3.2;
      particlePositions[i + 2] = (Math.random() - 0.5) * 3.2;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: primaryHex,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particles);

    // GSAP quickTo for 60fps smooth mouse parallax (per gsap-performance skill)
    const rotationTarget = { x: 0, y: 0 };
    const rotXTo = gsap.quickTo(rotationTarget, 'x', { duration: 0.4, ease: 'power2.out' });
    const rotYTo = gsap.quickTo(rotationTarget, 'y', { duration: 0.4, ease: 'power2.out' });

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      rotYTo(nx * 1.8);
      rotXTo(-ny * 1.8);
    };

    const handleMouseLeave = () => {
      rotXTo(0);
      rotYTo(0);
    };

    if (interactive) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', handleMouseLeave);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    // Render loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Continuous rotation scaled by delta + GSAP mouse tilt
      rootGroup.rotation.y += delta * 0.9;
      rootGroup.rotation.x = THREE.MathUtils.lerp(rootGroup.rotation.x, rotationTarget.x + Math.sin(elapsed * 0.8) * 0.08, 0.06);
      rootGroup.rotation.z = Math.cos(elapsed * 0.6) * 0.04;

      // Counter-rotate inner core
      coreCube.rotation.y = -elapsed * 0.45;
      coreCube.rotation.x = Math.sin(elapsed * 0.7) * 0.25;

      // Pulse nodes
      nodes.forEach((node, i) => {
        node.position.y = nodePositions[i].y + Math.sin(elapsed * 2.2 + i * 1.2) * 0.06;
      });

      // Pulse particles
      particles.rotation.y = -elapsed * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (interactive) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseLeave);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      coreGeo.dispose();
      coreEdges.dispose();
      coreMat.dispose();
      cageGeo.dispose();
      cageEdges.dispose();
      cageMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      alertMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [size, interactive, activeStatus]);

  return (
    <div
      ref={mountRef}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: interactive ? 'pointer' : 'default',
      }}
      title="KubeHeal Autonomous Mesh Core"
    />
  );
};
