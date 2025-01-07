//TODO:  Othello init ko listen kro agr status 200 hai toh loading wala dikhao agr kuch aur hai toh uska component dikhao ab iske liye jo data aaya hai usko usedispatch se store me bhejo inside a useEffect jisse jitna baar data.status change ho utna baar use dispatch kaam kre and in the loading page use selector se store se puch lenge and jo value aayega usko usestate se variable me store Krna hoga taki ui update ho ske

import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {useNavigate} from "react-router-dom";
import "./app.css";
const BoardGame = () => {
  const { scene } = useGLTF("/boardgame.glb");
  return <primitive object={scene} scale={[0.035, 0.035, 0.035]} />;
};

const RotatingControls = ({ enableZoom }) => {
  const orbitRef = useRef();
  const [isUserInteracting, setIsUserInteracting] = useState(false);


  useFrame(() => {
    if (!isUserInteracting && orbitRef.current) {
      orbitRef.current.autoRotate = true; 
    } else {
      orbitRef.current.autoRotate = false;
    }
  });

  const handleStart = () => setIsUserInteracting(true);
  const handleEnd = () => {
    setIsUserInteracting(false);
    setTimeout(() => setIsUserInteracting(false), 2000); 
  };

  return (
    <OrbitControls
      ref={orbitRef}
      enableZoom={enableZoom}
      onStart={handleStart}
      onEnd={handleEnd}
      autoRotateSpeed={useEffect(() => {
        Math.random() *0.5;
      }, [Date.now()%5000===0])
      }       
    />
  ); 
};
const App = () => {
const navigate=useNavigate();

const gameModeInit=()=>{
navigate('/games')
}
  return (

   <div className="home-container">
      <div className="board-game">
            <Canvas
              camera={{
                position: [0, 5, 7], 
                fov: 50,
              }}
            >

              <ambientLight intensity={1.5} />
              <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
              <spotLight position={[-10, 20, 10]} intensity={1.5} angle={0.5} />
    

              <BoardGame />
    

              <RotatingControls enableZoom={true} />
            </Canvas>
          </div>
          <div className="home-content">
            <h1>Missing Playing with friends ?</h1>
            {/* no worry now you can play online */}
            <button onClick={gameModeInit}>Play Games</button>
          </div>
   </div>
  );
};

export default App;
