import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, exportAPI } from '../services/api';
import { User, Mail, Award, Download, Save, X, Check, Coins, Sprout, Leaf, Target, Star, Crown, Trophy } from 'lucide-react';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const rankInfo = {
    'Novice': { bgClass: 'bg-slate-100', textClass: 'text-slate-700', Icon: Sprout },
    'Apprentice': { bgClass: 'bg-green-50', textClass: 'text-green-700', Icon: Leaf },
    'Focused': { bgClass: 'bg-blue-50', textClass: 'text-blue-700', Icon: Target },
    'Dedicated': { bgClass: 'bg-purple-50', textClass: 'text-purple-700', Icon: Star },
    'Master': { bgClass: 'bg-amber-50', textClass: 'text-amber-700', Icon: Crown },
    'Legend': { bgClass: 'bg-red-50', textClass: 'text-red-700', Icon: Trophy }
  };

  const ranks = ['Novice', 'Apprentice', 'Focused', 'Dedicated', 'Master', 'Legend'];
  const currentRankIndex = ranks.indexOf(user?.rank || 'Novice');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await userAPI.updateProfile(formData);
      await refreshUser();
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
          <p className="text-slate-500 mt-1">Manage your account settings</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
            {message.text}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 mb-6">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit
              </button>
            )}
          </div>

          <div className="p-6">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3 pt-2">
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
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mr-4">
                    <User className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-slate-500 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Coins className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{user?.totalCoins || 0}</p>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Total Coins</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
            {(() => {
              const RankIcon = rankInfo[user?.rank || 'Novice']?.Icon;
              return <RankIcon className={`w-8 h-8 mx-auto mb-2 ${rankInfo[user?.rank || 'Novice']?.textClass}`} />;
            })()}
            <p className={`text-sm font-semibold ${rankInfo[user?.rank || 'Novice']?.textClass}`}>
              {user?.rank || 'Novice'}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{currentRankIndex + 1}/{ranks.length}</p>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Rank Progress</p>
          </div>
        </div>

        {/* Rank Progression */}
        <div className="bg-white rounded-xl border border-slate-200 mb-6">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <Award className="w-5 h-5 mr-2 text-slate-400" />
              Rank Progression
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              {ranks.map((rank, index) => {
                const RankIcon = rankInfo[rank]?.Icon;
                return (
                  <div
                    key={rank}
                    className={`flex flex-col items-center ${index <= currentRankIndex ? 'opacity-100' : 'opacity-40'}`}
                  >
                    <RankIcon className={`w-6 h-6 mb-1 ${rankInfo[rank]?.textClass}`} />
                    <span className="text-xs text-slate-600">{rank}</span>
                  </div>
                );
              })}
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentRankIndex + 1) / ranks.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Export Data */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <Download className="w-5 h-5 mr-2 text-slate-400" />
              Export Your Data
            </h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-500 mb-4">Download your focus data for backup or analysis</p>
            <div className="flex space-x-3">
              <a
                href={`${exportAPI.downloadCSV()}?token=${localStorage.getItem('token')}`}
                className="flex-1 flex items-center justify-center px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
                download
              >
                Export CSV
              </a>
              <a
                href={`${exportAPI.downloadJSON()}?token=${localStorage.getItem('token')}`}
                className="flex-1 flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                download
              >
                Export JSON
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
