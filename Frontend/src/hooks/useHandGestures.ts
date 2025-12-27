import { useEffect, useRef, useState } from "react";
import { Hands, Results } from "@mediapipe/hands";

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}


const classifyGesture = (landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return null;

    const isExtended = (tipId: number, baseId: number) => landmarks[tipId].y < landmarks[baseId].y;

    const indexExtended = isExtended(8, 6);
    const middleExtended = isExtended(12, 10);
    const ringExtended = isExtended(16, 14);
    const pinkyExtended = isExtended(20, 18);

    // Distance check for OK gesture
    const distThumbIndex = Math.sqrt(
        Math.pow(landmarks[4].x - landmarks[8].x, 2) +
        Math.pow(landmarks[4].y - landmarks[8].y, 2)
    );

    if (distThumbIndex < 0.05 && middleExtended && ringExtended && pinkyExtended) return "OK";
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) return "PEACE";
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) return "POINTING";
    if (indexExtended && !middleExtended && !ringExtended && pinkyExtended) return "ROCK";
    if (indexExtended && !middleExtended && !ringExtended && pinkyExtended && landmarks[4].y < landmarks[3].y) return "I_LOVE_YOU";
    if (landmarks[4].y < landmarks[3].y && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) return "THUMBS_UP";
    if (landmarks[4].y > landmarks[3].y && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) return "DISLIKE";
    if (indexExtended && middleExtended && ringExtended && pinkyExtended) return "OPEN_PALM";
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) return "FIST";

    return null;
};


const getBoundingBox = (landmarks: any[]): BoundingBox => {
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    landmarks.forEach(lm => {
        if (lm.x < minX) minX = lm.x;
        if (lm.x > maxX) maxX = lm.x;
        if (lm.y < minY) minY = lm.y;
        if (lm.y > maxY) maxY = lm.y;
    });
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
};

export const useHandGestures = () => {
    const [gesture, setGesture] = useState<string | null>(null);
    const [landmarks, setLandmarks] = useState<any[] | null>(null);
    const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null);
    const handsRef = useRef<Hands | null>(null);

    useEffect(() => {
        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        hands.onResults((results: Results) => {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const lms = results.multiHandLandmarks[0];
                setLandmarks(lms);
                setBoundingBox(getBoundingBox(lms));
                setGesture(classifyGesture(lms));
            } else {
                setLandmarks(null);
                setBoundingBox(null);
                setGesture(null);
            }
        });

        handsRef.current = hands;

        return () => {
            hands.close();
        };
    }, []);

    const processFrame = async (videoElement: HTMLVideoElement) => {
        if (handsRef.current) {
            await handsRef.current.send({ image: videoElement });
        }
    };

    return { gesture, landmarks, boundingBox, processFrame };
};
