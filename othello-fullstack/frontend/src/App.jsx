
import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {useNavigate} from "react-router-dom";
import socket from "../ApiResponse/socketManager";
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
            <button onClick={gameModeInit}>Play Games</button>
          </div>
   </div>
  );
};

export default App;
