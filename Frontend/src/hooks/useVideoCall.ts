import { useEffect, useRef, useState } from "react";
import Peer, { SignalData } from "simple-peer";
import { socketService } from "../services/socket";

export interface VideoCallState {
    isCalling: boolean;
    isReceivingCall: boolean;
    callAccepted: boolean;
    callEnded: boolean;
}

export const useVideoCall = (room: string) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [callState, setCallState] = useState<VideoCallState>({
        isCalling: false,
        isReceivingCall: false,
        callAccepted: false,
        callEnded: false,
    });

    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<any>(null);
    const socket = socketService.getSocket();

    useEffect(() => {

        socket.emit("join-room", { room });

        socket.on("signal", (data: { signal: SignalData; from: string }) => {
            if (data.signal.type === "offer") {
                setCallState(prev => ({ ...prev, isReceivingCall: true }));
            }

            if (connectionRef.current) {
                connectionRef.current.signal(data.signal);
            }
        });

        socket.on("call-ended", () => {
            leaveCall();
        });

        return () => {
            socket.off("signal");
            socket.off("call-ended");
            leaveCall();
        };
    }, [room]);

    const startCall = async () => {
        const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;

        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: currentStream,
        });

        peer.on("signal", (data: any) => {
            socket.emit("signal", { signal: data, room });
        });

        peer.on("stream", (remoteStream: any) => {
            setRemoteStream(remoteStream);
            if (userVideo.current) userVideo.current.srcObject = remoteStream;
        });

        connectionRef.current = peer;
        setCallState(prev => ({ ...prev, isCalling: true }));
    };

    const answerCall = async (incomingSignal: SignalData) => {
        const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;

        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: currentStream,
        });

        peer.on("signal", (data: any) => {
            socket.emit("signal", { signal: data, room });
        });

        peer.on("stream", (remoteStream: any) => {
            setRemoteStream(remoteStream);
            if (userVideo.current) userVideo.current.srcObject = remoteStream;
        });

        peer.signal(incomingSignal);
        connectionRef.current = peer;
        setCallState(prev => ({ ...prev, callAccepted: true, isReceivingCall: false }));
    };

    const leaveCall = () => {
        setCallState({
            isCalling: false,
            isReceivingCall: false,
            callAccepted: false,
            callEnded: true,
        });

        socket.emit("signal", { signal: { type: "call-ended" }, room });

        if (connectionRef.current) {
            connectionRef.current.destroy();
        }

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    return {
        stream,
        remoteStream,
        callState,
        myVideo,
        userVideo,
        startCall,
        answerCall,
        leaveCall
    };
};
