import { useEffect, useRef, useState } from "react";
import { Hands, Results } from "@mediapipe/hands";

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Gesture classification logic
const classifyGesture = (landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return null;

    const thumbTip = landmarks[4];
    const isExtended = (tip: any, pip: any) => tip.y < pip.y;

    const indexExtended = isExtended(landmarks[8], landmarks[6]);
    const middleExtended = isExtended(landmarks[12], landmarks[10]);
    const ringExtended = isExtended(landmarks[16], landmarks[14]);
    const pinkyExtended = isExtended(landmarks[20], landmarks[18]);

    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) return "PEACE";
    if (thumbTip.y < landmarks[3].y && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) return "THUMBS_UP";
    if (indexExtended && middleExtended && ringExtended && pinkyExtended) return "OPEN_PALM";
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) return "FIST";

    return null;
};

// Calculate bounding box from landmarks
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
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
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
