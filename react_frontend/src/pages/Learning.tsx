import React from 'react';
import { BookOpen, Play, CheckCircle, Clock, Star } from 'lucide-react';

const Learning: React.FC = () => {
  const modules = [
    {
      id: 1,
      title: 'ASL Alphabet Basics',
      description: 'Learn the basic alphabet in American Sign Language',
      duration: '30 min',
      difficulty: 'Beginner',
      progress: 75,
      lessons: 12,
      completed: 9,
    },
    {
      id: 2,
      title: 'Common Greetings',
      description: 'Essential greeting signs for daily communication',
      duration: '20 min',
      difficulty: 'Beginner',
      progress: 100,
      lessons: 8,
      completed: 8,
    },
    {
      id: 3,
      title: 'Family Signs',
      description: 'Learn to sign family member names and relationships',
      duration: '25 min',
      difficulty: 'Intermediate',
      progress: 40,
      lessons: 10,
      completed: 4,
    },
    {
      id: 4,
      title: 'Numbers and Counting',
      description: 'Master numbers from 1 to 100 in sign language',
      duration: '35 min',
      difficulty: 'Intermediate',
      progress: 0,
      lessons: 15,
      completed: 0,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Learning Modules
        </h1>
        <p className="text-gray-600">
          Interactive lessons designed to help you master sign language
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div key={module.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">{module.difficulty}</span>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {module.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {module.description}
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{module.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>{module.completed}/{module.lessons} lessons</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{module.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${module.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <button
                className={`w-full btn ${
                  module.progress === 100 
                    ? 'btn-success' 
                    : module.progress > 0 
                    ? 'btn-primary' 
                    : 'btn-secondary'
                }`}
              >
                {module.progress === 100 ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed
                  </>
                ) : module.progress > 0 ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Continue Learning
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Learning
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Learning;
