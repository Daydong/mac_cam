import React, { useEffect, useRef } from "react";

const CameraFeed = ({ onVideoReady }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    onVideoReady(videoRef.current);
                }
            } catch (error) {
                console.error("카메라 접근 실패:", error);
            }
        }
        startCamera();
    }, []);

    return <video ref={videoRef} autoPlay playsInline style={{ display: "none" }} />;
};

export default CameraFeed;
