import React from 'react';

interface SpeedometerProps {
    speedBytesPerSecond: number;
}

export const Speedometer: React.FC<SpeedometerProps> = ({ speedBytesPerSecond }) => {
    const formatSpeed = (bytes: number) => {
        if (bytes === 0) return '0.0 MB/s';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)} MB/s`;
    };

    return (
        <div className="flex flex-col items-center">
            <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Speed</div>
            <div className="text-xl font-mono text-gray-300 font-bold">
                {formatSpeed(speedBytesPerSecond)}
            </div>
        </div>
    );
};
