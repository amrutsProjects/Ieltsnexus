import { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { WritingModule } from './components/WritingModule';
import { SpeakingSimulation } from './components/SpeakingSimulation';
import { CommunityScreen } from './components/CommunityScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { TopicSelection } from './components/TopicSelection';
import { SimulationResults } from './components/SimulationResults';
import { CommunityPostDetail } from './components/CommunityPostDetail';
import { ExamSimulation } from './components/ExamSimulation';
import { GrammarPractice } from './components/GrammarPractice';
import { BottomNav } from './components/BottomNav';

type Screen = 'home' | 'practice' | 'speaking' | 'community' | 'profile' | 'topicSelection' | 'simulationResults' | 'postDetail' | 'examSimulation' | 'grammarPractice';
type ModuleType = 'writing' | 'speaking' | null;

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [selectedModule, setSelectedModule] = useState<ModuleType>(null);
  const [userTier, setUserTier] = useState<'free' | 'premium'>('free');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const handleNavigate = (screen: string) => {
    // Intercept practice and speaking navigation to show topic selection first
    if (screen === 'practice') {
      setSelectedModule('writing');
      setActiveScreen('topicSelection');
    } else if (screen === 'speaking') {
      setSelectedModule('speaking');
      setActiveScreen('topicSelection');
    } else {
      setActiveScreen(screen as Screen);
    }
  };

  const handleNavigateToTopicSelection = (moduleType: ModuleType) => {
    setSelectedModule(moduleType);
    setActiveScreen('topicSelection');
  };

  const handleTopicSelect = (topicId: string) => {
    // Navigate to the appropriate module based on selectedModule
    if (selectedModule === 'writing') {
      setActiveScreen('practice');
    } else if (selectedModule === 'speaking') {
      setActiveScreen('speaking');
    }
  };

  const handleStartSimulation = () => {
    setActiveScreen('examSimulation');
  };

  const handleEndExam = () => {
    setActiveScreen('simulationResults');
  };

  const handleViewPost = (postId: string) => {
    setSelectedPostId(postId);
    setActiveScreen('postDetail');
  };

  const handleBackFromPost = () => {
    setActiveScreen('community');
  };

  const handleTryTestFromPost = (topicId: string) => {
    setSelectedModule('writing');
    setActiveScreen('topicSelection');
  };

  // Determine which nav item should be active
  const getActiveNavScreen = () => {
    if (activeScreen === 'topicSelection') {
      return selectedModule === 'writing' ? 'practice' : 'speaking';
    }
    if (activeScreen === 'postDetail') {
      return 'community';
    }
    if (activeScreen === 'simulationResults' || activeScreen === 'examSimulation') {
      return 'home';
    }
    return activeScreen;
  };

  // Determine if bottom nav should be hidden
  const shouldHideBottomNav = activeScreen === 'simulationResults' || 
                               activeScreen === 'postDetail' || 
                               activeScreen === 'examSimulation';

  const renderScreen = () => {
    try {
      switch (activeScreen) {
        case 'home':
          return <HomeScreen onStartSimulation={handleStartSimulation} onStartPractice={(type) => setActiveScreen('grammarPractice')} />;
        case 'topicSelection':
          return <TopicSelection onSelectTopic={handleTopicSelect} />;
        case 'practice':
          return <WritingModule />;
        case 'speaking':
          return <SpeakingSimulation />;
        case 'community':
          return <CommunityScreen onViewPost={handleViewPost} />;
        case 'profile':
          return <ProfileScreen />;
        case 'simulationResults':
          return <SimulationResults userTier={userTier} onGoHome={() => setActiveScreen('home')} />;
        case 'postDetail':
          return <CommunityPostDetail onBack={handleBackFromPost} onTryTest={handleTryTestFromPost} />;
        case 'examSimulation':
          return <ExamSimulation onEndExam={handleEndExam} />;
        case 'grammarPractice':
          return <GrammarPractice onComplete={() => setActiveScreen('home')} />;
        default:
          return <HomeScreen onStartSimulation={handleStartSimulation} />;
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
        {!shouldHideBottomNav && (
          <BottomNav 
            activeScreen={getActiveNavScreen()} 
            onNavigate={handleNavigate} 
          />
        )}
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