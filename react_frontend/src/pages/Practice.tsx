import React from 'react';
import { Target, Clock, Award, TrendingUp } from 'lucide-react';

const Practice: React.FC = () => {
  const tests = [
    {
      id: 1,
      title: 'ASL Alphabet Recognition',
      description: 'Test your knowledge of ASL alphabet signs',
      questions: 26,
      duration: '10 min',
      difficulty: 'Beginner',
      score: 85,
      attempts: 3,
    },
    {
      id: 2,
      title: 'Greeting Signs Quiz',
      description: 'Practice common greeting signs',
      questions: 15,
      duration: '8 min',
      difficulty: 'Beginner',
      score: 92,
      attempts: 2,
    },
    {
      id: 3,
      title: 'Family Signs Challenge',
      description: 'Advanced family relationship signs',
      questions: 20,
      duration: '12 min',
      difficulty: 'Intermediate',
      score: null,
      attempts: 0,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Practice Tests
        </h1>
        <p className="text-gray-600">
          Test your sign language skills with interactive quizzes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div key={test.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">{test.difficulty}</div>
                {test.score && (
                  <div className="text-lg font-bold text-green-600">{test.score}%</div>
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {test.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {test.description}
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>{test.questions} questions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{test.duration}</span>
                </div>
              </div>
              
              {test.score && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Best Score</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-green-600">{test.score}%</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Attempts</span>
                <span className="font-medium">{test.attempts}</span>
              </div>
              
              <button
                className={`w-full btn ${
                  test.score 
                    ? 'btn-primary' 
                    : 'btn-success'
                }`}
              >
                {test.score ? (
                  <>
                    <Award className="w-4 h-4 mr-2" />
                    Retake Test
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Start Test
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

export default Practice;
