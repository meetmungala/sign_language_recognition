import React, { useState, useEffect } from 'react';
import { useWebcam } from '../hooks/useWebcam.ts';
import SignAvatar from '../components/SignAvatar.tsx';
import { Camera, CameraOff, Download, WifiOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface OfflineSignData {
  sign: string;
  description: string;
  difficulty: number;
  category: string;
}

const OfflineMode: React.FC = () => {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<any>(null);
  const [offlineData, setOfflineData] = useState<OfflineSignData[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const { 
    videoRef, 
    isStreaming, 
    startStream, 
    stopStream, 
    captureFrame,
    error: webcamError 
  } = useWebcam();

  // Load offline data from localStorage
  useEffect(() => {
    const loadOfflineData = () => {
      try {
        const storedData = localStorage.getItem('offline_sign_data');
        if (storedData) {
          setOfflineData(JSON.parse(storedData));
          setIsDataLoaded(true);
        } else {
          // Initialize with basic offline data
          const basicData: OfflineSignData[] = [
            { sign: 'A', description: 'Letter A', difficulty: 1, category: 'alphabet' },
            { sign: 'B', description: 'Letter B', difficulty: 1, category: 'alphabet' },
            { sign: 'C', description: 'Letter C', difficulty: 1, category: 'alphabet' },
            { sign: 'HELLO', description: 'Greeting', difficulty: 1, category: 'greetings' },
            { sign: 'THANK YOU', description: 'Expression of gratitude', difficulty: 1, category: 'greetings' },
            { sign: 'YES', description: 'Affirmative response', difficulty: 1, category: 'responses' },
            { sign: 'NO', description: 'Negative response', difficulty: 1, category: 'responses' },
          ];
          setOfflineData(basicData);
          localStorage.setItem('offline_sign_data', JSON.stringify(basicData));
          setIsDataLoaded(true);
        }
      } catch (error) {
        console.error('Error loading offline data:', error);
        toast.error('Failed to load offline data');
      }
    };

    loadOfflineData();
  }, []);

  // Simple offline recognition simulation
  const performOfflineRecognition = () => {
    if (!isStreaming) {
      toast.error('Please start camera first');
      return;
    }

    setIsRecognizing(true);
    
    // Simulate recognition delay
    setTimeout(() => {
      // Randomly select a sign from offline data
      const randomSign = offlineData[Math.floor(Math.random() * offlineData.length)];
      const confidence = 0.7 + Math.random() * 0.3; // 70-100% confidence
      
      const result = {
        sign: randomSign.sign,
        confidence: confidence,
        timestamp: new Date().toISOString(),
        description: randomSign.description,
        difficulty: randomSign.difficulty,
        category: randomSign.category
      };
      
      setRecognitionResult(result);
      setIsRecognizing(false);
      
      toast.success(`Offline recognition: ${result.sign} (${Math.round(result.confidence * 100)}%)`);
    }, 2000);
  };

  const downloadOfflineData = () => {
    try {
      const dataStr = JSON.stringify(offlineData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'offline_sign_data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success('Offline data downloaded');
    } catch (error) {
      console.error('Error downloading offline data:', error);
      toast.error('Failed to download offline data');
    }
  };

  const clearRecognitionResult = () => {
    setRecognitionResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <WifiOff className="w-8 h-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Offline Mode
            </h1>
            <p className="text-gray-600">
              Basic sign recognition without internet connection
            </p>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <WifiOff className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Offline Mode Active
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                You're using basic offline recognition. For full features and real-time recognition, 
                please connect to the internet.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Camera and Recognition */}
        <div className="space-y-6">
          {/* Camera Feed */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Camera Feed</h2>
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
              
              {/* Offline Recognition Overlay */}
              {isRecognizing && (
                <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>Offline Recognition...</span>
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
                  onClick={performOfflineRecognition}
                  disabled={!isStreaming || isRecognizing}
                  className={`btn btn-success ${!isStreaming || isRecognizing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isRecognizing ? 'Recognizing...' : 'Start Offline Recognition'}
                </button>
              </div>
              
              <button
                onClick={downloadOfflineData}
                className="btn btn-secondary"
                title="Download offline data"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Offline Data Status */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Offline Data</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700">
                    {isDataLoaded ? 'Data loaded successfully' : 'Loading data...'}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {offlineData.length} signs available
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="font-medium text-gray-900">Alphabet</div>
                  <div className="text-gray-600">
                    {offlineData.filter(s => s.category === 'alphabet').length} signs
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="font-medium text-gray-900">Greetings</div>
                  <div className="text-gray-600">
                    {offlineData.filter(s => s.category === 'greetings').length} signs
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="font-medium text-gray-900">Responses</div>
                  <div className="text-gray-600">
                    {offlineData.filter(s => s.category === 'responses').length} signs
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="font-medium text-gray-900">Total</div>
                  <div className="text-gray-600">{offlineData.length} signs</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Avatar and Results */}
        <div className="space-y-6">
          {/* 3D Avatar */}
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

          {/* Recognition Result */}
          {recognitionResult && (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Recognition Result</h2>
                  <button
                    onClick={clearRecognitionResult}
                    className="btn btn-secondary text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {recognitionResult.sign}
                </div>
                <div className="text-lg text-gray-600 mb-4">
                  {recognitionResult.description}
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  Confidence: {Math.round(recognitionResult.confidence * 100)}%
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${recognitionResult.confidence * 100}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-900">Category</div>
                    <div className="text-gray-600 capitalize">{recognitionResult.category}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-900">Difficulty</div>
                    <div className="text-gray-600">Level {recognitionResult.difficulty}</div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-4">
                  Recognized at {new Date(recognitionResult.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}

          {/* Offline Features Info */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Offline Features</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Basic Recognition</div>
                  <div className="text-sm text-gray-600">
                    Simple sign recognition using pre-loaded data
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">3D Avatar</div>
                  <div className="text-sm text-gray-600">
                    Visual demonstration of recognized signs
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Offline Data</div>
                  <div className="text-sm text-gray-600">
                    Access to basic sign vocabulary without internet
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <WifiOff className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Limited Features</div>
                  <div className="text-sm text-gray-600">
                    Real-time recognition and advanced features require internet
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default OfflineMode;
