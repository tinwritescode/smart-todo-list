import { useEffect, useState } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-center gap-3">
          <div className="text-2xl animate-bounce">{achievement.icon}</div>
          <div className="flex-1">
            <div className="font-bold text-sm">🎉 Achievement Unlocked!</div>
            <div className="font-semibold">{achievement.title}</div>
            <div className="text-sm opacity-90">{achievement.description}</div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-white hover:text-gray-200 text-xl leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
