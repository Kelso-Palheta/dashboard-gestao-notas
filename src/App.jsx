import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TurmaView } from './components/TurmaView';
import { useTurmas } from './hooks/useTurmas';
import { useNotas } from './hooks/useNotas';

export default function App() {
  const { turmas, setTurmas, addTurma, removeTurma, addAlunos, removeAluno, removeAlunos, setRecuperacao } = useTurmas();
  const { setNota, addAtividade, removeAtividade, updateConfig, clearAtividadesNota, clearAtividadesTurma } = useNotas(setTurmas);
  const [turmaSelecionada, setTurmaSelecionada] = useState(turmas[0] || null);
  const [bimestre, setBimestre] = useState(1);

  // Keep turmaSelecionada in sync with turmas state
  const turmaAtual = turmas.find((t) => t.id === turmaSelecionada?.id) || turmas[0] || null;

  const handleSelectTurma = (t) => setTurmaSelecionada(t);

  const handleAddTurma = (nome) => {
    const id = addTurma(nome);
    const nova = turmas.find((t) => t.id === id) || { id, nome, alunos: [], bimestres: {} };
    setTurmaSelecionada(nova);
  };

  const handleRemoveTurma = (id) => {
    removeTurma(id);
    if (turmaSelecionada?.id === id) {
      const restantes = turmas.filter((t) => t.id !== id);
      setTurmaSelecionada(restantes[0] || null);
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <Sidebar
        turmas={turmas}
        turmaSelecionada={turmaAtual}
        bimestreSelecionado={bimestre}
        onSelectTurma={handleSelectTurma}
        onSelectBimestre={setBimestre}
        onAddTurma={handleAddTurma}
        onRemoveTurma={handleRemoveTurma}
        onReorderTurmas={setTurmas}
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
