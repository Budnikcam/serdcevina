import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { path: '/dashboard', icon: '💕', label: 'Анкеты' },
  { path: '/matches', icon: '💝', label: 'Мэтчи' },
  { path: '/chat', icon: '💬', label: 'Чат' },
  { path: '/coach', icon: '🤖', label: 'Коуч' },
  { path: '/profile', icon: '👤', label: 'Профиль' },
];

export default function BottomNav() {
  const location = useLocation();
  const { dark, toggleTheme } = useTheme();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-lg z-40 transition-colors duration-300">
      <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <a
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'text-purple-600 dark:text-purple-400 scale-110' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-purple-500 rounded-full" />
              )}
            </a>
          );
        })}
        
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-300"
        >
          <span className="text-xl">{dark ? '☀️' : '🌙'}</span>
          <span className="text-[10px] font-medium">Тема</span>
        </button>
      </div>
    </nav>
  );
}
