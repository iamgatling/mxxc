import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import SimplePeer, { type Instance as PeerInstance, type SignalData } from 'simple-peer';
import { CHUNK_SIZE, type FileMetadata, type TransferSignal } from '../utils/fileProtocol';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export type ConnectionState = 'idle' | 'waiting' | 'connected' | 'error';

export interface TransferState {
    progress: number;
    speed: number;
    fileName: string;
    isReceiving: boolean;
    totalBytes: number;
    transferredBytes: number;
}

export const useWebRTC = (roomId: string | null) => {
    const [status, setStatus] = useState<ConnectionState>('idle');
    const [transferState, setTransferState] = useState<TransferState | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const peerRef = useRef<PeerInstance | null>(null);
    const chunksRef = useRef<ArrayBuffer[]>([]);
    const incomingInfoRef = useRef<FileMetadata | null>(null);
    const receivedBytesRef = useRef<number>(0);
    const lastBytesRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const currentBytesRef = useRef<number>(0);

    useEffect(() => {
        if (!transferState) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const duration = (now - lastTimeRef.current) / 1000;

            if (duration >= 1) {
                const currentBytes = currentBytesRef.current;
                const bytesSinceLast = currentBytes - lastBytesRef.current;
                const speed = bytesSinceLast / duration;

                setTransferState(prev => prev ? ({ ...prev, speed }) : null);

                lastBytesRef.current = currentBytes;
                lastTimeRef.current = now;
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [transferState !== null]);

    useEffect(() => {
        if (!roomId) {
            setStatus('idle');
            return;
        }

        setStatus('waiting');
        socketRef.current = io(SERVER_URL);
        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Socket connected');
            socket.emit('join-room', roomId);
        });

        const setupPeerEvents = (peer: PeerInstance) => {
            peer.on('signal', (signal) => {
                socket.emit('signal', { roomId, signal });
            });

            peer.on('connect', () => {
                setStatus('connected');
                console.log('Peer connected');
            });

            peer.on('data', (data) => {
                handleData(data);
            });

            peer.on('error', (err) => {
                console.error('Peer error:', err);
                setStatus('error');
            });

            peer.on('close', () => {
                setStatus('waiting');
                peerRef.current = null;
                setTransferState(null);
            });
        };

        socket.on('user-connected', (userId: string) => {
            console.log('User connected, initiating peer:', userId);
            if (peerRef.current) return;

            const peer = new SimplePeer({ initiator: true, trickle: false });
            setupPeerEvents(peer);
            peerRef.current = peer;
        });

        socket.on('signal', (data: { signal: SignalData; senderId: string }) => {
            if (!peerRef.current) {
                console.log('Received signal, creating receiver peer');
                const peer = new SimplePeer({ initiator: false, trickle: false });
                setupPeerEvents(peer);
                peerRef.current = peer;
            }
            peerRef.current.signal(data.signal);
        });

        return () => {
            socket.disconnect();
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
        };
    }, [roomId]);

    const handleData = (data: any) => {
        if (data.toString().includes('FILE_START')) {
            try {
                const signal: TransferSignal = JSON.parse(data.toString());
                if (signal.type === 'FILE_START') {
                    incomingInfoRef.current = signal.metadata;
                    chunksRef.current = [];
                    receivedBytesRef.current = 0;
                    lastBytesRef.current = 0;
                    lastTimeRef.current = Date.now();
                    currentBytesRef.current = 0;

                    setTransferState({
                        fileName: signal.metadata.name,
                        totalBytes: signal.metadata.size,
                        transferredBytes: 0,
                        progress: 0,
                        speed: 0,
                        isReceiving: true
                    });
                }
            } catch (e) {
                console.error("Error parsing signal", e);
            }
            return;
        }

        const chunk = data as Uint8Array;
        chunksRef.current.push(chunk.buffer.slice(0) as ArrayBuffer);
        receivedBytesRef.current += chunk.byteLength;
        currentBytesRef.current = receivedBytesRef.current;

        if (incomingInfoRef.current) {
            const progress = (receivedBytesRef.current / incomingInfoRef.current.size) * 100;

            setTransferState(prev => prev ? ({
                ...prev,
                transferredBytes: receivedBytesRef.current,
                progress
            }) : null);

            if (receivedBytesRef.current >= incomingInfoRef.current.size) {
                const blob = new Blob(chunksRef.current, { type: incomingInfoRef.current.type });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = incomingInfoRef.current.name;
                a.click();

                setTimeout(() => {
                    setTransferState(null);
                    chunksRef.current = [];
                    incomingInfoRef.current = null;
                }, 3000);
            }
        }
    };

    const sendFile = useCallback((file: File) => {
        if (!peerRef.current) return;

        const metadata: FileMetadata = {
            name: file.name,
            size: file.size,
            type: file.type
        };

        peerRef.current.send(JSON.stringify({ type: 'FILE_START', metadata }));

        setTransferState({
            fileName: file.name,
            totalBytes: file.size,
            transferredBytes: 0,
            progress: 0,
            speed: 0,
            isReceiving: false
        });

        lastBytesRef.current = 0;
        lastTimeRef.current = Date.now();
        currentBytesRef.current = 0;

        const reader = new FileReader();
        let offset = 0;

        reader.onload = (e) => {
            if (e.target?.result && peerRef.current && peerRef.current.connected) {
                const result = e.target.result;
                if (result instanceof ArrayBuffer) {
                    peerRef.current.send(result);
                    offset += result.byteLength;
                }

                currentBytesRef.current = offset;
                const progress = (offset / file.size) * 100;
                setTransferState(prev => prev ? ({
                    ...prev,
                    transferredBytes: offset,
                    progress
                }) : null);

                if (offset < file.size) {
                    readNextChunk();
                } else {
                    setTimeout(() => setTransferState(null), 3000);
                }
            }
        };

        const readNextChunk = () => {
            const slice = file.slice(offset, offset + CHUNK_SIZE);
            reader.readAsArrayBuffer(slice);
        };

        readNextChunk();

    }, []);

    return { status, transferState, sendFile };
};
