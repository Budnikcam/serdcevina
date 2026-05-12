import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../components/common/BottomNav';
import { useAuth } from '../context/AuthContext';
import { messageService } from '../services/api';
import toast from 'react-hot-toast';

export default function Chat() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    { _id: '1', sender: 'other', text: 'Привет! 👋', createdAt: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput('');
    
    setMessages(prev => [...prev, { _id: Date.now().toString(), sender: user?.id, text, createdAt: new Date() }]);
    
    // Автоответ
    setTimeout(() => {
      const replies = ['Интересно! 😊', 'Расскажи ещё!', 'Здорово 🎉', 'Давай встретимся?'];
      setMessages(prev => [...prev, { _id: (Date.now()+1).toString(), sender: 'other', text: replies[Math.floor(Math.random()*replies.length)], createdAt: new Date() }]);
    }, 1000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-4xl">⚡</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col pb-16">
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/matches" className="text-gray-400 text-xl">←</a>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white font-bold">💬</div>
          <div className="flex-1"><h2 className="font-semibold">Чат</h2></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.map(msg => (
            <motion.div key={msg._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.sender === user?.id ? 'bg-purple-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm'}`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-t flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-2 flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Сообщение..." className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm outline-none" />
          <button onClick={sendMessage} disabled={!input.trim()}
            className="w-10 h-10 bg-purple-500 text-white rounded-full text-lg disabled:opacity-50">➤</button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
