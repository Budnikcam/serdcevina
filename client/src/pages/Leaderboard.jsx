import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BottomNav from '../components/common/BottomNav';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [leaderboardRes, profileRes] = await Promise.all([
        api.get('/game/leaderboard'),
        api.get('/game/profile'),
      ]);
      setLeaders(leaderboardRes.data.leaderboard || []);
      setMyProfile(profileRes.data);
    } catch (err) {
      console.error('Game data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const medals = ['🥇', '🥈', '🥉'];

  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><div className="animate-spin text-4xl">⚡</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pb-20">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            🏆 Рейтинг
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Топ-100 игроков</p>
        </div>

        {myProfile && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-4 mb-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {myProfile.rank}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{user?.name}</h3>
                <p className="text-sm text-white/70">Уровень {myProfile.level} • {myProfile.xp} XP</p>
              </div>
              <div className="text-2xl font-bold">⭐ {myProfile.streak}д</div>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          {leaders.map((leader, index) => (
            <motion.div
              key={leader.userId || index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex items-center gap-3
                ${leader.userId === user?.id ? 'ring-2 ring-purple-500' : ''}`}
            >
              <div className="w-8 text-center font-bold text-lg">
                {index < 3 ? medals[index] : `#${leader.rank}`}
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                {leader.name?.[0]}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{leader.name}</h4>
                <p className="text-xs text-gray-500">Ур.{leader.level} • {leader.totalMatches} мэтчей</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-amber-500">{leader.xp} XP</div>
                <div className="text-xs text-gray-400">🔥 {leader.streak}д</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
