"use client";

import { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

// --- 手写一个生成随机坐标的函数 (用来替代 maath) ---
// 这段代码保证生成的坐标 100% 是有效数字，绝不会报错
const generateSpherePositions = (count: number, radius: number) => {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    // 使用球坐标系生成均匀分布的点
    const r = radius * Math.cbrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  
  return positions;
};

function Stars(props: any) {
  const ref = useRef<any>(null);
  
  // 使用 useMemo 确保只生成一次数据，避免重复计算
  const sphere = useMemo(() => generateSpherePositions(3000, 1.5), []);

  useFrame((state, delta) => {
    if (ref.current) {
      // 让粒子缓慢旋转
      ref.current.rotation.x -= delta / 15;
      ref.current.rotation.y -= delta / 20;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={ref}
        positions={sphere}
        stride={3}
        frustumCulled={false}
        {...props}
      >
        <PointMaterial
          transparent
          color="#888888"  // 粒子颜色
          size={0.003}     // 粒子大小 (调得细一点更精致)
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

export function DynamicBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {/* dpr 属性用于适配高清屏，保证粒子不模糊 */}
      <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Stars />
        </Suspense>
      </Canvas>
    </div>
  );
}