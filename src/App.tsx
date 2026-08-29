import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppDataProvider } from './context/AppDataContext';
import { HomeScreen } from './components/screens/HomeScreen';
import { EntryCreateScreen } from './components/screens/EntryCreateScreen';
import { MarkingScreen } from './components/screens/MarkingScreen';
import { StudyDetailScreen } from './components/screens/StudyDetailScreen';
import { QuizScreen } from './components/screens/QuizScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

export function App() {
  return (
    <AppDataProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/new" element={<EntryCreateScreen />} />
          <Route path="/entries/:id" element={<StudyDetailScreen />} />
          <Route path="/entries/:id/mark" element={<MarkingScreen />} />
          <Route path="/entries/:id/quiz" element={<QuizScreen />} />
          <Route path="/entries/:id/quiz/result" element={<ResultScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </HashRouter>
    </AppDataProvider>
  );
}
