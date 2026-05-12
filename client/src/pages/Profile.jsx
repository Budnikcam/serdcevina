import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import BottomNav from '../components/common/BottomNav';
import { useAuth } from '../context/AuthContext';
import { userService, aiService } from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const isOwnProfile = !userId;

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      if (isOwnProfile) {
        const data = await userService.getProfile();
        setProfile(data);
        setAiAnalysis(data.aiAnalysis);
      } else {
        // TODO: загрузка чужого профиля
        setProfile(currentUser);
      }
    } catch (error) {
      toast.error('Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  };

  const runAIAnalysis = async () => {
    setLoadingAI(true);
    try {
      const result = await aiService.analyzePersonality(profile);
      setAiAnalysis({ ...result, rawAnalysis: result.analysis });
      toast.success('✨ ИИ обновил анализ!');
    } catch (error) {
      toast.error('Ошибка ИИ-анализа');
    } finally {
      setLoadingAI(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin text-4xl">⚡</div>
      </div>
    );
  }

  const user = profile || currentUser;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-6">
          <a href="/dashboard" className="text-gray-400 text-xl">←</a>
          <h1 className="text-xl font-bold">{isOwnProfile ? '👤 Мой профиль' : `Профиль ${user.name}`}</h1>
          {isOwnProfile && (
            <a href="/settings" className="text-purple-500 text-sm font-medium">✏️</a>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-4">
          <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-6xl text-white">
            {user.photos?.[0] ? <img src={user.photos[0]} alt="" className="w-full h-full object-cover" /> : '👤'}
          </div>
          <div className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{user.name}, {user.age}</h2>
                <p className="text-gray-500 text-sm">{user.city || 'Не указан'}</p>
              </div>
              {user.isOnline && <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">🟢 Онлайн</span>}
            </div>
            <p className="text-gray-700 text-sm mt-3 leading-relaxed">{user.bio}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(user.interests || []).map(i => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{i}</span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">💭 {user.lookingFor || 'Не указано'}</p>
          </div>
        </div>

        {isOwnProfile && (
          <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">🤖 ИИ-анализ</h3>
              {aiAnalysis?.model && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{aiAnalysis.model}</span>}
            </div>
            {aiAnalysis?.rawAnalysis ? (
              <div className="bg-purple-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {aiAnalysis.rawAnalysis.replace(/\*\*/g, '')}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">Запустите ИИ-анализ</p>
            )}
            <button onClick={runAIAnalysis} disabled={loadingAI}
              className="w-full mt-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
              {loadingAI ? '⚡ Анализируем...' : aiAnalysis?.rawAnalysis ? '🔄 Обновить' : '✨ Запустить ИИ-анализ'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Лайки', value: user.likesReceived || 0, icon: '❤️' },
            { label: 'Мэтчи', value: user.matches || 0, icon: '💕' },
            { label: 'Просмотры', value: Math.floor(Math.random() * 200) + 100, icon: '👁️' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-md p-4 text-center">
              <div className="text-2xl">{s.icon}</div>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
