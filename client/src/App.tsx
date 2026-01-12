import { useState } from 'react';
import { useWebRTC } from './hooks/useWebRTC';
import { DropZone } from './components/DropZone';
import { TransferStatus } from './components/TransferStatus';

function App() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [inputRoomId, setInputRoomId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (window.location.hash === '#og') {
    return (
      <div className="w-[1200px] h-[630px] bg-black text-white flex flex-col items-center justify-center p-20 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gray-800 rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-gray-800 rounded-full blur-[100px] opacity-20"></div>

        <div className="z-10 text-center space-y-6">
          <h1 className="text-9xl font-bold tracking-tighter">MXXC</h1>
          <p className="text-4xl text-gray-400 font-light tracking-wide">Share Fast. P2P File Transfer.</p>
        </div>

        <div className="absolute bottom-12 text-gray-500 font-mono">
          mxxc.vercel.com
        </div>
      </div>
    );
  }

  const { status, transferState, sendFile } = useWebRTC(roomId);

  const createRoom = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(id);
  };

  const joinRoom = () => {
    if (inputRoomId.length === 6) setRoomId(inputRoomId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setInputRoomId(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputRoomId.length === 6) {
      joinRoom();
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleSendFile = () => {
    if (selectedFile) sendFile(selectedFile);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 selection:bg-white/30">

      <div className={`absolute top-8 left-0 right-0 flex flex-col z-10 ${roomId ? 'items-start px-8' : 'items-center'}`}>
        <h1 className="text-2xl font-bold text-white opacity-80 mb-4">
          MXXC
        </h1>
        {status === 'error' && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-2 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-4 fade-in duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Connection lost. Please try reloading or creating a new room.</span>
          </div>
        )}
      </div>

      {roomId ? (
        <div className="flex flex-col items-center gap-8 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">

          <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Room Code</span>
              <span className="text-xl font-mono font-bold text-white tracking-widest">{roomId}</span>
            </div>
            <div className="h-6 w-px bg-gray-800" />
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${status === 'connected' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' :
                status === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                }`} />
              <span className="text-sm font-medium text-gray-300">
                {status === 'waiting' ? 'Waiting for Peer...' : status === 'connected' ? 'Connected' : status.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => setRoomId(null)}
              className="ml-2 p-1.5 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition"
              title="Leave Room"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="w-full flex justify-center min-h-[400px] items-center px-4 md:px-0">
            {transferState ? (
              <TransferStatus
                fileName={transferState.fileName}
                percentage={transferState.progress}
                speed={transferState.speed}
                isReceiving={transferState.isReceiving}
              />
            ) : (
              <div className="flex flex-col gap-6 items-center w-full max-w-md">
                {!selectedFile ? (
                  <DropZone
                    onFileSelect={handleFileSelect}
                    disabled={status !== 'connected'}
                  />
                ) : (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full flex flex-col gap-4 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/10 p-3 rounded-lg text-white">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-medium text-white truncate" title={selectedFile.name}>{selectedFile.name}</h3>
                        <p className="text-sm text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="flex-1 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300 transition font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendFile}
                        className="flex-1 py-2 rounded-lg bg-white hover:bg-gray-200 text-black shadow-lg shadow-white/10 transition font-medium"
                      >
                        Send File
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center gap-10 w-full max-w-lg text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white pb-2">
              Share Fast.
            </h1>
            <p className="text-xl text-gray-400 font-light max-w-md mx-auto leading-relaxed">
              Peer-to-peer file transfer. No servers. No limits. Just you and your data.
            </p>
          </div>

          <div className="w-full bg-gray-900/50 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-gray-800 shadow-2xl space-y-6">
            <button
              onClick={createRoom}
              className="w-full py-4 bg-white hover:bg-gray-200 rounded-xl text-lg font-bold text-black transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
            >
              Start Sending
            </button>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
              <span className="relative bg-black px-4 text-sm text-gray-500 font-medium">or join existing</span>
            </div>

            <div className="flex gap-2 group">
              <input
  value={inputRoomId}
  onChange={handleInputChange}
  onKeyDown={handleKeyDown}
  placeholder="Enter Room Code"
  className="grow min-w-0 px-6 py-4 rounded-xl bg-gray-900 border border-gray-800 focus:border-white focus:ring-1 focus:ring-white outline-none transition font-mono text-center text-lg text-white placeholder:text-sm placeholder:text-gray-600"
/>
              <button
                onClick={joinRoom}
                disabled={inputRoomId.length !== 6}
                className="px-6 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
