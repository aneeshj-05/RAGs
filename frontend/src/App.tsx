import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LandingPage } from './components/landing/LandingPage';
import { WorkspacePage } from './components/workspace/WorkspacePage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
