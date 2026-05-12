import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BottomNav from '../components/common/BottomNav';
import { userService } from '../services/api';
import toast from 'react-hot-toast';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFavorites(); }, []);

  const loadFavorites = async () => {
    try {
      const data = await userService.getFavorites();
      setFavorites(data.favorites || []);
    } catch {
      toast.error('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (userId) => {
    try {
      const result = await userService.likeUser(userId);
      if (result.message === '💕 Это мэтч!') {
        toast.success('💕 Мэтч!');
      } else {
        toast.success('❤️ Лайк отправлен');
      }
      loadFavorites();
    } catch {
      toast.error('Ошибка');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin text-4xl">⚡</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <a href="/dashboard" className="text-gray-400 text-xl">←</a>
          <h1 className="text-xl font-bold">⭐ Избранное</h1>
          <span className="bg-purple-100 text-purple-600 px-2.5 py-0.5 rounded-full text-xs font-medium">{favorites.length}</span>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-bold">Пока пусто</h3>
            <p className="text-gray-500 mb-4">Здесь появятся те, кто вас лайкнул</p>
            <a href="/dashboard" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg">Смотреть анкеты</a>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((fav, i) => (
              <motion.div key={fav.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
                  {fav.user?.name?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{fav.user?.name} <span className="text-gray-400">{fav.user?.age}</span></h3>
                  <p className="text-sm text-gray-500 truncate">{fav.user?.bio}</p>
                  <p className="text-xs text-gray-400 mt-1">❤️ {fav.compatibility}% совместимости</p>
                </div>
                <button onClick={() => handleLike(fav.user?.id || fav.user?._id)}
                  className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-2xl shadow-lg hover:shadow-xl transition-all">
                  ❤️
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
