import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BottomNav from '../components/common/BottomNav';
import { userService, aiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => { loadMatches(); }, []);

  const loadMatches = async () => {
    try {
      const data = await userService.getMatches();
      setMatches(data.matches || []);
    } catch (error) {
      toast.error('Ошибка загрузки мэтчей');
    } finally {
      setLoading(false);
    }
  };

  const analyzeCompatibility = async (match) => {
    setSelected(match.id);
    setLoadingAI(true);
    try {
      const result = await aiService.calculateCompatibility(user, { ...match.user, looking_for: match.user.looking_for || match.user.lookingFor || "" });
      setAiResult(result);
    } catch {
      toast.error('Ошибка анализа');
    } finally {
      setLoadingAI(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin text-4xl">⚡</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">💕 Совпадения</h1>
          <p className="text-gray-500 mt-1">{matches.length} мэтчей</p>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-xl font-bold">Нет совпадений</h3>
            <p className="text-gray-500 mb-4">Свайпайте анкеты!</p>
            <a href="/dashboard" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg">Смотреть анкеты</a>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {matches.map((match, i) => (
              <motion.div key={match.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                onClick={() => analyzeCompatibility(match)}
                className={`bg-white rounded-2xl p-4 shadow-md cursor-pointer transition-all ${selected === match.id ? 'ring-2 ring-purple-500' : 'hover:shadow-lg'}`}>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold border-4 border-white">{user?.name?.[0] || 'Я'}</div>
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white font-bold border-4 border-white">{match.user.name[0]}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Вы + {match.user.name}</h3>
                    <p className="text-sm text-gray-500">{match.user.age} лет • {match.user.city}</p>
                  </div>
                  <div className="text-2xl font-bold text-green-500">{match.compatibility}%</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(match.user.interests || []).slice(0, 4).map(i => (
                    <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs">{i}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selected && aiResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-xl mb-4">
            <h2 className="text-xl font-bold mb-4">🤖 ИИ-анализ совместимости</h2>
            {loadingAI ? <div className="text-center py-4"><div className="animate-spin text-3xl">⚡</div></div> : (
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{aiResult.compatibility?.replace(/\*\*/g, '') || aiResult.analysis}</div>
            )}
            <div className="flex gap-3 mt-4">
              <a href={`/chat/${selected}`} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-3 rounded-xl font-semibold shadow-lg">💬 Чат</a>
              <a href={`/profile/${matches.find(m => m.id === selected)?.user.id}`} className="flex-1 bg-gray-100 text-gray-600 text-center py-3 rounded-xl font-semibold">👤 Профиль</a>
            </div>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
