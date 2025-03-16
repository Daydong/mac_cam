import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import gsap from "gsap";

const ThreeScene = () => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const topPartRef = useRef(null);
    const screenMeshRef = useRef(null);
    const isOpenRef = useRef(false);
    const cameraRef = useRef(null);
    const originalCameraPosition = useRef(new THREE.Vector3(0, 5, 17));
    
    // 캡쳐 기능 관련 ref들
    const canvasTextureRef = useRef(null);
    const videoRef = useRef(null);
    
    const capturesRef = useRef([]); // 캡쳐된 이미지
    const captureCountRef = useRef(0); 

    const textMeshRef = useRef(null); 
    const bubbleGroupRef = useRef(null);

    // 모델 로드 및 설정
    useEffect(() => {
        if (sceneRef.current) return;
        sceneRef.current = new THREE.Scene();

        const scene = sceneRef.current;
        const aspectRatio = window.innerWidth / window.innerHeight;
        scene.background = new THREE.Color(0xC8D9E6);


        const camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 1000);
        camera.position.copy(originalCameraPosition.current);
        cameraRef.current = camera;
        scene.add(camera);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(5, 10, 10);
        scene.add(directionalLight);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0);
        mountRef.current.appendChild(renderer.domElement);

        const loader = new GLTFLoader();

        //노트북 로딩
        loader.load("/models/laptop.glb", (gltf) => {
            const laptop = gltf.scene;
            console.log("노트북 로드됨", laptop);

            const topPart = laptop.getObjectByName("top") || laptop.children.find(child => child.name.includes("top"));
            if (topPart) {
                console.log("top찾음:", topPart);
                topPartRef.current = topPart;
            } else {
                console.error("No topPart");
            }

            const screenMesh = laptop.getObjectByName("screen") || laptop.children.find(child => child.name.includes("screen"));
            if (screenMesh) {
                screenMeshRef.current = screenMesh;
                console.log("screen 찾음:", screenMesh);
                applyCameraTexture(screenMesh); 
            } else {
                console.error("No screen");
            }

            laptop.position.set(0, 0, 0);
            laptop.scale.set(0.5, 0.5, 0.5);
            scene.add(laptop);          
        });

        
        //font
        const fontLoader = new FontLoader();
        fontLoader.load("/fonts/Dunkin Sans_Regular.json", (font) => {
          
            const textGeometry1 = new TextGeometry("Press", {
            font: font,
            depth:2,
            size: 5,
            height: 1.5,
            curveSegments: 4,
            // setting for ExtrudeGeometry
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelSegments: 2
          });

          const textGeometry2 = new TextGeometry("Space", {
            font: font,
            depth:2,
            size: 5,
            height: 1.5,
            curveSegments: 4,
            // setting for ExtrudeGeometry
            bevelEnabled: true,
            bevelThickness: 0.2,
            bevelSize: 0.1,
            bevelSegments: 2
          });



          const textMaterial = new THREE.MeshPhongMaterial({ color: 0xf5efeb });
          const textMesh1 = new THREE.Mesh(textGeometry1, textMaterial);
          const textMesh2= new THREE.Mesh(textGeometry2, textMaterial)


          let yOffset = 2;
          if (topPartRef.current) {
            const box = new THREE.Box3().setFromObject(topPartRef.current);
            const topY = box.max.y;
            yOffset = topY + 0.5; 
          }

          textMesh1.position.set(-20, yOffset+10, -20);
          textMesh2.position.set(-5, yOffset+3, -20);
    
          
          textMesh1.rotation.set(-0.5,0,0.05);
          textMesh2.rotation.set(-0.5,0,0.05);
  

          const text= new THREE.Group();
          text.add(textMesh1, textMesh2);
          //text.rotation.set(2,2,0);
          scene.add(text);
          
          //text.visible = !isOpenRef.current; 
          textMeshRef.current = text;

        });

         //하트모양 로더
         const heartModels = [];
         for (let i = 0; i < 100; i++) {  
             loader.load("/models/heart.glb", (gltf) => {
                 const heart = gltf.scene;
                 heart.scale.set(0.02, 0.02, 0.02); 
         
                 const radius = Math.random() * 10 +8; 
                 const theta = Math.random() * Math.PI * 2; 
                 const phi = Math.random() * Math.PI; 
         
                 const x = radius * Math.sin(phi) * Math.cos(theta);
                 const y = radius * Math.cos(phi);
                 const z = Math.random()*10
         
                 heart.position.set(x, y, z); 
         
                 const material = new THREE.MeshPhongMaterial({
                     color: 0xF4C2C2,
                     emissive: 0xff0000, 
                     emissiveIntensity: 10, 
                     transparent: true,
                     opacity: 1, 
                     shininess: 100, 
                 });
                 heart.traverse((child) => {
                     if (child.isMesh) child.material = material;
                 });
         
                 scene.add(heart);
                 heartModels.push(heart);
         
                 // 하트 모델 움직임
                 const moveHeart = () => {
                     const randomX = Math.random() * 5 - 2.5; 
                     const randomY = Math.random() * 5 - 2.5;  
                     const randomZ = Math.random() * 5 - 2.5; 
         
               
                     gsap.to(heart.position, {
                         x: `+=${randomX}`,
                         y: `+=${randomY}`,
                         z: `+=${randomZ}`,
                         duration: Math.random() * 5 + 3, 
                         repeat: -1, 
                         yoyo: true, 
                         ease: "power1.inOut",
                         onComplete: moveHeart, 
                     });
                 };
         
                 moveHeart(); 
             });
         }
         

        const animate = () => {
            requestAnimationFrame(animate);            

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };


        


    }, []);

    // screen 텍스처 변경, 비디오 로드 및 캡쳐 이미지 오버레이
    const applyCameraTexture = async (screenMesh) => {
        const video = document.createElement("video");
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            console.log("Camera loaded", stream);
            video.onloadedmetadata = () => video.play();
        } catch (error) {
            console.error("No Camera", error);
            return;
        }
        
        videoRef.current = video;
        
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 768;
        const ctx = canvas.getContext("2d");

        canvasTextureRef.current = canvas;

        const bgImage = new Image();
        bgImage.src = "/images/bg.png"; 
        //bgImage.onload = () => console.log("bg.png loaded");

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace; 
        texture.minFilter = THREE.LinearFilter; 
        //texture.magFilter = THREE.NearestFilter; 
        screenMesh.material = new THREE.MeshBasicMaterial({ map: texture });

        const updateTexture = () => {
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

            if (isOpenRef.current && video.readyState === video.HAVE_ENOUGH_DATA) {
                ctx.drawImage(video, 138, 80, 729, 480);
            } else {
                ctx.fillStyle = "black";
                ctx.fillRect(138, 80, 729, 480);
            }

            // 캡쳐된 이미지 오버레이
            capturesRef.current.forEach((captureCanvas, index) => {
                const posX = 182 + index * 130;
                const posY = 560;
                ctx.drawImage(captureCanvas, posX, posY,121,80);
            });

            texture.needsUpdate = true;
            requestAnimationFrame(updateTexture);
        };

        updateTexture();
    };

    // 노트북 화면상에서 클릭한 위치의 좌표 계산
    useEffect(() => {
        const mountEl = mountRef.current;
        if (!mountEl) return;
  
        const canvasEl = mountEl.querySelector("canvas");
        if (!canvasEl) return;
    
        const onClick = (event) => {
          const rect = canvasEl.getBoundingClientRect();
          // 캔버스 크기 맞춰 출력 좌표 
          const offscreenX = ((event.clientX - rect.left) / rect.width) * 1024;
          const offscreenY = ((event.clientY - rect.top) / rect.height) * 768;
          console.log("coordinates:", offscreenX, offscreenY);
    
          // 캡쳐 버튼
          if (
            offscreenX >= 482 && offscreenX <= 522 &&
            offscreenY >= 564 && offscreenY <= 594
          ) {
            console.log("!!captured!!");

            if (
              //captureCountRef.current < 5 &&
              videoRef.current &&
              videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
            ) {
              //캡쳐 크기 
              const captureCanvas = document.createElement("canvas");
              captureCanvas.width = 242;
              captureCanvas.height = 160;
              const captureCtx = captureCanvas.getContext("2d");

              captureCtx.drawImage(
                videoRef.current,
                0,
                0,
                captureCanvas.width,
                captureCanvas.height
              );


              if (capturesRef.current.length >= 5) {
          capturesRef.current.shift();
        }
        
        
        capturesRef.current.push(captureCanvas);

        captureCountRef.current = capturesRef.current.length;
        //console.log(`캡쳐된 이미지: ${captureCountRef.current}개`);
      }
    }
  };
    
        canvasEl.addEventListener("click", onClick);
        return () => {
          canvasEl.removeEventListener("click", onClick);
        };
      }, []);


    // 스페이스바 이벤트에 따른 애니메이션
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.code !== "Space") return;
            isOpenRef.current = !isOpenRef.current;
    
            gsap.to(topPartRef.current.rotation, {
                x: isOpenRef.current ? -4.3 : -2.8,
                duration: 1.5,
                ease: "power2.inOut",
            });
    
            gsap.to(cameraRef.current.position, {
                x: isOpenRef.current ? 0 : originalCameraPosition.current.x,
                y: isOpenRef.current ? 6 : originalCameraPosition.current.y,
                z: isOpenRef.current ? 7 : originalCameraPosition.current.z,
                duration: 1.5,
                ease: "power2.inOut",
            });
            if (textMeshRef.current) {
              //textMeshRef.current.visible = !isOpenRef.current;
  
              gsap.to(textMeshRef.current.children[0].position, {
                  x: isOpenRef.current ? -70 : -20, 
                  duration: 1.5,
                  ease: "power2.inOut",
              });
  
              gsap.to(textMeshRef.current.children[1].position, {
                  x: isOpenRef.current ? 50 : -5, 
                  duration: 1.5,
                  ease: "power2.inOut",
              });
          }
     
            event.stopPropagation();
            event.preventDefault();
        };
        
        document.addEventListener("keydown", onKeyDown, true);
        return () => {
            document.removeEventListener("keydown", onKeyDown, true);
        };
    }, []);

    return <div ref={mountRef} />;
};

export default ThreeScene;
