import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../components/common/BottomNav';
import { useAuth } from '../context/AuthContext';
import { messageService, userService, aiService } from '../services/api';
import toast from 'react-hot-toast';

export default function Chat() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [matchUser, setMatchUser] = useState(null);
  const [input, setInput] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [aiMsg, setAiMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const activeMatchId = matchId || 'demo';

  useEffect(() => {
    if (matchId) loadMessages();
    else loadFirstMatch();
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadFirstMatch = async () => {
    try {
      const data = await userService.getMatches();
      if (data.matches?.length > 0) {
        window.location.href = `/chat/${data.matches[0].id}`;
      }
    } catch {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const data = await messageService.getMessages(activeMatchId);
      setMessages(data.messages || []);
      // Загружаем инфо о собеседнике
      const matchesData = await userService.getMatches();
      const match = matchesData.matches?.find(m => m.id === activeMatchId);
      if (match) setMatchUser(match.user);
    } catch {
      toast.error('Ошибка загрузки чата');
    } finally {
      setLoading(false);
    }
  };

  const extractFirst = (text) => {
    if (!text) return 'Привет! 😊';
    const clean = text.replace(/\*\*/g, '');
    const m = clean.match(/📨\s*ВАРИАНТ\s*1[:\s]+(.+?)(?=\s*📨|\s*💬|$)/s);
    if (m) return m[1].trim();
    const q = clean.match(/[«"]([^«»"]+?)[»"]/);
    if (q) return q[1].trim();
    return clean.split('\n').filter(l => l.trim() && !l.startsWith('📨') && !l.startsWith('💬'))[0]?.trim() || clean.substring(0, 200);
  };

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;
    try {
      const msg = await messageService.sendMessage(activeMatchId, text);
      setMessages(prev => [...prev, msg]);
      setInput('');
      setShowAI(false);
      setAiMsg(null);
    } catch {
      toast.error('Ошибка отправки');
    }
  };

  const getAI = async () => {
    setShowAI(true);
    setLoadingAI(true);
    try {
      const result = await aiService.generateMessage(user, matchUser || {}, 
        messages.slice(-3).map(m => m.text).join(' | '));
      setAiMsg({ ...result, messages: extractFirst(result.messages) });
    } catch {
      toast.error('Ошибка ИИ');
      setShowAI(false);
    } finally {
      setLoadingAI(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin text-4xl">⚡</div></div>;
  }

  if (!matchId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pb-20">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-bold">Нет активных чатов</h3>
          <p className="text-gray-500 mb-4">Найдите мэтч чтобы начать общение</p>
          <a href="/dashboard" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg">Искать анкеты</a>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16">
      <div className="bg-white border-b shadow-sm flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/matches" className="text-gray-400 text-xl">←</a>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white font-bold">
            {matchUser?.name?.[0] || '?'}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-800">{matchUser?.name || 'Собеседник'}</h2>
            <p className="text-xs text-gray-500">{matchUser?.city || ''}</p>
          </div>
          <button onClick={getAI} className="bg-purple-100 text-purple-600 px-3 py-1.5 rounded-full text-sm font-medium">🤖 ИИ</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.map(msg => (
            <motion.div key={msg._id || msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === user?.id || msg.sender?._id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%]">
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.sender === user?.id || msg.sender?._id === user?.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md'
                  : 'bg-white text-gray-700 rounded-bl-md shadow-sm border'}`}>
                  {msg.text}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <AnimatePresence>
        {showAI && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="bg-white border-t shadow-2xl flex-shrink-0">
            <div className="max-w-2xl mx-auto p-3">
              <div className="flex justify-between mb-2"><span className="text-sm font-semibold">🤖 ИИ предлагает</span><button onClick={() => setShowAI(false)} className="text-gray-400">✕</button></div>
              {loadingAI ? <div className="flex gap-2 py-4"><span className="animate-spin">⚡</span>Генерирую...</div> :
                aiMsg ? <motion.div whileHover={{ scale: 1.01 }} onClick={() => sendMessage(aiMsg.messages)}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 cursor-pointer border border-purple-100">
                  <p className="text-sm text-gray-800">{aiMsg.messages}</p>
                  <p className="text-[10px] text-purple-500 mt-1">{aiMsg.model} • Нажмите чтобы отправить</p>
                </motion.div> : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border-t flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-2 flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Сообщение..." className="flex-1 px-4 py-2.5 bg-gray-50 rounded-full border text-sm outline-none focus:ring-2 focus:ring-purple-400" />
          <button onClick={() => sendMessage()} disabled={!input.trim()}
            className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-lg shadow disabled:opacity-50">➤</button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
