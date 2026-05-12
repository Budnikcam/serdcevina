import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SwipeCard from '../components/swipe/SwipeCard';
import BottomNav from '../components/common/BottomNav';
import { userService } from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [direction, setDirection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getDiscover();
      setUsers(data.users);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      toast.error('Не удалось загрузить анкеты');
    } finally {
      setLoading(false);
    }
  };

  const currentUser = users[currentIndex];

  const handleSwipe = async (dir, user) => {
    setDirection(dir);
    
    try {
      if (dir === 'right') {
        const result = await userService.likeUser(user.id);
        setMatches(prev => [...prev, user]);
        
        if (result.message === '💕 Это мэтч!') {
          toast.success(`💕 Мэтч с ${user.name}!`, { duration: 5000 });
        } else {
          toast.success(`❤️ Лайк! ${user.name}`);
        }
      } else if (dir === 'up') {
        toast('💬 Откройте чат для ИИ-подсказок', { icon: '🤖' });
      } else {
        await userService.passUser(user.id);
      }
    } catch (error) {
      console.error('Ошибка свайпа:', error);
    }
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚡</div>
          <p className="text-gray-500">Загружаем анкеты...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pb-20">
        <div className="text-center">
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Анкеты закончились!</h1>
          <p className="text-gray-500 mb-4">У вас {matches.length} совпадений</p>
          <a href="/matches" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg">Смотреть мэтчи 💕</a>
          <br />
          <button onClick={loadUsers} className="bg-gray-200 text-gray-600 px-6 py-2 rounded-full text-sm mt-3">🔄 Обновить</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col pb-20">
      <div className="max-w-md mx-auto w-full mb-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Сердцевина</h1>
            <p className="text-sm text-gray-500">Анкета {currentIndex + 1} из {users.length}</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white rounded-full px-4 py-2 shadow text-sm font-medium flex items-center gap-1">
              ❤️ <span className="text-pink-500 font-bold">{matches.length}</span>
            </div>
            <a href="/settings" className="bg-white rounded-full w-10 h-10 shadow flex items-center justify-center text-gray-400">⚙️</a>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full relative" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <AnimatePresence>
          <motion.div
            key={currentUser.id}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ x: direction === 'right' ? 300 : direction === 'left' ? -300 : 0, y: direction === 'up' ? -300 : 0, opacity: 0, rotate: direction === 'right' ? 10 : -10 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            onDragEnd={(_, info) => {
              if (info.offset.x > 80) handleSwipe('right', currentUser);
              else if (info.offset.x < -80) handleSwipe('left', currentUser);
            }}
          >
            <SwipeCard user={currentUser} onSwipe={handleSwipe} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="max-w-md mx-auto w-full mt-3 text-center flex-shrink-0">
        <p className="text-xs text-gray-400">💡 Свайпайте или используйте кнопки</p>
      </div>
      <BottomNav />
    </div>
  );
}
