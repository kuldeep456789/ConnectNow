declare module 'simple-peer' {
    import { Instance } from 'simple-peer';

    export interface SignalData {
        type: 'offer' | 'answer' | 'pranswer' | 'transceiverRequest' | 'renegotiate';
        sdp?: string;
        candidate?: any;
    }

    export interface Options {
        initiator?: boolean;
        channelConfig?: any;
        channelName?: string;
        config?: any;
        offerOptions?: any;
        answerOptions?: any;
        sdpTransform?: (sdp: any) => any;
        stream?: MediaStream;
        streams?: MediaStream[];
        trickle?: boolean;
        allowHalfTrickle?: boolean;
        wrtc?: any;
        objectMode?: boolean;
    }

    export interface Instance extends NodeJS.WritableStream, NodeJS.ReadableStream {
        signal(data: string | SignalData): void;
        destroy(err?: Error): void;
        _debug(msg: string): void;
        on(event: 'signal', cb: (data: SignalData) => void): void;
        on(event: 'stream', cb: (stream: MediaStream) => void): void;
        on(event: 'connect', cb: () => void): void;
        on(event: 'close', cb: () => void): void;
        on(event: 'error', cb: (err: Error) => void): void;
        on(event: 'data', cb: (data: any) => void): void;
        on(event: 'track', cb: (track: MediaStreamTrack, stream: MediaStream) => void): void;
    }

    const Peer: {
        (options?: Options): Instance;
        new(options?: Options): Instance;
        prototype: Instance;
        WEBRTC_SUPPORT: boolean;
    };

    export default Peer;
}
阻
