import React, { useState, useRef, useCallback } from 'react';
import { useWebcam } from '../hooks/useWebcam.ts';
import { useSocket } from '../hooks/useSocket.ts';
import SignAvatar from '../components/SignAvatar.tsx';
import { Camera, CameraOff, RotateCcw, Settings, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';

interface RecognitionResult {
  sign: string;
  confidence: number;
  timestamp: string;
}

const Recognition: React.FC = () => {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [recognitionHistory, setRecognitionHistory] = useState<RecognitionResult[]>([]);
  
  const { 
    videoRef, 
    isStreaming, 
    startStream, 
    stopStream, 
    captureFrame,
    error: webcamError 
  } = useWebcam();
  
  const { socket, isConnected } = useSocket();
  const recognitionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle recognition results from socket
  React.useEffect(() => {
    if (socket) {
      socket.on('recognition_result', (data: RecognitionResult) => {
        setRecognitionResult(data);
        
        // Add to history
        setRecognitionHistory(prev => [data, ...prev.slice(0, 9)]); // Keep last 10
        
        // Text-to-speech if not muted
        if (!isMuted && data.sign !== 'UNKNOWN' && data.confidence > 0.7) {
          speakSign(data.sign);
        }
        
        toast.success(`Recognized: ${data.sign} (${Math.round(data.confidence * 100)}%)`);
      });

      socket.on('recognition_error', (error: string) => {
        toast.error(`Recognition error: ${error}`);
      });

      return () => {
        socket.off('recognition_result');
        socket.off('recognition_error');
      };
    }
  }, [socket, isMuted]);

  const startRecognition = useCallback(() => {
    if (!isStreaming) {
      toast.error('Please start camera first');
      return;
    }

    setIsRecognizing(true);
    
    // Start continuous recognition
    recognitionIntervalRef.current = setInterval(() => {
      if (videoRef.current && socket && isConnected) {
        const frame = captureFrame();
        if (frame) {
          socket.emit('recognize_sign', { image: frame });
        }
      }
    }, 1000); // Recognize every second

    toast.success('Recognition started');
  }, [isStreaming, videoRef, socket, isConnected, captureFrame]);

  const stopRecognition = useCallback(() => {
    setIsRecognizing(false);
    
    if (recognitionIntervalRef.current) {
      clearInterval(recognitionIntervalRef.current);
      recognitionIntervalRef.current = null;
    }
    
    toast.success('Recognition stopped');
  }, []);

  const speakSign = (sign: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(sign);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const clearHistory = () => {
    setRecognitionHistory([]);
    setRecognitionResult(null);
    toast.success('History cleared');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      speechSynthesis.cancel();
    }
  };

  React.useEffect(() => {
    return () => {
      if (recognitionIntervalRef.current) {
        clearInterval(recognitionIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Real-time Sign Recognition
        </h1>
        <p className="text-gray-600">
          Use your camera to recognize sign language gestures in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Camera and Recognition */}
        <div className="space-y-6">
          {/* Camera Feed */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Camera Feed</h2>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              {isStreaming ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-800">
                  <div className="text-center text-gray-400">
                    <CameraOff className="w-12 h-12 mx-auto mb-2" />
                    <p>Camera not started</p>
                  </div>
                </div>
              )}
              
              {/* Recognition Overlay */}
              {isRecognizing && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>Recognizing...</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Camera Controls */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={isStreaming ? stopStream : startStream}
                  className={`btn ${isStreaming ? 'btn-danger' : 'btn-primary'}`}
                >
                  {isStreaming ? (
                    <>
                      <CameraOff className="w-4 h-4 mr-2" />
                      Stop Camera
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Start Camera
                    </>
                  )}
                </button>
                
                <button
                  onClick={isRecognizing ? stopRecognition : startRecognition}
                  disabled={!isStreaming || !isConnected}
                  className={`btn ${isRecognizing ? 'btn-danger' : 'btn-success'} ${
                    !isStreaming || !isConnected ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isRecognizing ? 'Stop Recognition' : 'Start Recognition'}
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className={`btn btn-secondary ${isMuted ? 'bg-red-100 text-red-700' : ''}`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="btn btn-secondary"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Recognition History */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recognition History</h2>
                <button
                  onClick={clearHistory}
                  className="btn btn-secondary text-sm"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Clear
                </button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recognitionHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recognition history yet</p>
              ) : (
                recognitionHistory.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{result.sign}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {Math.round(result.confidence * 100)}%
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full"
                          style={{ width: `${result.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 3D Avatar */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">3D Avatar Demonstration</h2>
            </div>
            
            <SignAvatar
              signData={recognitionResult}
              isAnimating={isRecognizing}
              onAnimationComplete={() => {
                // Optional: Handle animation completion
              }}
            />
          </div>

          {/* Current Recognition Result */}
          {recognitionResult && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Current Recognition</h2>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {recognitionResult.sign}
                </div>
                <div className="text-lg text-gray-600 mb-4">
                  Confidence: {Math.round(recognitionResult.confidence * 100)}%
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${recognitionResult.confidence * 100}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-500">
                  Recognized at {new Date(recognitionResult.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Recognition Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recognition Interval (seconds)
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="5"
                  step="0.5"
                  defaultValue="1"
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confidence Threshold
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  defaultValue="0.7"
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="auto-speak" className="rounded" />
                <label htmlFor="auto-speak" className="text-sm text-gray-700">
                  Auto-speak recognized signs
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="btn btn-primary"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {webcamError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="font-medium">Camera Error</p>
          <p className="text-sm">{webcamError}</p>
        </div>
      )}
    </div>
  );
};

export default Recognition;
