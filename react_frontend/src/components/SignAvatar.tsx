import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface SignAvatarProps {
  signData?: {
    sign: string;
    confidence: number;
    landmarks?: any;
  };
  isAnimating?: boolean;
  onAnimationComplete?: () => void;
}

// Hand component for sign language gestures
const Hand: React.FC<{ 
  position: [number, number, number]; 
  rotation: [number, number, number];
  isLeft?: boolean;
}> = ({ position, rotation, isLeft = false }) => {
  const handRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (handRef.current) {
      // Add subtle animation
      handRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={handRef} position={position} rotation={rotation}>
      {/* Palm */}
      <Box args={[0.3, 0.2, 0.1]} position={[0, 0, 0]}>
        <meshStandardMaterial color={isLeft ? "#ffdbac" : "#ffdbac"} />
      </Box>
      
      {/* Thumb */}
      <Cylinder args={[0.05, 0.05, 0.2]} position={isLeft ? [-0.15, 0.1, 0] : [0.15, 0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color="#ffdbac" />
      </Cylinder>
      
      {/* Index finger */}
      <Cylinder args={[0.04, 0.04, 0.25]} position={isLeft ? [-0.1, 0.2, 0] : [0.1, 0.2, 0]}>
        <meshStandardMaterial color="#ffdbac" />
      </Cylinder>
      
      {/* Middle finger */}
      <Cylinder args={[0.04, 0.04, 0.3]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#ffdbac" />
      </Cylinder>
      
      {/* Ring finger */}
      <Cylinder args={[0.04, 0.04, 0.25]} position={isLeft ? [0.1, 0.2, 0] : [-0.1, 0.2, 0]}>
        <meshStandardMaterial color="#ffdbac" />
      </Cylinder>
      
      {/* Pinky */}
      <Cylinder args={[0.03, 0.03, 0.2]} position={isLeft ? [0.15, 0.15, 0] : [-0.15, 0.15, 0]}>
        <meshStandardMaterial color="#ffdbac" />
      </Cylinder>
    </group>
  );
};

// Avatar body component
const AvatarBody: React.FC<{ signData?: any }> = ({ signData }) => {
  const bodyRef = useRef<THREE.Group>(null);
  const [leftHandPos, setLeftHandPos] = useState<[number, number, number]>([-0.8, 0.5, 0]);
  const [rightHandPos, setRightHandPos] = useState<[number, number, number]>([0.8, 0.5, 0]);
  const [leftHandRot, setLeftHandRot] = useState<[number, number, number]>([0, 0, 0]);
  const [rightHandRot, setRightHandRot] = useState<[number, number, number]>([0, 0, 0]);

  // Animate based on sign data
  useEffect(() => {
    if (signData?.sign) {
      // Define sign-specific hand positions
      const signPositions: { [key: string]: { left: [number, number, number], right: [number, number, number] } } = {
        'A': { left: [-0.6, 0.8, 0], right: [0.6, 0.8, 0] },
        'B': { left: [-0.7, 0.6, 0], right: [0.7, 0.6, 0] },
        'C': { left: [-0.5, 0.7, 0], right: [0.5, 0.7, 0] },
        'HELLO': { left: [-0.8, 0.4, 0], right: [0.8, 0.4, 0] },
        'THANK YOU': { left: [-0.6, 0.6, 0], right: [0.6, 0.6, 0] },
        'YES': { left: [-0.5, 0.8, 0], right: [0.5, 0.8, 0] },
        'NO': { left: [-0.7, 0.5, 0], right: [0.7, 0.5, 0] },
      };

      const positions = signPositions[signData.sign] || signPositions['A'];
      
      // Animate to new positions
      setLeftHandPos(positions.left);
      setRightHandPos(positions.right);
      
      // Add rotation based on sign
      if (signData.sign === 'HELLO') {
        setLeftHandRot([0, 0, Math.PI / 4]);
        setRightHandRot([0, 0, -Math.PI / 4]);
      } else {
        setLeftHandRot([0, 0, 0]);
        setRightHandRot([0, 0, 0]);
      }
    }
  }, [signData]);

  useFrame((state) => {
    if (bodyRef.current) {
      // Gentle breathing animation
      bodyRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group ref={bodyRef}>
      {/* Head */}
      <Sphere args={[0.3, 32, 32]} position={[0, 1.2, 0]}>
        <meshStandardMaterial color="#ffdbac" />
      </Sphere>
      
      {/* Eyes */}
      <Sphere args={[0.05, 16, 16]} position={[-0.1, 1.3, 0.25]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      <Sphere args={[0.05, 16, 16]} position={[0.1, 1.3, 0.25]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      
      {/* Mouth */}
      <Box args={[0.1, 0.02, 0.02]} position={[0, 1.15, 0.25]}>
        <meshStandardMaterial color="#000000" />
      </Box>
      
      {/* Body */}
      <Cylinder args={[0.4, 0.3, 0.8]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#4a90e2" />
      </Cylinder>
      
      {/* Arms */}
      <Cylinder args={[0.08, 0.08, 0.6]} position={[-0.5, 0.6, 0]} rotation={[0, 0, Math.PI / 6]}>
        <meshStandardMaterial color="#ffdbac" />
      </Cylinder>
      <Cylinder args={[0.08, 0.08, 0.6]} position={[0.5, 0.6, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <meshStandardMaterial color="#ffdbac" />
      </Cylinder>
      
      {/* Hands */}
      <Hand position={leftHandPos} rotation={leftHandRot} isLeft={true} />
      <Hand position={rightHandPos} rotation={rightHandRot} isLeft={false} />
      
      {/* Legs */}
      <Cylinder args={[0.1, 0.1, 0.8]} position={[-0.2, -0.4, 0]}>
        <meshStandardMaterial color="#2c3e50" />
      </Cylinder>
      <Cylinder args={[0.1, 0.1, 0.8]} position={[0.2, -0.4, 0]}>
        <meshStandardMaterial color="#2c3e50" />
      </Cylinder>
    </group>
  );
};

// Main Sign Avatar Component
const SignAvatar: React.FC<SignAvatarProps> = ({ 
  signData, 
  isAnimating = false, 
  onAnimationComplete 
}) => {
  const [currentSign, setCurrentSign] = useState<string>('');
  const [showSignText, setShowSignText] = useState(false);

  useEffect(() => {
    if (signData?.sign && signData.sign !== currentSign) {
      setCurrentSign(signData.sign);
      setShowSignText(true);
      
      // Hide text after 3 seconds
      setTimeout(() => {
        setShowSignText(false);
        onAnimationComplete?.();
      }, 3000);
    }
  }, [signData, currentSign, onAnimationComplete]);

  return (
    <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, 5, 5]} intensity={0.4} />
        
        {/* Avatar */}
        <AvatarBody signData={signData} />
        
        {/* Sign Text Display */}
        {showSignText && signData?.sign && (
          <Text
            position={[0, -1.5, 0]}
            fontSize={0.3}
            color="#2563eb"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter-bold.woff"
          >
            {signData.sign}
            {signData.confidence && (
              <meshBasicMaterial color="#10b981" />
            )}
          </Text>
        )}
        
        {/* Confidence Indicator */}
        {signData?.confidence && (
          <Text
            position={[0, -1.8, 0]}
            fontSize={0.15}
            color="#6b7280"
            anchorX="center"
            anchorY="middle"
          >
            Confidence: {Math.round(signData.confidence * 100)}%
          </Text>
        )}
        
        {/* Controls */}
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          enableRotate={true}
          minDistance={2}
          maxDistance={5}
        />
      </Canvas>
      
      {/* Overlay Information */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {signData?.sign || 'Ready to Learn'}
              </h3>
              <p className="text-sm text-gray-600">
                {signData?.sign ? 'Watch the avatar demonstrate the sign' : 'Start recognition to see signs'}
              </p>
            </div>
            {signData?.confidence && (
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {Math.round(signData.confidence * 100)}%
                </div>
                <div className="text-xs text-gray-500">Confidence</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignAvatar;
