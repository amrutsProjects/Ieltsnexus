import { useState, useEffect } from 'react';
import { apiCall } from './lib/api';
import { HomeScreen } from './components/HomeScreen';
import { WritingModule } from './components/WritingModule';
import { SpeakingSimulation } from './components/SpeakingSimulation';
import CommunityScreen from './components/CommunityScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { TopicSelection } from './components/TopicSelection';
import { SimulationResults } from './components/SimulationResults';
import { ExamSimulation } from './components/ExamSimulation';
import { GrammarPractice } from './components/GrammarPractice';
import { BottomNav } from './components/BottomNav';
import { AuthScreen, UserProfile } from './components/AuthScreen';

type Screen = 'home' | 'practice' | 'speaking' | 'community' | 'profile' | 'topicSelection' | 'simulationResults' | 'examSimulation' | 'grammarPractice';
type ModuleType = 'writing' | 'speaking' | null;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [selectedModule, setSelectedModule] = useState<ModuleType>(null);
  const [selectedTopic, setSelectedTopic] = useState<{ id: string; name: string } | null>(null);
  const [examResults, setExamResults] = useState<any>(null);
  const [userTier, setUserTier] = useState<'free' | 'premium'>('free');
  const [availableCredits, setAvailableCredits] = useState(0);


  // Phase 1 testing: Check if backend is alive
  useEffect(() => {
    apiCall('/health')
      .then(res => console.log('Backend connected:', res))
      .catch(err => console.error('Backend connection failed:', err));
  }, []);

  // Fetch true profile data
  const refreshProfile = () => {
    if (isAuthenticated) {
      apiCall('/profile')
        .then(data => {
          setUserProfile(data.profile);
          setUserStats(data.stats);
          setAvailableCredits(data.credits_balance);
          setUserTier(data.profile.tier || 'free');
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [isAuthenticated, activeScreen]);

  const handleAuthComplete = (userData: any) => {
    setUserProfile(userData);
    setIsAuthenticated(true);
  };

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

  const handleTopicSelect = (topic: { id: string; name: string }) => {
    setSelectedTopic(topic);
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

  const handleEndExam = (results: any) => {
    setExamResults(results);
    setActiveScreen('simulationResults');
    refreshProfile(); // Sync credits after exam
  };



  // Determine which nav item should be active
  const getActiveNavScreen = () => {
    if (activeScreen === 'topicSelection') {
      return selectedModule === 'writing' ? 'practice' : 'speaking';
    }
    if (activeScreen === 'simulationResults' || activeScreen === 'examSimulation') {
      return 'home';
    }
    return activeScreen;
  };

  // Determine if bottom nav should be hidden
  const shouldHideBottomNav = activeScreen === 'simulationResults' ||
    activeScreen === 'examSimulation';

  const renderScreen = () => {
    try {
      switch (activeScreen) {
        case 'home':
          return <HomeScreen onStartSimulation={handleStartSimulation} onStartPractice={(type) => setActiveScreen('grammarPractice')} />;
        case 'topicSelection':
          return <TopicSelection onSelectTopic={handleTopicSelect} />;
        case 'practice':
          return <WritingModule userTier={userTier} availableCredits={availableCredits} topicId={selectedTopic?.id || null} topicName={selectedTopic?.name || null} onBack={() => setActiveScreen('topicSelection')} onCreditUpdate={refreshProfile} />;
        case 'speaking':
          return <SpeakingSimulation userTier={userTier} availableCredits={availableCredits} topicId={selectedTopic?.id || null} topicName={selectedTopic?.name || null} onBack={() => setActiveScreen('topicSelection')} onCreditUpdate={refreshProfile} />;
        case 'community':
          return <CommunityScreen />;
        case 'profile':
          return <ProfileScreen userProfile={userProfile} userStats={userStats} userTier={userTier} availableCredits={availableCredits} onNavigateToWeaknessFix={(weaknessId) => setActiveScreen('grammarPractice')} />;
        case 'simulationResults':
          return <SimulationResults userTier={userTier} examResults={examResults} onGoHome={() => setActiveScreen('home')} />;
        case 'examSimulation':
          return <ExamSimulation onEndExam={handleEndExam} userTier={userTier} availableCredits={availableCredits} />;
        case 'grammarPractice':
          return <GrammarPractice onComplete={() => setActiveScreen('home')} />;
        default:
          return <HomeScreen userProfile={userProfile} userStats={userStats} onStartSimulation={handleStartSimulation} onStartPractice={(type) => setActiveScreen('grammarPractice')} />;
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
        {!isAuthenticated ? (
          <AuthScreen onAuthComplete={handleAuthComplete} />
        ) : (
          <>
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
          </>
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