import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import "./css/othelloHome.css";
import {useNavigate } from "react-router-dom";
import socket from "../ApiResponse/socketManager";
import { nanoid } from "nanoid";

const OthelloBoard = () => {
  const { scene } = useGLTF("/othello.glb");
  return <primitive object={scene} scale={[0.45, 0.45, 0.45]} position={[-1, 0, 0]}/>;
};

const RotatingControls = ({ enableZoom }) => {
  const orbitRef = useRef();
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Idle rotation
  useFrame(() => {
    if (!isUserInteracting && orbitRef.current) {
      orbitRef.current.autoRotate = true; // Enable auto-rotation
    } else {
      orbitRef.current.autoRotate = false; // Disable auto-rotation during user interaction
    }
  });

  // Reset interaction state after user stops interacting
  const handleStart = () => setIsUserInteracting(true);
  const handleEnd = () => {
    setIsUserInteracting(false);
    setTimeout(() => setIsUserInteracting(false), 2000); // Adjust timeout to detect idle
  };

  return (
    <OrbitControls
      ref={orbitRef}
      enableZoom={enableZoom}
      // maxPolarAngle={Math.PI / 2.5} // Prevent excessive rotation
      // minPolarAngle={Math.PI / 4}  // Lock rotation angle to view the board
      onStart={handleStart}
      onEnd={handleEnd}
      autoRotateSpeed={useEffect(() => {
        Math.random() *0.5;
      }, [Date.now()%5000===0])
      }        // Set rotation speed
    />
  ); 
};
function OhtelloHome() {
  const navigate=useNavigate();

  const othelloGameInit = async () => {
    await socket.emit("othello-init");
    navigate(`/games/waiting-room/?=${nanoid(16)}`)
    };


  return (
    <div className="othello-home">
      <div className="othello-3d-board">
        <Canvas
          camera={{
            position: [0, 5, 7], // Position the camera above and at an angle
            fov: 50,
          }}
        >
          {/* Lighting */}
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
          <spotLight position={[-10, 20, 10]} intensity={1.5} angle={0.5} />

          {/* Othello board */}
          <OthelloBoard />

          {/* Controls */}
          <RotatingControls enableZoom={false} />
        </Canvas>
      </div>
      <div className="othello-home-cta">
        <div className="othello-home-cta-title">
        <h1>Play Othello Online </h1>
        <h1>on the #1 site</h1>
        </div>
        <div className="othello-home-cta-stats">
          <span>Games Today</span>
          <span>Playing Now</span>
        </div>
        <button className="othello-home-cta-button-pvp" onClick={othelloGameInit}>
          <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 600 600"
       style={{ transform: `scaleY(-1)` }}
        ><path d="M302.344 420.703c-5.156-.937-6.68-1.757-23.79-13.125-15.937-10.43-31.991-18.398-50.273-24.96-6.914-2.345-13.359-5.04-14.296-5.743-2.696-2.11-38.086-52.852-39.961-57.187-.938-2.227-2.461-14.18-3.399-27.422-1.875-23.555-3.632-32.695-9.257-48.164l-3.165-8.555 3.047-1.875c1.758-1.29 6.328-2.227 11.368-2.578 12.421-.704 20.039 2.46 30.234 12.656l7.851 7.969v-10.195c0-20.157 6.797-36.094 21.797-51.094 10.313-10.313 21.328-16.64 34.102-19.922 8.906-2.227 27.422-2.227 36.094 0 14.297 3.75 30 13.828 38.437 24.727 4.454 5.742 5.274 6.328 9.493 6.328s5.507.82 12.07 7.383c6.328 6.328 8.555 9.843 16.992 27.07 8.79 18.047 10.313 20.507 18.047 28.242 9.375 9.375 15.352 13.477 32.93 22.969 15.234 8.203 26.132 18.75 32.93 32.11 6.328 12.304 12.656 29.296 11.718 31.64-1.523 3.984-5.156-.82-11.132-14.648-10.899-24.61-17.461-32.579-35.274-42.305-15.117-8.203-26.719-15.938-33.398-22.266l-6.211-5.86L383.79 270c-3.046 2.344-6.21 4.22-7.148 4.22-2.344 0-1.992-3.165.469-4.102 1.055-.352 3.75-2.227 5.86-3.985l3.866-3.398-3.632-5.156-3.633-5.157-6.562 3.282c-3.633 1.757-7.266 3.28-8.086 3.28-3.516 0-1.29-2.343 5.39-5.976 3.868-1.992 7.032-4.453 7.032-5.273 0-2.11-.352-1.992-8.672.703-8.203 2.813-7.734 2.695-7.734.82 0-.82 2.93-2.46 6.445-3.632 3.516-1.055 6.68-2.579 7.148-3.282 1.29-1.992-8.906-20.39-15-27.305-6.797-7.5-9.14-8.437-13.828-5.742-9.14 5.39-11.25 24.844-5.273 48.867 1.054 4.102 8.32 20.157 16.64 37.032 13.125 26.25 14.883 30.469 15 35.625 0 4.687-.469 6.094-1.875 6.445-1.523.234-2.578-1.64-4.453-7.852-1.406-4.453-3.047-8.554-3.633-8.906-2.578-1.64-18.632 9.023-29.531 19.688l-7.734 7.617-10.078.82c-13.008 1.055-17.93.352-37.032-5.977-8.672-2.93-19.101-5.625-23.203-5.976-7.266-.703-7.5-.82-11.953-6.68-6.094-8.203-18.399-19.805-24.258-22.852l-4.922-2.46.118-13.125c0-14.649-1.172-20.391-6.211-30.586-6.446-12.657-16.172-20.86-27.188-22.97-6.328-1.171-7.148-.234-1.992 1.993 4.805 2.227 10.43 10.664 11.953 18.281 1.172 5.391 1.055 7.032-.82 11.954-2.344 6.328-6.797 11.015-10.313 11.015-2.226 0-2.344.47-1.523 10.313 1.875 25.43 1.64 24.375 9.61 35.976 3.984 5.743 10.78 15.586 15 21.68 16.288 23.438 15 22.266 30 27.54 17.929 6.328 37.265 16.288 54.492 27.89l14.062 9.61 8.203-.118c4.57-.117 14.297-1.523 21.68-3.281 41.25-9.844 81.68-10.43 104.883-1.758 8.32 3.047 11.015 5.156 9.023 7.031-1.172 1.29-2.344 1.29-6.445.118-30.938-9.024-58.242-8.79-105.117.937-18.868 3.867-24.961 4.57-30.47 3.516m28.36-87.54c8.32-8.085 23.438-19.1 26.484-19.1 2.344 0 1.758-1.876-5.273-15.587-3.75-7.265-6.797-13.242-6.914-13.36 0-.116-4.22 3.868-9.375 8.79-10.313 10.195-18.164 15.117-30.352 19.219-6.797 2.227-10.547 2.695-21.68 2.578-11.484 0-14.882-.469-22.617-3.164-14.414-5.04-26.953-14.062-35.39-25.664l-5.274-7.031v7.617c0 4.219-.352 8.437-.703 9.375-.47 1.172 1.523 3.398 6.21 6.797 7.5 5.507 19.454 17.46 22.266 22.265 1.524 2.695 3.165 3.399 10.196 4.453 4.57.82 15.468 3.75 24.14 6.68"/></svg>Play Online</button>
        <button className="othello-home-cta-button-pvb"><svg width="50" height="50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.753 14a2.25 2.25 0 0 1 2.25 2.25v.905A3.75 3.75 0 0 1 18.696 20C17.13 21.344 14.89 22.001 12 22.001s-5.128-.657-6.691-2a3.75 3.75 0 0 1-1.305-2.844v-.907A2.25 2.25 0 0 1 6.254 14zm0 1.5h-11.5a.75.75 0 0 0-.75.75v.907c0 .656.287 1.279.784 1.706C7.545 19.945 9.44 20.501 12 20.501s4.458-.556 5.719-1.639a2.25 2.25 0 0 0 .784-1.707v-.905a.75.75 0 0 0-.75-.75M11.9 2.007 12 2a.75.75 0 0 1 .743.649l.007.101v.75h3.5a2.25 2.25 0 0 1 2.25 2.25v4.505a2.25 2.25 0 0 1-2.25 2.25h-8.5a2.25 2.25 0 0 1-2.25-2.25V5.75A2.25 2.25 0 0 1 7.75 3.5h3.5v-.75a.75.75 0 0 1 .649-.743L12 2zM16.25 5h-8.5a.75.75 0 0 0-.75.75v4.505c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75V5.75a.75.75 0 0 0-.75-.75m-6.5 1.5a1.25 1.25 0 1 1 0 2.499 1.25 1.25 0 0 1 0-2.499m4.492 0a1.25 1.25 0 1 1 0 2.499 1.25 1.25 0 0 1 0-2.499" fill="#212121"/></svg>Play With Bots</button>
      </div>
    </div>
  );
}

export default OhtelloHome;
