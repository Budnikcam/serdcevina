import { useState } from 'react';
import { motion } from 'framer-motion';
import { aiService } from '../services/api';
import toast from 'react-hot-toast';

const COACH_FEATURES = [
  {
    id: 'analysis',
    icon: '🔍',
    title: 'Анализ переписки',
    desc: 'ИИ проанализирует твою переписку и даст советы',
    prompt: 'Проанализируй мою переписку и дай советы по улучшению общения',
  },
  {
    id: 'redflags',
    icon: '🚩',
    title: 'Red Flags детектор',
    desc: 'Найди тревожные сигналы в общении',
    prompt: 'Какие red flags нужно замечать при знакомстве и переписке?',
  },
  {
    id: 'confidence',
    icon: '💪',
    title: 'Уверенность',
    desc: 'Как стать увереннее на свиданиях',
    prompt: 'Дай советы как стать увереннее при знакомстве и на первом свидании',
  },
  {
    id: 'topics',
    icon: '💭',
    title: 'Темы для разговора',
    desc: 'Лучшие темы для первого, второго, третьего свидания',
    prompt: 'Предложи темы для разговора на первом, втором и третьем свидании',
  },
  {
    id: 'profile',
    icon: '✨',
    title: 'Улучшение профиля',
    desc: 'Как сделать анкету привлекательнее',
    prompt: 'Проанализируй и дай советы по улучшению моего профиля на сайте знакомств',
  },
  {
    id: 'ghosting',
    icon: '👻',
    title: 'Что делать при Ghosting',
    desc: 'Как реагировать если перестали отвечать',
    prompt: 'Как правильно реагировать на ghosting и стоит ли писать снова?',
  },
];

export default function DatingCoach() {
  const [activeCoach, setActiveCoach] = useState(null);
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedAdvices, setSavedAdvices] = useState([]);

  const getAdvice = async (feature) => {
    setActiveCoach(feature.id);
    setLoading(true);
    setAdvice('');

    try {
      const result = await aiService.analyzePersonality({
        name: 'Пользователь',
        bio: feature.prompt,
        interests: ['знакомства'],
        lookingFor: 'совет',
        age: 25,
      });

      const cleanAdvice = result.analysis
        .replace(/\*\*/g, '')
        .replace(/🎯.*$/gm, '')
        .trim();

      setAdvice(cleanAdvice);
      
      // Сохраняем в историю
      setSavedAdvices(prev => [{
        id: Date.now(),
        title: feature.title,
        advice: cleanAdvice,
        date: new Date().toLocaleDateString('ru-RU'),
      }, ...prev].slice(0, 10));
      
    } catch (error) {
      toast.error('Ошибка получения совета');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('📋 Совет скопирован!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🤖 ИИ-Коуч Знакомств
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Персональные советы для успешных отношений
          </p>
        </div>

        {/* Карточки советов */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {COACH_FEATURES.map((feature) => (
            <motion.div
              key={feature.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => getAdvice(feature)}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md cursor-pointer transition-all
                ${activeCoach === feature.id ? 'ring-2 ring-purple-500' : 'hover:shadow-lg'}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {feature.desc}
                  </p>
                </div>
              </div>
              {activeCoach === feature.id && loading && (
                <div className="flex items-center gap-2 mt-3 text-purple-500 text-sm">
                  <span className="animate-spin">⚡</span>
                  Получаю совет...
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Результат совета */}
        {advice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">💡 Совет ИИ-коуча</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(advice)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
                >
                  📋 Копировать
                </button>
                <button
                  onClick={() => setAdvice('')}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {advice}
            </div>
          </motion.div>
        )}

        {/* История советов */}
        {savedAdvices.length > 0 && (
          <div className="mt-8">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3">📚 История советов</h3>
            <div className="space-y-2">
              {savedAdvices.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setAdvice(item.advice)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{item.advice.substring(0, 100)}...</p>
                    </div>
                    <span className="text-xs text-gray-400">{item.date}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
