import { motion } from 'framer-motion';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-8xl mb-4"
        >
          💝
        </motion.div>
        <h1 className="text-5xl font-bold text-white mb-2">Сердцевина</h1>
        <p className="text-white/70 text-lg">Найди свою половину</p>
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mt-8"
        >
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
        </motion.div>
      </motion.div>
    </div>
  );
}
