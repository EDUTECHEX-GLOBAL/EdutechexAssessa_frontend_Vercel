import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRandom, FaPlus, FaTrash, FaEye, FaCheck, FaTimes } from 'react-icons/fa';

export default function JumbledAssessmentCreator({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [availableAssessments, setAvailableAssessments] = useState([]);
  const [selectedSources, setSelectedSources] = useState([]);
  const [questionsPerSource, setQuestionsPerSource] = useState(2);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const teacherInfo = JSON.parse(localStorage.getItem('teacherInfo'));
  const token = teacherInfo?.token;
  const headers = { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    if (step === 2) {
      fetchAvailableAssessments();
    }
  }, [difficulty, step]);

  const fetchAvailableAssessments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/sat-assessments/available-for-jumbling?difficulty=${difficulty}`,
        { headers }
      );
      setAvailableAssessments(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch assessments:', err);
      setError('Failed to load assessments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAssessmentSelection = (assessment) => {
    if (selectedSources.find(s => s._id === assessment._id)) {
      setSelectedSources(selectedSources.filter(s => s._id !== assessment._id));
    } else {
      setSelectedSources([...selectedSources, assessment]);
    }
  };

  const validateStep1 = () => {
    if (!name.trim()) {
      setError('Please enter a name for the assessment');
      return false;
    }
    if (questionsPerSource < 1 || questionsPerSource > 10) {
      setError('Questions per source must be between 1 and 10');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (selectedSources.length < 2) {
      setError('Please select at least 2 source assessments');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        generatePreview();
      }
    }
  };

  // In the generatePreview function, update the API call:
const generatePreview = async () => {
  if (selectedSources.length < 2) {
    setError('Select at least 2 assessments to jumble');
    return;
  }

  setLoading(true);
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/sat-assessments/jumble/preview`,
      {
        sourceAssessmentIds: selectedSources.map(s => s._id),
        questionsPerSource: questionsPerSource || 2
      },
      { headers }
    );
    
    setPreview(response.data);
    
    // Update questionsPerSource based on what the backend suggests
    if (response.data.questionsPerAssessment) {
      setQuestionsPerSource(response.data.questionsPerAssessment);
    }
    
    setStep(3);
    setError('');
  } catch (err) {
    setError('Failed to generate preview: ' + (err.response?.data?.message || err.message));
  } finally {
    setLoading(false);
  }
};

  const createJumbledAssessment = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/sat-assessments/jumble`,
        {
          name,
          difficulty,
          sourceAssessmentIds: selectedSources.map(s => s._id),
          questionsPerSource
        },
        { headers }
      );

      alert('✅ Jumbled assessment created successfully! It will appear in your library for review.');
      onSuccess && onSuccess(response.data.assessment);
      onClose();
    } catch (err) {
      setError('Failed to create assessment: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'very hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assessment Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="e.g., Mixed Easy Questions Set 1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Difficulty Level *
        </label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="very hard">Very Hard</option>
        </select>
        <p className="text-sm text-gray-500 mt-1">
          Questions will be combined from assessments of this difficulty level
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Questions per Source Assessment *
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={questionsPerSource}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (val >= 1 && val <= 10) setQuestionsPerSource(val);
          }}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          Number of questions to take from each selected assessment (1-10)
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Select Source Assessments 
          <span className={`ml-2 ${selectedSources.length >= 2 ? 'text-green-600' : 'text-red-600'}`}>
            ({selectedSources.length} selected)
          </span>
        </h3>
        <p className="text-sm text-gray-600">
          Choose at least 2 approved assessments. Only valid MCQ questions will be used.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : availableAssessments.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No approved {difficulty} assessments found.</p>
          <p className="text-sm text-gray-400 mt-1">Upload and approve some assessments first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2">
          {availableAssessments.map((assessment) => (
            <div
              key={assessment._id}
              onClick={() => toggleAssessmentSelection(assessment)}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedSources.find(s => s._id === assessment._id)
                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-100'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 truncate">{assessment.title}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(assessment.difficulty)}`}>
                      {assessment.difficulty}
                    </span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                      {assessment.sectionType}
                    </span>
                    {assessment.isJumbled && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                        Already Jumbled
                      </span>
                    )}
                  </div>
                </div>
                <div className={`ml-2 w-6 h-6 rounded-full flex items-center justify-center ${
                  selectedSources.find(s => s._id === assessment._id)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200'
                }`}>
                  {selectedSources.find(s => s._id === assessment._id) && <FaCheck size={12} />}
                </div>
              </div>
              
              <div className="mt-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Questions:</span>
                  <div className="flex gap-4">
                    <span>Total: {assessment.totalQuestions}</span>
                    <span className="text-purple-600 font-medium">
                      Valid: {assessment.validMCQCount}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Created: {new Date(assessment.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSources.length > 0 && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-2">Selected Assessments:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedSources.map((source, index) => (
              <div key={source._id} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-purple-200">
                <span className="text-sm text-purple-700">{source.title}</span>
                <button
                  onClick={() => toggleAssessmentSelection(source)}
                  className="text-purple-500 hover:text-purple-700"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    preview && (
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Preview Jumbled Assessment</h3>
        
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-5 rounded-xl mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Assessment Name</p>
              <p className="font-medium text-lg truncate">{name}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Difficulty</p>
              <p className="font-medium text-lg capitalize">{difficulty}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="font-medium text-lg">{preview.totalQuestions}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Sources</p>
              <p className="font-medium text-lg">{selectedSources.length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Source Breakdown:</h4>
            <div className="space-y-2">
              {preview.sources?.map((source, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-800">{source.title}</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {source.contributed} questions
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-3">Sample Questions (First 3):</h4>
            <div className="space-y-4">
              {preview.sampleQuestions?.slice(0, 3).map((q, i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-500">Question {i + 1}</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      From: {q.sourceTitle}
                    </span>
                  </div>
                  <p className="text-gray-800 mb-3">{q.questionText}</p>
                  <div className="text-sm text-gray-600">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded mr-2">
                      Correct: Option {String.fromCharCode(65 + q.correctAnswer)}
                    </span>
                    <span className="text-gray-500">Type: {q.type.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Note:</strong> This jumbled assessment will be created as a draft. 
              You'll need to review and approve it before students can access it.
            </p>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FaRandom /> Create Jumbled Assessment
              </h2>
              <p className="text-purple-200 mt-1">Combine questions from multiple assessments</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-white hover:text-gray-200 text-2xl transition-transform hover:scale-110"
              disabled={loading}
            >
              ×
            </button>
          </div>
          
          {/* Steps indicator */}
          <div className="flex mt-6">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex-1">
                <div className={`flex items-center ${stepNum < 3 ? 'flex-1' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    step === stepNum 
                      ? 'bg-white text-purple-600 ring-4 ring-purple-300' 
                      : step > stepNum 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white/30 text-white'
                  }`}>
                    {step > stepNum ? <FaCheck /> : stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`flex-1 h-1 mx-2 transition-all ${
                      step > stepNum ? 'bg-green-500' : step >= stepNum ? 'bg-white' : 'bg-white/30'
                    }`} />
                  )}
                </div>
                <div className="text-xs mt-2 text-center font-medium">
                  {['Setup', 'Select Sources', 'Preview'][stepNum - 1]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaTimes className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              {step > 1 && (
                <button
                  onClick={() => {
                    setStep(step - 1);
                    setError('');
                  }}
                  disabled={loading}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Back
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={loading || (step === 2 && selectedSources.length < 2)}
                  className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
                    step === 2 && selectedSources.length < 2
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Loading...
                    </>
                  ) : step === 1 ? (
                    'Next: Select Sources'
                  ) : (
                    'Preview Assessment'
                  )}
                </button>
              ) : (
                <button
                  onClick={createJumbledAssessment}
                  disabled={loading}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaPlus /> Create Jumbled Assessment
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}