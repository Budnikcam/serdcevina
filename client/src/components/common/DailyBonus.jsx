import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export default function DailyBonus() {
  const [show, setShow] = useState(false);
  const [bonus, setBonus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Показываем при заходе если ещё не получали
    const claimed = localStorage.getItem('dailyBonusClaimed');
    const today = new Date().toDateString();
    if (claimed !== today) {
      setTimeout(() => setShow(true), 2000);
    }
  }, []);

  const claimBonus = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/game/daily-bonus');
      setBonus(data);
      localStorage.setItem('dailyBonusClaimed', new Date().toDateString());
      toast.success(`🎉 +${data.totalXP} XP!`);
    } catch (err) {
      if (err.response?.data?.claimed === false) {
        setShow(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
          >
            {bonus ? (
              <>
                <div className="text-6xl mb-4">🎁</div>
                <h2 className="text-2xl font-bold mb-2">Бонус получен!</h2>
                <p className="text-3xl font-bold text-purple-500 mb-2">+{bonus.totalXP} XP</p>
                <p className="text-gray-500 mb-1">Дней подряд: 🔥 {bonus.streak}</p>
                <p className="text-sm text-gray-400 mb-4">Уровень {bonus.level} • {bonus.xp}/{bonus.xpToNext} XP</p>
                
                {bonus.bonuses?.filter(b => b.type !== 'xp').map((b, i) => (
                  <div key={i} className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-2 mb-2">
                    {b.icon} {b.type === 'super_like' ? 'Супер-лайк' : b.type === 'boost' ? 'Буст профиля' : 'Premium на день'}
                  </div>
                ))}
                
                <button onClick={() => setShow(false)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold mt-4">
                  Круто! 🚀
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">📅</div>
                <h2 className="text-2xl font-bold mb-2">Ежедневный бонус</h2>
                <p className="text-gray-500 mb-6">Заходите каждый день и получайте награды!</p>
                
                <div className="flex justify-center gap-2 mb-6">
                  {[1,2,3,4,5,6,7].map(day => (
                    <div key={day} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-bold">
                      {day === 7 ? '🎁' : day}
                    </div>
                  ))}
                </div>
                
                <button onClick={claimBonus} disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3 rounded-xl font-semibold shadow-lg">
                  {loading ? '⏳...' : '🎁 Забрать бонус'}
                </button>
                
                <button onClick={() => setShow(false)}
                  className="w-full text-gray-400 py-2 text-sm mt-2">
                  Позже
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
