import { useState } from 'react';
import { motion } from 'framer-motion';
import BottomNav from '../components/common/BottomNav';
import toast from 'react-hot-toast';

export default function Settings() {
  const [s, setS] = useState({ notifications: true, emailDigest: true, showOnline: true, maxDistance: 50, privateProfile: false });

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <a href="/profile" className="text-gray-400 text-xl">←</a>
          <h1 className="text-xl font-bold">⚙️ Настройки</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
          <h3 className="font-semibold mb-3">📍 Радиус: {s.maxDistance} км</h3>
          <input type="range" min="1" max="200" value={s.maxDistance} onChange={e => setS({...s, maxDistance: e.target.value})} className="w-full accent-purple-500" />
        </div>

        {[
          { title: '🔔 Уведомления', items: [{ key: 'notifications', label: 'Push', desc: 'Мэтчи и сообщения' }, { key: 'emailDigest', label: 'Email-дайджест', desc: 'Еженедельно' }] },
          { title: '👁️ Приватность', items: [{ key: 'showOnline', label: 'Онлайн', desc: 'Показывать статус' }, { key: 'privateProfile', label: 'Приватный', desc: 'Скрыть от поиска' }] },
        ].map((sec, idx) => (
          <motion.div key={sec.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-2xl shadow-md p-5 mb-4">
            <h3 className="font-semibold mb-3">{sec.title}</h3>
            {sec.items.map(item => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-gray-400">{item.desc}</p></div>
                <button onClick={() => setS({...s, [item.key]: !s[item.key]})} className={`w-12 h-7 rounded-full transition-all ${s[item.key] ? 'bg-purple-500' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-all ${s[item.key] ? 'ml-6' : 'ml-1'}`} />
                </button>
              </div>
            ))}
          </motion.div>
        ))}

        <button onClick={() => toast.success('Сохранено')} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg mb-4">💾 Сохранить</button>
      </div>
      <BottomNav />
    </div>
  );
}
