export const CHUNK_SIZE = 16384;

export interface FileMetadata {
    name: string;
    size: number;
    type: string;
}

export interface ChunkData {
    type: 'FILE_CHUNK';
    chunkIndex: number;
    totalChunks: number;
    data: ArrayBuffer;
}

export type TransferSignal =
    | { type: 'FILE_START'; metadata: FileMetadata }
    | { type: 'FILE_ACK' };

export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
};
