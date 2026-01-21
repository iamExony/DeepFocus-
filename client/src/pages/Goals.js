import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { goalsAPI } from '../services/api';
import { Plus, Edit2, Trash2, TrendingUp, Play, X } from 'lucide-react';

const Goals = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dailyTargetMinutes: 60,
    category: 'other'
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
      setFormData({ name: '', description: '', dailyTargetMinutes: 60, category: 'other' });
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
      dailyTargetMinutes: goal.dailyTargetMinutes,
      category: goal.category || 'other'
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

  const categoryLabels = {
    work: { label: 'Work', color: 'bg-blue-50 text-blue-700' },
    learning: { label: 'Learning', color: 'bg-purple-50 text-purple-700' },
    fitness: { label: 'Fitness', color: 'bg-green-50 text-green-700' },
    personal: { label: 'Personal', color: 'bg-amber-50 text-amber-700' },
    other: { label: 'Other', color: 'bg-slate-100 text-slate-600' }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Goals</h1>
            <p className="text-slate-500 mt-1">Manage your focus goals</p>
          </div>
          <button
            onClick={() => {
              setEditingGoal(null);
              setFormData({ name: '', description: '', dailyTargetMinutes: 60, category: 'other' });
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </button>
        </div>

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No goals yet</h3>
            <p className="text-slate-500 mb-6">Create your first goal to start tracking your focus sessions</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Create Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <div
                key={goal._id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{goal.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${categoryLabels[goal.category || 'other'].color}`}>
                      {categoryLabels[goal.category || 'other'].label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{goal.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Daily Target</span>
                    <span className="font-medium text-slate-900">{goal.dailyTargetMinutes} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Current Streak</span>
                    <span className="font-semibold text-green-600">{goal.currentStreak} days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Best Streak</span>
                    <span className="font-medium text-blue-600">{goal.longestStreak} days</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/timer/${goal._id}`)}
                  className="w-full flex items-center justify-center py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Session
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingGoal ? 'Edit Goal' : 'New Goal'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Goal Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Learn React"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="work">Work</option>
                    <option value="learning">Learning</option>
                    <option value="fitness">Fitness</option>
                    <option value="personal">Personal</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Daily Target (minutes)
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-medium transition"
                      onClick={() => {
                        const current = formData.dailyTargetMinutes;
                        let next;
                        if (current > 50) {
                          next = current - 15;
                          if (next < 50) next = 50;
                        } else {
                          next = current - 5;
                          if (next < 10) next = 10;
                        }
                        setFormData({ ...formData, dailyTargetMinutes: next });
                      }}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={formData.dailyTargetMinutes}
                      min={10}
                      max={240}
                      onChange={e => {
                        let val = parseInt(e.target.value) || 10;
                        if (val < 10) val = 10;
                        if (val > 240) val = 240;
                        setFormData({ ...formData, dailyTargetMinutes: val });
                      }}
                      className="flex-1 px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-medium transition"
                      onClick={() => {
                        const current = formData.dailyTargetMinutes;
                        let next;
                        if (current >= 50) {
                          next = current + 15;
                          if (next > 240) next = 240;
                        } else {
                          next = current + 5;
                          if (next > 50) next = 50;
                        }
                        setFormData({ ...formData, dailyTargetMinutes: next });
                      }}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">10-50 min: 5 min steps • 50-240 min: 15 min steps</p>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingGoal ? 'Save Changes' : 'Create Goal'}
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
