import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { goalsAPI } from '../services/api';
import { Plus, Edit2, Trash2, TrendingUp, Play } from 'lucide-react';

const Goals = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dailyTargetMinutes: 60
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await goalsAPI.getAll();
      setGoals(response.data);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await goalsAPI.update(editingGoal._id, formData);
      } else {
        await goalsAPI.create(formData);
      }
      setShowModal(false);
      setEditingGoal(null);
      setFormData({ name: '', description: '', dailyTargetMinutes: 60 });
      fetchGoals();
    } catch (error) {
      console.error('Failed to save goal:', error);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      description: goal.description || '',
      dailyTargetMinutes: goal.dailyTargetMinutes
    });
    setShowModal(true);
  };

  const handleDelete = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalsAPI.delete(goalId);
        fetchGoals();
      } catch (error) {
        console.error('Failed to delete goal:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Goals</h1>
            <p className="text-gray-600 mt-2">Create and manage your focus goals</p>
          </div>
          <button
            onClick={() => {
              setEditingGoal(null);
              setFormData({ name: '', description: '', dailyTargetMinutes: 60 });
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-6">Create your first goal to start tracking your progress</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <div key={goal._id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{goal.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {goal.description && (
                    <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Daily Target:</span>
                      <span className="font-semibold text-gray-900">{goal.dailyTargetMinutes} minutes</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Current Streak:</span>
                      <span className="font-bold text-green-600 text-lg">{goal.currentStreak} days</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Longest Streak:</span>
                      <span className="font-semibold text-blue-600">{goal.longestStreak} days</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Sessions:</span>
                      <span className="font-semibold text-gray-900">{goal.totalSessionsCompleted}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Time:</span>
                      <span className="font-semibold text-gray-900">
                        {Math.floor(goal.totalMinutesCompleted / 60)}h {goal.totalMinutesCompleted % 60}m
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/timer/${goal._id}`)}
                    className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Learn Spanish"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Target (minutes) *
                  </label>
                  <input
                    type="number"
                    value={formData.dailyTargetMinutes}
                    onChange={(e) => setFormData({ ...formData, dailyTargetMinutes: parseInt(e.target.value) })}
                    required
                    min={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingGoal(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {editingGoal ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
