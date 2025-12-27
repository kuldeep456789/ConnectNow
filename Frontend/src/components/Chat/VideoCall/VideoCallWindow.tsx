import React, { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import {
    VideoGrid,
    VideoWrapper,
    Video,
    Label,
    GestureOverlay,
    Controls,
    ControlButton,
    RobotGuide
} from "./Style";
import { LuPhoneOff, LuMic, LuVideo, LuMove, LuBot } from "react-icons/lu";
import { useVideoCall } from "../../../hooks/useVideoCall";
import { useHandGestures } from "../../../hooks/useHandGestures";
import { socketService } from "../../../services/socket";
import api from "../../../services/api";
import toast from "react-hot-toast";

interface VideoCallWindowProps {
    room: string;
    onClose: () => void;
}

export const VideoCallWindow: React.FC<VideoCallWindowProps> = ({ room, onClose }) => {
    const {
        myVideo,
        userVideo,
        startCall,
        leaveCall
    } = useVideoCall(room);

    const { gesture, landmarks, boundingBox, processFrame } = useHandGestures();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const socket = socketService.getSocket();
    const lastGestureRef = useRef<string | null>(null);
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        startCall();
        return () => leaveCall();
    }, [room]);

    useEffect(() => {
        const handleRemoteGesture = (data: { action: string; content: string }) => {
            toast(`Remote Action: ${data.content}`, {
                icon: '👤',
                style: { borderRadius: '10px', background: '#333', color: '#fff' }
            });
        };

        socket.on("gesture-action", handleRemoteGesture);
        return () => {
            socket.off("gesture-action", handleRemoteGesture);
        };
    }, [room]);


    useEffect(() => {
        let animationFrameId: number;
        const loop = async () => {
            if (myVideo.current && myVideo.current.readyState === 4) {
                await processFrame(myVideo.current);
                drawTracking();
            }
            animationFrameId = requestAnimationFrame(loop);
        };
        loop();
        return () => cancelAnimationFrame(animationFrameId);
    }, [landmarks, boundingBox]);


    useEffect(() => {
        if (gesture && gesture !== lastGestureRef.current) {
            handleGestureAction(gesture);
            lastGestureRef.current = gesture;
        }
    }, [gesture]);

    // This function is likely intended for use within useHandGestures.ts
    // but is placed here as per the provided snippet's implied location.
    const drawTracking = () => {
        const canvas = canvasRef.current;
        const video = myVideo.current;
        if (!canvas || !video || !landmarks || landmarks.length === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);


        if (boundingBox) {
            ctx.strokeStyle = "#646cff";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.rect(
                boundingBox.x * canvas.width,
                boundingBox.y * canvas.height,
                boundingBox.width * canvas.width,
                boundingBox.height * canvas.height
            );
            ctx.stroke();


            ctx.fillStyle = "#646cff";
            ctx.font = "bold 14px Arial";
            ctx.fillText(
                gesture || "HAND",
                boundingBox.x * canvas.width,
                boundingBox.y * canvas.height - 5
            );
        }


        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        landmarks.forEach(lm => {
            ctx.beginPath();
            ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 3, 0, 2 * Math.PI);
            ctx.fill();
        });


        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [5, 9], [9, 10], [10, 11], [11, 12],
            [9, 13], [13, 14], [14, 15], [15, 16],
            [13, 17], [17, 18], [18, 19], [19, 20],
            [0, 17]
        ];
        ctx.beginPath();
        connections.forEach(([s, e]) => {
            ctx.moveTo(landmarks[s].x * canvas.width, landmarks[s].y * canvas.height);
            ctx.lineTo(landmarks[e].x * canvas.width, landmarks[e].y * canvas.height);
        });
        ctx.stroke();
    };

    const handleGestureAction = async (gestureName: string) => {
        let actionLabel = "";
        let content = "";

        switch (gestureName) {
            case "THUMBS_UP":
                actionLabel = "Sending Great! 👍";
                content = "Great! 👍";
                break;
            case "DISLIKE":
                actionLabel = "No... 👎";
                content = "No... 👎";
                break;
            case "PEACE":
                actionLabel = "Sending ❤️";
                content = "❤️";
                break;
            case "OPEN_PALM":
                actionLabel = "Hand Raised 🖐️";
                content = "Raised hand 🖐️";
                break;
            case "OK":
                actionLabel = "Got it! 👌";
                content = "Got it! 👌";
                break;
            case "POINTING":
                actionLabel = "Look there! 👆";
                content = "Look there! 👆";
                break;
            case "ROCK":
                actionLabel = "Rock on! 🤘";
                content = "Rock on! 🤘";
                break;
            case "I_LOVE_YOU":
                actionLabel = "Love you too! 🤟";
                content = "Love you! 🤟";
                break;
            default:
                return;
        }

        if (content) {
            try {
                await api.post("/messages", {
                    conversationId: room,
                    content: content,
                    type: "text"
                });
                socket.emit("gesture-action", { action: "message", content, room });
                toast(actionLabel, { icon: '🤖' });
            } catch (error) {
                console.error("Failed to send gesture message:", error);
            }
        }
    };

    return (
        <Rnd
            default={{
                x: window.innerWidth - 820,
                y: 20,
                width: 800,
                height: 600,
            }}
            minWidth={400}
            minHeight={300}
            bounds="window"
            dragHandleClassName="drag-handle"
            style={{
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                background: "rgba(0, 0, 0, 0.9)",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.1)"
            }}
        >
            <div className="drag-handle" style={{
                height: "40px",
                background: "#121212",
                display: "flex",
                alignItems: "center",
                padding: "0 15px",
                cursor: "move",
                justifyContent: "space-between"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "white", fontSize: "0.9rem" }}>
                    <LuMove /> AI Video Call
                </div>
                <div style={{ color: "#666", fontSize: "0.8rem" }}>Drag header to move | Edge to resize</div>
            </div>

            <VideoGrid style={{ padding: "20px", flex: 1, gridTemplateColumns: "1fr 1fr" }}>
                <VideoWrapper style={{ height: "100%" }}>
                    <Video ref={myVideo} autoPlay muted playsInline />
                    <canvas
                        ref={canvasRef}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            pointerEvents: "none",
                            transform: "scaleX(-1)"
                        }}
                    />
                    <Label>AI Tracker Active</Label>
                    {gesture && <GestureOverlay>{gesture}</GestureOverlay>}
                </VideoWrapper>

                <VideoWrapper style={{ height: "100%" }}>
                    <Video ref={userVideo} autoPlay playsInline />
                    <Label>Remote</Label>
                </VideoWrapper>

                {showGuide && (
                    <RobotGuide>
                        <h4>🤖 Robot Assistant Guide</h4>
                        <div className="guide-item"><span>👍</span> Thumbs Up: <b>"Great!"</b> | <span>👎</span> Down: <b>"No"</b></div>
                        <div className="guide-item"><span>✌️</span> Peace: <b>"❤️"</b> | <span>👌</span> OK: <b>"Got it!"</b></div>
                        <div className="guide-item"><span>👆</span> Point: <b>"Look!"</b> | <span>🤘</span> Rock: <b>"🤘"</b></div>
                        <div className="guide-item"><span>🤟</span> ILY: <b>"Love you!"</b> | <span>🖐️</span> Palm: <b>Raise Hand</b></div>
                        <p className="hint">The Robot is watching your hand to help you chat!</p>
                    </RobotGuide>
                )}
            </VideoGrid>

            <Controls>
                <ControlButton
                    color={showGuide ? "rgba(100, 108, 255, 0.5)" : "#3d3d3d"}
                    onClick={() => setShowGuide(!showGuide)}
                    title="Robot Assistant Guide"
                >
                    <LuBot />
                </ControlButton>
                <ControlButton color="#3d3d3d" title="Toggle Mic"><LuMic /></ControlButton>
                <ControlButton color="#3d3d3d" title="Toggle Video"><LuVideo /></ControlButton>
                <ControlButton color="#ff4d4d" onClick={onClose} title="End Call"><LuPhoneOff /></ControlButton>
            </Controls>
        </Rnd>
    );
};
