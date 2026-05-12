import { motion } from 'framer-motion';

export default function SwipeCard({ user, onSwipe }) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden h-full flex flex-col">
      {/* Фото */}
      <div className="relative h-2/5 flex-shrink-0">
        <img
          src={user.photo}
          alt={user.name}
          className="w-full h-full object-cover"
        />
        
        {/* Градиент и имя поверх фото */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {user.name}, {user.age}
              </h2>
              <p className="text-white/80 text-sm">{user.city}</p>
            </div>
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              ❤️ {user.compatibility}%
            </div>
          </div>
        </div>
      </div>

      {/* Контент с прокруткой */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* AI-черты */}
        <div className="bg-purple-50 rounded-xl p-3">
          <p className="text-xs text-purple-600 font-medium mb-1">🤖 ИИ-анализ</p>
          <p className="text-sm text-gray-700">{user.aiTraits}</p>
        </div>

        {/* О себе */}
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">📝 О себе</p>
          <p className="text-gray-700 text-sm leading-relaxed">{user.bio}</p>
        </div>

        {/* Интересы */}
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1.5">⭐ Интересы</p>
          <div className="flex flex-wrap gap-1.5">
            {user.interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Кого ищет */}
        <div className="bg-pink-50 rounded-xl p-3">
          <p className="text-xs text-pink-600 font-medium mb-1">💭 В поиске</p>
          <p className="text-sm text-gray-700">{user.lookingFor}</p>
        </div>
      </div>

      {/* Кнопки действий - ВНЕ контента, в самом низу */}
      <div className="flex justify-center gap-4 px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSwipe('left', user)}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-xl border-2 border-red-400 text-red-400 hover:bg-red-50 transition-colors"
        >
          ✕
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSwipe('right', user)}
          className="w-14 h-14 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-xl flex items-center justify-center text-2xl text-white hover:shadow-2xl transition-all"
        >
          ♥
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSwipe('up', user)}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-xl border-2 border-blue-400 text-blue-400 hover:bg-blue-50 transition-colors"
        >
          💬
        </motion.button>
      </div>
    </div>
  );
}
