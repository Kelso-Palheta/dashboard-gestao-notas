import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';

const AtividadePageAluno = lazy(() => import('./components/aluno/AtividadePageAluno'));
const AlunoLogin = lazy(() => import('./components/aluno/AlunoLogin'));
const AlunoNotasPainel = lazy(() => import('./components/aluno/AlunoNotasPainel'));

const LoadingFallback = () => (
  <div className="h-full flex items-center justify-center bg-white">
    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-700 to-violet-400 animate-pulse" />
  </div>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/atividade/:activityId" element={<AtividadePageAluno />} />
            <Route path="/aluno" element={<AlunoLogin />} />
            <Route path="/aluno/notas" element={<AlunoNotasPainel />} />
            <Route path="*" element={<App />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
