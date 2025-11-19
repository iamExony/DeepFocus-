import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { User, Mail, Award, TrendingUp } from 'lucide-react';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const rankInfo = {
    'Novice': { color: 'gray', minStreak: 0, description: 'Just getting started' },
    'Beginner': { color: 'blue', minStreak: 7, description: '7+ day streak' },
    'Intermediate': { color: 'green', minStreak: 14, description: '14+ day streak' },
    'Advanced': { color: 'yellow', minStreak: 30, description: '30+ day streak' },
    'Expert': { color: 'orange', minStreak: 60, description: '60+ day streak' },
    'Master': { color: 'purple', minStreak: 100, description: '100+ day streak' }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      await userAPI.updateProfile(formData);
      await refreshUser();
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    }
  };

  const currentRankInfo = rankInfo[user?.rank || 'Novice'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          firstName: user?.firstName || '',
                          lastName: user?.lastName || '',
                          email: user?.email || ''
                        });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-lg text-gray-900 mt-1">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-lg text-gray-900 mt-1">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Account Type</label>
                    <p className="text-lg text-gray-900 mt-1">
                      {user?.isAdmin ? (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          Administrator
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          User
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rank and Stats */}
          <div className="space-y-6">
            {/* Current Rank */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-primary-600" />
                Current Rank
              </h2>
              <div className="text-center">
                <div className={`inline-block px-6 py-3 bg-${currentRankInfo.color}-100 rounded-lg mb-3`}>
                  <p className={`text-3xl font-bold text-${currentRankInfo.color}-700`}>
                    {user?.rank || 'Novice'}
                  </p>
                </div>
                <p className="text-sm text-gray-600">{currentRankInfo.description}</p>
              </div>
            </div>

            {/* Coins */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Total Coins</h2>
              <div className="text-center">
                <div className="text-5xl mb-2">🪙</div>
                <p className="text-4xl font-bold text-yellow-600">{user?.totalCoins || 0}</p>
              </div>
            </div>

            {/* Rank Progression */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
                Rank Progression
              </h2>
              <div className="space-y-3">
                {Object.entries(rankInfo).map(([rank, info]) => (
                  <div
                    key={rank}
                    className={`flex items-center justify-between p-2 rounded ${
                      user?.rank === rank ? 'bg-primary-50 border border-primary-200' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full bg-${info.color}-500 mr-2`}></div>
                      <span className={`text-sm ${user?.rank === rank ? 'font-bold' : ''}`}>
                        {rank}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{info.minStreak}+ days</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
