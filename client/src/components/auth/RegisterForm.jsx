import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    bio: '',
    interests: [],
    lookingFor: '',
    email: '',
    password: '',
  });

  const interestsList = [
    '🎨 Искусство', '✈️ Путешествия', '💪 Спорт', '🎵 Музыка',
    '🎬 Кино', '📚 Книги', '💻 Технологии', '🍳 Кулинария',
    '🌿 Природа', '🎮 Игры', '💃 Танцы', '📸 Фотография',
    '🧘 Йога', '🐾 Животные', '🎸 Гитара', '🚴 Велоспорт'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const analyzePersonality = async () => {
    setLoading(true);
    try {
      const result = await aiService.analyzePersonality(formData);
      setAiAnalysis(result);
      toast.success('✨ ИИ проанализировал вашу личность!');
      setStep(3);
    } catch (error) {
      console.error('AI анализ:', error);
      toast.error('Ошибка ИИ-анализа. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        bio: formData.bio,
        interests: formData.interests,
        lookingFor: formData.lookingFor,
        email: formData.email,
        password: formData.password,
        aiAnalysis: aiAnalysis?.analysis || ''
      };
      
      await register(userData);
      toast.success('🎉 Регистрация успешна!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-lg w-full border border-white/50"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🚀 Сердцевина
          </h1>
          <p className="text-gray-500 mt-1">Создайте профиль с ИИ</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {['Профиль', 'Интересы', 'ИИ анализ', 'Аккаунт'].map((label, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${step > i + 1 ? 'bg-green-500 text-white scale-90' :
                    step === i + 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-110 shadow-lg' :
                    'bg-gray-200 text-gray-500'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className="text-xs mt-1 hidden sm:block text-gray-500">{label}</span>
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={(e) => { e.preventDefault(); setStep(2); }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">📝 Расскажите о себе</h2>
              
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
                placeholder="Как вас зовут?" required />

              <div className="grid grid-cols-2 gap-4">
                <input type="number" name="age" value={formData.age} onChange={handleChange}
                  min="18" max="100" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
                  placeholder="24" required />
                <select name="gender" value={formData.gender} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none" required>
                  <option value="">Пол</option>
                  <option value="male">👨 Мужской</option>
                  <option value="female">👩 Женский</option>
                </select>
              </div>

              <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none resize-none"
                placeholder="Расскажите о себе..." required />

              <input type="text" name="lookingFor" value={formData.lookingFor} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
                placeholder="Кого ищете?" required />

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg">
                Далее → Интересы
              </motion.button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">⭐ Выберите интересы</h2>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                {interestsList.map((interest) => (
                  <motion.button key={interest} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all text-left
                      ${formData.interests.includes(interest)
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                    {interest}
                  </motion.button>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold">← Назад</button>
                <button onClick={analyzePersonality} disabled={loading || formData.interests.length === 0}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg disabled:opacity-50">
                  {loading ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">⚡</span> Анализируем...</span> : '✨ ИИ Анализ'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && aiAnalysis && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">🤖 ИИ-портрет готов!</h2>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 max-h-64 overflow-y-auto border border-purple-100">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {aiAnalysis.analysis.replace(/\*\*/g, '')}
                </p>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Анализ: {aiAnalysis.model === 'deepseek' ? '🧠 DeepSeek' : '💎 GigaChat'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold">← Назад</button>
                <button onClick={() => setStep(4)} className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 rounded-xl font-semibold shadow-lg">Создать аккаунт →</button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.form key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">🔐 Данные для входа</h2>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
                placeholder="your@email.com" required />
              <input type="password" name="password" value={formData.password} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
                placeholder="Минимум 6 символов" minLength="6" required />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(3)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold">← Назад</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold shadow-xl disabled:opacity-50">
                  {loading ? '⏳ Создаём...' : '🎉 Завершить'}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
