import { useState } from 'react';
import { motion } from 'framer-motion';
import BottomNav from '../components/common/BottomNav';
import toast from 'react-hot-toast';

const plans = [
  { name: 'Бесплатный', price: '0₽', period: 'навсегда', color: 'from-gray-400 to-gray-500', features: ['10 лайков/день', 'Базовый ИИ', 'Чат'], disabled: ['Расширенный ИИ', 'Безлимит'] },
  { name: 'Pro', price: '299₽', period: '/мес', color: 'from-purple-500 to-pink-500', popular: true, features: ['Безлимит', 'ИИ-подсказки', 'Кто оценил', 'Фильтры'], disabled: ['ИИ-коуч'] },
  { name: 'Premium', price: '799₽', period: '/мес', color: 'from-amber-400 to-orange-500', features: ['Всё из Pro', 'ИИ-коуч', 'Буст х3', 'Скрытый просмотр'], disabled: [] },
];

export default function Premium() {
  const [selected, setSelected] = useState(null);
  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <a href="/profile" className="text-gray-400 text-xl float-left">←</a>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">💎 Premium</h1>
          <p className="text-gray-500 mt-2">Раскройте ИИ-возможности</p>
        </div>

        <div className="grid gap-4">
          {plans.map((plan, idx) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className={`bg-white rounded-2xl shadow-md p-6 relative ${plan.popular ? 'ring-2 ring-purple-400 scale-[1.02]' : ''}`}>
              {plan.popular && <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">👑 Популярный</div>}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div className="mb-4"><span className="text-3xl font-bold">{plan.price}</span><span className="text-gray-500 text-sm"> {plan.period}</span></div>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => <li key={f} className="flex gap-2 text-sm text-gray-700"><span>✅</span>{f}</li>)}
                {plan.disabled.map(f => <li key={f} className="flex gap-2 text-sm text-gray-400 line-through"><span>✕</span>{f}</li>)}
              </ul>
              <button onClick={() => { setSelected(plan.name); toast.success(`${plan.name} активирован!`); }} className={`w-full bg-gradient-to-r ${plan.color} text-white py-3 rounded-xl font-semibold shadow-lg ${selected === plan.name ? 'opacity-75' : ''}`}>
                {selected === plan.name ? '✅ Активен' : plan.price === '0₽' ? 'Текущий' : 'Выбрать'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
