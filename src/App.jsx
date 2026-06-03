import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TurmaView } from './components/TurmaView';
import { LoginScreen } from './components/LoginScreen';
import { useTurmas } from './hooks/useTurmas';
import { useNotas } from './hooks/useNotas';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, loading, initialTurmas, login, logout, persistTurmas } = useAuth();
  const { turmas, setTurmas, addTurma, removeTurma, addAlunos, removeAluno, removeAlunos, setRecuperacao } = useTurmas(initialTurmas, persistTurmas);
  const { setNota, addAtividade, removeAtividade, updateConfig, clearAtividadesNota, clearAtividadesTurma } = useNotas(setTurmas);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [bimestre, setBimestre] = useState(1);

  const turmaAtual = turmas.find((t) => t.id === turmaSelecionada?.id) || turmas[0] || null;

  const handleSelectTurma = (t) => setTurmaSelecionada(t);

  const handleAddTurma = (nome) => {
    const nova = addTurma(nome);
    setTurmaSelecionada(nova);
  };

  const handleRemoveTurma = (id) => {
    removeTurma(id);
    if (turmaSelecionada?.id === id) {
      const restantes = turmas.filter((t) => t.id !== id);
      setTurmaSelecionada(restantes[0] || null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center animate-card-in">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-tr from-violet-700 to-violet-400 animate-pulse" />
          <p className="text-sm text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <LoginScreen onLogin={login} />;
  }

  // Authenticated app
  return (
    <div className="flex h-full overflow-hidden bg-white">
      <Sidebar
        turmas={turmas}
        turmaSelecionada={turmaAtual}
        bimestreSelecionado={bimestre}
        user={user}
        onSelectTurma={handleSelectTurma}
        onSelectBimestre={setBimestre}
        onAddTurma={handleAddTurma}
        onRemoveTurma={handleRemoveTurma}
        onReorderTurmas={setTurmas}
        onLogout={logout}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {turmaAtual ? (
          <TurmaView
            key={`${turmaAtual.id}-${bimestre}`}
            turma={turmaAtual}
            bimestre={bimestre}
            onSetNota={setNota}
            onAddAtv={addAtividade}
            onRemoveAtv={removeAtividade}
            onAddAlunos={addAlunos}
            onRemoveAluno={removeAluno}
            onRemoveAlunos={removeAlunos}
            onUpdateConfig={updateConfig}
            onSetRecuperacao={setRecuperacao}
            onClearAtividadesNota={clearAtividadesNota}
            onClearAtividadesTurma={clearAtividadesTurma}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center animate-card-in">
              <div className="text-6xl mb-4 opacity-20">📚</div>
              <p className="text-ink-950 font-semibold text-lg">Nenhuma turma cadastrada</p>
              <p className="text-sm mt-1 text-slate-400">Adicione uma turma na barra lateral para come&ccedil;ar.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
