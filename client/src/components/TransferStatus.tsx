import React from 'react';
import { CircularProgress } from './CircularProgress';
import { Speedometer } from './Speedometer';

interface TransferStatusProps {
    fileName: string;
    percentage: number;
    speed: number;
    isReceiving: boolean;
}

export const TransferStatus: React.FC<TransferStatusProps> = ({
    fileName,
    percentage,
    speed,
    isReceiving
}) => {
    return (
        <div className="flex flex-col items-center gap-6 p-8 bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-800 shadow-2xl w-full max-w-sm">
            <h3 className="text-lg font-medium text-gray-400">
                {isReceiving ? 'Receiving...' : 'Sending...'}
            </h3>

            <div className="relative">
                <CircularProgress percentage={percentage} size={160} color={isReceiving ? 'text-white' : 'text-white'} />
            </div>

            <div className="text-center">
                <div className="text-xl font-bold text-white mb-1 truncate max-w-[250px]" title={fileName}>
                    {fileName}
                </div>
                <Speedometer speedBytesPerSecond={speed} />
            </div>
        </div>
    );
};
