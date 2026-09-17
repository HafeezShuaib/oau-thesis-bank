import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppRouter } from './components/shared';
import ScreenIndex from './screens/ScreenIndex';
import Screen01 from './screens/Screen01';
import Screen02 from './screens/Screen02';
import Screen03 from './screens/Screen03';
import Screen04 from './screens/Screen04';
import Screen05 from './screens/Screen05';
import Screen06 from './screens/Screen06';
import Screen07 from './screens/Screen07';
import Screen08 from './screens/Screen08';
import Screen09 from './screens/Screen09';
import Screen10 from './screens/Screen10';
import Screen11 from './screens/Screen11';
import Screen12 from './screens/Screen12';
import Screen13 from './screens/Screen13';
import Screen14 from './screens/Screen14';
import Screen15 from './screens/Screen15';
import Screen16 from './screens/Screen16';
import Screen17 from './screens/Screen17';
import Screen18 from './screens/Screen18';
import Screen19 from './screens/Screen19';
import Screen20 from './screens/Screen20';
import Screen21 from './screens/Screen21';
import Screen22 from './screens/Screen22';
import Screen23 from './screens/Screen23';
import Screen24 from './screens/Screen24';
import Screen25 from './screens/Screen25';
import Screen26 from './screens/Screen26';
import Screen27 from './screens/Screen27';
import Screen28 from './screens/Screen28';
import Screen29 from './screens/Screen29';
import Screen30 from './screens/Screen30';
import Screen31 from './screens/Screen31';
import Screen32 from './screens/Screen32';
import Screen33 from './screens/Screen33';
import Screen34 from './screens/Screen34';
import Screen35 from './screens/Screen35';
import Screen36 from './screens/Screen36';
import Screen37 from './screens/Screen37';
import Screen38 from './screens/Screen38';
import Screen39 from './screens/Screen39';
import Screen40 from './screens/Screen40';
import Screen41 from './screens/Screen41';
import Screen42 from './screens/Screen42';
import Screen43 from './screens/Screen43';
import Screen44 from './screens/Screen44';
import Screen45 from './screens/Screen45';
import Screen47 from './screens/Screen47';

export default function App() {
  const { currentScreen, user, navigate, authLoading } = useAppRouter();
  const screenId = currentScreen.id === 'landing' && user ? 'discover' : currentScreen.id;
  const adminScreen = screenId === 'admin-dashboard' || screenId === 'content-moderation' || screenId === 'user-management';
  const publicScreens = ['landing', 'login', 'signup', 'password-reset', 'screen-index', 'discover', 'search-results', 'advanced-search', 'thesis-detail', 'pdf-reader'];
  const protectedScreen = !publicScreens.includes(screenId);

  React.useEffect(() => {
    if (authLoading) return;
    if (adminScreen && user?.role !== 'admin') {
      navigate(user ? 'discover' : 'login');
    } else if (protectedScreen && !user) {
      navigate('login');
    }
  }, [adminScreen, authLoading, protectedScreen, user, navigate]);

  if (authLoading || (adminScreen && user?.role !== 'admin') || (protectedScreen && !user)) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screenId}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
        exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
        className="w-full min-h-screen"
      >
        {renderScreen(screenId)}
      </motion.div>
    </AnimatePresence>
  );
}

function renderScreen(id: string) {
  switch (id) {
      case 'screen-index': return <ScreenIndex />;
      case 'landing': return <Screen01 />;
      case 'login': return <Screen02 />;
      case 'signup': return <Screen03 />;
      case 'password-reset': return <Screen04 />;
      case 'discover': return <Screen05 />;
      case 'search-results': return <Screen06 />;
      case 'advanced-search': return <Screen07 />;
      case 'saved': return <Screen08 />;
      case 'thesis-detail': return <Screen09 />;
      case 'thesis-ai': return <Screen10 />;
      case 'pdf-reader': return <Screen11 />;
      case 'thesis-discussion': return <Screen12 />;
      case 'research-lineage': return <Screen13 />;
      case 'upload': return <Screen14 />;
      case 'thesis-metadata': return <Screen15 />;
      case 'access-privacy': return <Screen16 />;
      case 'ai-processing': return <Screen17 />;
      case 'publish-confirmation': return <Screen18 />;
      case 'my-projects': return <Screen19 />;
      case 'edit-thesis': return <Screen20 />;
      case 'access-requests': return <Screen21 />;
      case 'idea-checker': return <Screen22 />;
      case 'idea-similarity': return <Screen23 />;
      case 'idea-extension': return <Screen24 />;
      case 'gap-explorer': return <Screen25 />;
      case 'gap-detail': return <Screen26 />;
      case 'ai-assistant': return <Screen27 />;
      case 'ai-answer': return <Screen28 />;
      case 'researchers': return <Screen29 />;
      case 'researcher-profile': return <Screen30 />;
      case 'researcher-activity': return <Screen31 />;
      case 'collaboration-hub': return <Screen32 />;
      case 'collab-opportunity': return <Screen33 />;
      case 'mentorship-request': return <Screen34 />;
      case 'messages': return <Screen35 />;
      case 'conversation': return <Screen36 />;
      case 'notifications': return <Screen37 />;
      case 'personal-analytics': return <Screen38 />;
      case 'thesis-analytics': return <Screen39 />;
      case 'university-analytics': return <Screen40 />;
      case 'account-settings': return <Screen41 />;
      case 'privacy-settings': return <Screen42 />;
      case 'admin-dashboard': return <Screen43 />;
      case 'content-moderation': return <Screen44 />;
      case 'user-management': return <Screen45 />;
      case 'collaboration-requests': return <Screen32 />;
      case 'profile-setup': return <Screen47 />;
      default: return <Screen01 />;
  }
}
