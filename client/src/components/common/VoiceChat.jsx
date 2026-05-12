import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function VoiceChat({ onClose }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);

  // Инициализация распознавания речи
  const initRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Распознавание речи не поддерживается в вашем браузере');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(prev => prev + ' ' + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Доступ к микрофону запрещён');
      }
    };

    return recognition;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Запуск распознавания
      const recognition = initRecognition();
      if (recognition) {
        recognition.start();
        recognitionRef.current = recognition;
      }

      // Запись аудио
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        // Здесь можно отправить blob на сервер для анализа
        console.log('Recording saved:', blob.size, 'bytes');
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      toast.success('🎤 Запись началась. Говорите!');
      
    } catch (error) {
      toast.error('Не удалось получить доступ к микрофону');
      console.error('Mic error:', error);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    toast.success('✅ Запись остановлена');

    // Отправка на ИИ-анализ
    if (transcript.trim()) {
      await analyzeTranscript();
    }
  };

  const analyzeTranscript = async () => {
    setLoading(true);
    try {
      // Здесь отправляем транскрипт в AI-сервис
      const response = await fetch('http://localhost:8000/analyze-personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            name: 'Пользователь',
            bio: `Голосовое сообщение: ${transcript}`,
            interests: [],
            looking_for: '',
            age: 25,
          },
          model: 'auto',
        }),
      });

      const data = await response.json();
      setAiResponse(data.analysis?.replace(/\*\*/g, '') || 'Анализ завершён');
    } catch (error) {
      toast.error('Ошибка анализа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="text-6xl mb-4">
            {isRecording ? (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                🎤
              </motion.div>
            ) : (
              '🎙️'
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">Voice Знакомства</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {isRecording ? 'Говорите... ИИ слушает' : 'Запишите голосовое сообщение для анализа'}
          </p>

          {/* Кнопка записи */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl shadow-xl mx-auto mb-6
              ${isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              }`}
          >
            {isRecording ? '⏹' : '▶'}
          </motion.button>

          {/* Транскрипт */}
          {transcript && (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-4 text-left">
              <p className="text-xs text-gray-500 mb-1">📝 Распознанный текст:</p>
              <p className="text-sm">{transcript}</p>
            </div>
          )}

          {/* Ответ ИИ */}
          {aiResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4 text-left"
            >
              <p className="text-xs text-purple-500 mb-1">🤖 Анализ ИИ:</p>
              <p className="text-sm whitespace-pre-wrap">{aiResponse}</p>
            </motion.div>
          )}

          {loading && (
            <div className="flex justify-center gap-2 mt-4 text-gray-500">
              <span className="animate-spin">⚡</span>
              Анализируем голос...
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
          >
            Закрыть
          </button>
        </div>
      </div>
    </motion.div>
  );
}
