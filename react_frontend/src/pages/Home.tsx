import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, BookOpen, Target, Users, WifiOff, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Sign Language Recognition Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Empowering communication through AI-powered sign language recognition, 
          3D avatar animations, and interactive learning experiences for disabled persons.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="btn btn-primary text-lg px-8 py-3"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <Link
            to="/offline"
            className="btn btn-secondary text-lg px-8 py-3"
          >
            <WifiOff className="w-5 h-5 mr-2" />
            Try Offline Mode
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="card text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Real-time Recognition</h3>
          <p className="text-gray-600">
            Advanced AI-powered sign language recognition using computer vision and machine learning.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Interactive Learning</h3>
          <p className="text-gray-600">
            Comprehensive learning modules with practice tests designed for disabled persons.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">3D Avatar Animations</h3>
          <p className="text-gray-600">
            Immersive 3D avatar demonstrations using Three.js for visual learning.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Accessibility First</h3>
          <p className="text-gray-600">
            Designed with accessibility in mind, supporting multiple sign languages and devices.
          </p>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="card mb-16">
        <div className="card-header">
          <h2 className="text-2xl font-semibold text-center">Powered by Advanced Technology</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">AI & Machine Learning</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>TensorFlow & PyTorch</div>
              <div>MediaPipe & OpenPose</div>
              <div>Computer Vision</div>
              <div>Gesture Recognition</div>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">3D Graphics</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>Three.js</div>
              <div>React Three Fiber</div>
              <div>Blender Models</div>
              <div>Real-time Animation</div>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Multi-platform</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>React.js Frontend</div>
              <div>Flask & PHP Backend</div>
              <div>MySQL Database</div>
              <div>Mobile Responsive</div>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Languages */}
      <div className="card mb-16">
        <div className="card-header">
          <h2 className="text-2xl font-semibold text-center">Multi-language Support</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">ASL</div>
            <div className="text-sm text-gray-600">American Sign Language</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">ISL</div>
            <div className="text-sm text-gray-600">Indian Sign Language</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">CSL</div>
            <div className="text-sm text-gray-600">Chinese Sign Language</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-2">WLASL</div>
            <div className="text-sm text-gray-600">Word-level ASL</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-12 bg-gray-900 text-white rounded-2xl">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Start Learning?
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of users who are improving their sign language skills 
          with our innovative platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="btn bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-3"
          >
            Create Free Account
          </Link>
          <Link
            to="/login"
            className="btn border-2 border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-3"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
