import React, { useCallback, useState } from 'react';

interface DropZoneProps {
    onFileSelect: (file: File) => void;
    disabled?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelect, disabled }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    }, [disabled, onFileSelect]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileSelect(e.target.files[0]);
        }
    }, [onFileSelect]);

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
        w-full max-w-md aspect-square rounded-2xl border-2 border-dashed
        flex flex-col items-center justify-center p-8 transition-all duration-300 cursor-pointer
        ${isDragOver
                    ? 'border-white bg-gray-900 scale-105 shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                    : 'border-gray-700 hover:border-gray-500 hover:bg-gray-900/50'
                }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
            onClick={() => !disabled && document.getElementById('file-input')?.click()}
        >
            <input
                type="file"
                id="file-input"
                className="hidden"
                onChange={handleFileInput}
                disabled={disabled}
            />

            <div className={`
        p-4 rounded-full mb-4 transition-colors
        ${isDragOver ? 'bg-white text-black' : 'bg-gray-800 text-gray-500'}
      `}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
                {isDragOver ? 'Drop it like it\'s hot!' : 'Drop File Here'}
            </h3>
            <p className="text-sm text-gray-500 text-center">
                or click to browse
            </p>
        </div>
    );
};
