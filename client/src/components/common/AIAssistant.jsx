import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const QUICK_ACTIONS = [
  { icon: '💡', label: 'Совет по анкете', prompt: 'Дай совет как улучшить мой профиль на сайте знакомств' },
  { icon: '💬', label: 'О чём писать', prompt: 'Подскажи тему для разговора на первом свидании' },
  { icon: '❤️', label: 'Анализ мэтча', prompt: 'На что обратить внимание при выборе партнёра' },
  { icon: '🎯', label: 'Дейтинг стратегия', prompt: 'Как выделиться среди других анкет' },
];

export default function AIAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Привет, ${user?.name || 'друг'}! 👋\nЯ твой ИИ-ассистент по знакомствам. Могу:\n• Проанализировать твой профиль\n• Дать совет по переписке\n• Помочь с выбором фото\n• Оценить совместимость\n\nСпрашивай что угодно! 💝` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [showQuickActions, setShowQuickActions] = useState(true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowQuickActions(false);
    setLoading(true);

    try {
      // Отправляем в AI как анализ личности с дополнительным контекстом
      const response = await aiService.analyzePersonality({
        name: user?.name || 'Пользователь',
        bio: `Запрос к ассистенту: ${text}`,
        interests: user?.interests || [],
        lookingFor: user?.lookingFor || '',
        age: user?.age || 25,
      });

      const assistantMsg = { 
        role: 'assistant', 
        text: response.analysis
          .replace(/\*\*/g, '')
          .replace(/^🎯.*$/gm, '') // Убираем заголовки MBTI для ассистента
          .trim() 
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Извини, произошла ошибка. Попробуй ещё раз!' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickAction = (prompt) => {
    sendMessage(prompt);
  };

  return (
    <>
      {/* Кнопка открытия */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-40 animate-heartbeat"
          >
            🤖
          </motion.button>
        )}
      </AnimatePresence>

      {/* Окно ассистента */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed inset-x-0 bottom-0 z-50 h-[70vh] bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl flex flex-col"
          >
            {/* Хедер */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-3xl p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🤖</span>
                <div>
                  <h3 className="font-bold">ИИ-Ассистент</h3>
                  <p className="text-xs text-white/70">Всегда на связи 💝</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">✕</button>
            </div>

            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
                    }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-2 items-center text-gray-400 text-sm">
                  <span className="animate-spin">⚡</span>
                  Думаю...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Быстрые действия */}
            {showQuickActions && (
              <div className="px-4 py-2 flex gap-2 overflow-x-auto">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => quickAction(action.prompt)}
                    className="flex-shrink-0 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all"
                  >
                    {action.icon} {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Поле ввода */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Спроси совет у ИИ..."
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-lg shadow disabled:opacity-50"
                >
                  ➤
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
