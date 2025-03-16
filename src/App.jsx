import React, { useState, useRef, useEffect } from "react";
import ThreeScene from "./components/ThreeScene";
import CameraFeed from "./components/CameraFeed";

function App() {
    const videoRef = useRef(null);
    const [videoElement, setVideoElement] = useState(null);
    const [isVideoReady, setIsVideoReady] = useState(false);

    useEffect(() => {
        const onKeyDown = (event) => {
            //console.log("키 입력:", event.code);
        };
    
        document.addEventListener("keydown", onKeyDown, true); 
    
        return () => {
            document.removeEventListener("keydown", onKeyDown, true);
        };
    }, []);

    return (
        <div>
            <CameraFeed
                onVideoReady={(video) => {
                    if (!isVideoReady && video) { 
                        videoRef.current = video;
                        setVideoElement(video);
                        setIsVideoReady(true); 
                    }
                }}
            />
            <ThreeScene video={videoElement} /> {}
        </div>
    );
}

export default App;
