import { Home, BookOpen, Globe, User, Mic } from 'lucide-react';

interface BottomNavProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'practice', icon: BookOpen, label: 'Writing' },
    { id: 'speaking', icon: Mic, label: 'Speaking' },
    { id: 'community', icon: Globe, label: 'Community' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-[20px] border-t border-gray-100 z-50"
      style={{ 
        maxWidth: '393px',
        margin: '0 auto',
        boxShadow: '0px -2px 12px rgba(0,0,0,0.04)'
      }}
    >
      <div className="flex items-center justify-around h-20 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                console.log('Clicked:', item.id);
                onNavigate(item.id);
              }}
              className="flex flex-col items-center justify-center gap-1 px-2 py-2 transition-colors cursor-pointer min-w-0 flex-1"
            >
              <Icon 
                className={`w-6 h-6 ${isActive ? 'text-[#4F46E5]' : 'text-gray-400'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span 
                className={`text-xs ${isActive ? 'text-[#4F46E5] font-semibold' : 'text-gray-400 font-medium'} truncate w-full text-center`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}