import { useState } from 'react';
import { motion } from 'framer-motion';
import BottomNav from '../components/common/BottomNav';

const mockNotifications = [
  { id: 1, type: 'match', icon: '💕', title: 'Новый мэтч!', text: 'Вы и Дарья понравились друг другу', time: '5 мин', color: 'bg-green-50 text-green-600', unread: true },
  { id: 2, type: 'like', icon: '❤️', title: 'Кому-то понравилась анкета', text: 'Откройте чтобы узнать', time: '15 мин', color: 'bg-pink-50 text-pink-600', unread: true },
  { id: 3, type: 'message', icon: '💬', title: 'Новое сообщение', text: 'Дарья: "Созвонимся?"', time: '1 час', color: 'bg-blue-50 text-blue-600', unread: false },
  { id: 4, type: 'ai', icon: '🤖', title: 'ИИ-анализ готов', text: 'С Анной совместимость 85%', time: '3 часа', color: 'bg-purple-50 text-purple-600', unread: false },
];

export default function Notifications() {
  const [notifs] = useState(mockNotifications);
  const unread = notifs.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-gray-400 text-xl">←</a>
            <h1 className="text-xl font-bold">🔔 Уведомления</h1>
            {unread > 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">{unread}</span>}
          </div>
        </div>
        <div className="space-y-2">
          {notifs.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={`bg-white rounded-2xl shadow-sm p-4 flex items-start gap-3 ${n.unread ? 'ring-1 ring-purple-200' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${n.color}`}>{n.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2"><h3 className="font-semibold text-sm">{n.title}</h3>{n.unread && <span className="w-2 h-2 bg-purple-500 rounded-full" />}</div>
                <p className="text-sm text-gray-500">{n.text}</p>
                <p className="text-xs text-gray-400 mt-1">{n.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
