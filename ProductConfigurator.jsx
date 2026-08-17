import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Box } from '@react-three/drei';

export default function ProductConfigurator() {
  // --- State Management ---
  const [selectedColor, setSelectedColor] = useState('#ef4444'); // Default Red
  const [parts, setParts] = useState({
    wheels: true,
    frame: true,
    cushion: true,
  });

  // Available texture/color options
  const colors = [
    { name: 'Carmine Red', hex: '#ef4444' },
    { name: 'Cobalt Blue', hex: '#3b82f6' },
    { name: 'Charcoal Black', hex: '#1f2937' },
  ];

  // Handler for part toggles
  const togglePart = (partName) => {
    setParts((prev) => ({
      ...prev,
      [partName]: !prev[partName],
    }));
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans">
      
      {/* LEFT SIDE: 3D Canvas */}
      <div className="flex-grow relative h-full">
        <Canvas camera={{ position: [3, 2, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          {/* PBR Environment Lighting */}
          <Environment preset="city" />
          
          {/* Camera Controls */}
          <OrbitControls 
            makeDefault 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 1.5} 
          />

          {/* Placeholder 3D Model */}
          {/* In a real app, you would load a GLTF model here and map the 'parts' and 'selectedColor' to specific meshes */}
          <group position={[0, 0, 0]}>
            {parts.frame && (
              <Box args={[2, 2, 2]}>
                <meshStandardMaterial color={selectedColor} roughness={0.2} metalness={0.8} />
              </Box>
            )}
            
            {/* Visual indicator that parts are toggled */}
            {parts.wheels && (
              <Box args={[0.5, 0.5, 0.5]} position={[-1.2, -1, 1.2]}>
                <meshStandardMaterial color="#111" />
              </Box>
            )}
            {parts.cushion && (
              <Box args={[1.8, 0.2, 1.8]} position={[0, 1.1, 0]}>
                <meshStandardMaterial color="#e5e7eb" />
              </Box>
            )}
          </group>
        </Canvas>
      </div>

      {/* RIGHT SIDE: Control Panel */}
      <div className="w-80 bg-white border-l border-gray-200 shadow-2xl flex flex-col p-6 overflow-y-auto z-10 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurator</h2>

        {/* Section: Materials / Textures */}
        <div className="mb-8">
          <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-4">
            Materials & Colors
          </h3>
          <div className="flex gap-4">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.hex)}
                title={color.name}
                className={`w-12 h-12 rounded-full border-4 transition-transform hover:scale-110 ${
                  selectedColor === color.hex ? 'border-gray-400 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>

        <hr className="border-gray-200 mb-8" />

        {/* Section: Parts */}
        <div>
          <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-4">
            Components
          </h3>
          <div className="flex flex-col gap-3">
            {Object.keys(parts).map((partKey) => (
              <button
                key={partKey}
                onClick={() => togglePart(partKey)}
                className={`px-4 py-3 rounded-lg text-left font-medium transition-colors border ${
                  parts[partKey]
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="capitalize">{partKey}</span>
                  {/* Simple custom checkbox indicator */}
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${
                    parts[partKey] ? 'bg-blue-500' : 'border-2 border-gray-300'
                  }`}>
                    {parts[partKey] && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
