import { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { WritingModule } from './components/WritingModule';
import { SpeakingSimulation } from './components/SpeakingSimulation';
import { CommunityScreen } from './components/CommunityScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { BottomNav } from './components/BottomNav';

type Screen = 'home' | 'practice' | 'speaking' | 'community' | 'profile';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');

  const renderScreen = () => {
    try {
      switch (activeScreen) {
        case 'home':
          return <HomeScreen />;
        case 'practice':
          return <WritingModule />;
        case 'speaking':
          return <SpeakingSimulation />;
        case 'community':
          return <CommunityScreen />;
        case 'profile':
          return <ProfileScreen />;
        default:
          return <HomeScreen />;
      }
    } catch (error) {
      console.error('Error rendering screen:', error);
      return (
        <div className="p-6 text-center">
          <h1 className="text-xl font-bold text-red-600">Error loading screen</h1>
          <p className="text-gray-600 mt-2">Check console for details</p>
        </div>
      );
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC]">
      {/* Mobile Container */}
      <div 
        className="mx-auto bg-white shadow-2xl relative overflow-hidden"
        style={{ 
          maxWidth: '393px',
          minHeight: '100vh'
        }}
      >
        {/* Screen Content */}
        <div className="relative z-10">
          {renderScreen()}
        </div>

        {/* Bottom Navigation */}
        <BottomNav 
          activeScreen={activeScreen} 
          onNavigate={(screen) => setActiveScreen(screen as Screen)} 
        />
      </div>

      {/* Desktop Background Pattern */}
      <div 
        className="fixed inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(79, 70, 229, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)'
        }}
      ></div>
    </div>
  );
}