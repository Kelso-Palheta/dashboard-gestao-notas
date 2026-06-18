import { useState, useEffect, useCallback } from 'react';
import { AtividadeForm } from './AtividadeForm';
import { AtividadePainel } from './AtividadePainel';
import { getAtividade } from '../../firebase/firestore-atividades';

const StatusBadge = ({ status }) => {
  const map = {
    ativa: 'bg-green-50 text-green-600 border-green-200',
    encerrada: 'bg-slate-50 text-slate-500 border-slate-200',
    rascunho: 'bg-amber-50 text-amber-600 border-amber-200'
  };
  const labels = { ativa: 'Ativa', encerrada: 'Encerrada', rascunho: 'Rascunho' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${map[status] || map.ativa}`}>
      {labels[status] || status}
    </span>
  );
};

export const AtividadesList = ({
  turma,
  bimestre,
  turmas,
  useAtividadesHook,
  onAddAtv,
  onRemoveAtv
}) => {
  const { atividades, loading, loadAtividades, createAtividade, deleteAtividade } = useAtividadesHook;
  const [showForm, setShowForm] = useState(false);
  const [painelAtividade, setPainelAtividade] = useState(null);

  useEffect(() => {
    if (turma?.id) loadAtividades(turma.id);
  }, [turma?.id, loadAtividades]);

  const handleCreate = useCallback(async (data) => {
    const id = await createAtividade(data);

    // Adiciona a atividade no mapa de notas de cada turma vinculada
    for (const turmaId of data.turmaIds) {
      onAddAtv(turmaId, data.bimestre, data.titulo, data.notaMaxima);
    }

    // Recarrega lista
    if (turma?.id) loadAtividades(turma.id);
  }, [createAtividade, onAddAtv, turma, loadAtividades]);

  const handleDelete = useCallback(async (atvId) => {
    if (!window.confirm('Excluir esta atividade? Todas as entregas e notas serão removidas.')) return;

    const atv = atividades.find(a => a.id === atvId);
    await deleteAtividade(atvId, () => {
      // Remove do mapa de notas de cada turma
      if (atv) {
        for (const turmaId of atv.turmaIds) {
          onRemoveAtv(turmaId, atv.bimestre, atv.atvIdNoMapa || atvId);
        }
      }
    });

    if (turma?.id) loadAtividades(turma.id);
    setPainelAtividade(null);
  }, [atividades, deleteAtividade, onRemoveAtv, turma, loadAtividades]);

  if (painelAtividade) {
    return (
      <AtividadePainel
        atividade={painelAtividade}
        onBack={() => setPainelAtividade(null)}
        onDelete={handleDelete}
        useAtividadesHook={useAtividadesHook}
        turmas={turmas}
      />
    );
  }

  const atividadesFiltradas = atividades.filter(a => a.bimestre === bimestre);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ink-950 uppercase tracking-wider">Atividades</h3>
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1.5 bg-violet-500 hover:bg-violet-400 rounded-lg text-white text-xs font-semibold transition-all btn-3d-primary"
        >
          + Nova Atividade
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-ink-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : atividadesFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-sm">
            Nenhuma atividade neste bimestre.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {atividadesFiltradas.map((atv) => {
            const prazo = atv.dataEntrega?.toDate?.() || new Date(atv.dataEntrega);
            const agora = new Date();
            const encerrada = prazo < agora;

            return (
              <button
                key={atv.id}
                onClick={() => setPainelAtividade(atv)}
                className="w-full text-left bg-white border border-ink-600 rounded-xl p-4 hover:border-violet-300 hover:shadow-glow transition-all duration-300 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-ink-950 text-sm truncate">{atv.titulo}</h4>
                      <StatusBadge status={encerrada ? 'encerrada' : atv.status || 'ativa'} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Nota máx: {atv.notaMaxima.toFixed(1).replace('.', ',')} &middot;  Entrega: {prazo.toLocaleDateString('pt-BR')}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {atv.turmaIds?.map((tid) => {
                        const t = turmas.find(tu => tu.id === tid);
                        return t ? (
                          <span key={tid} className="px-1.5 py-0.5 bg-violet-50 text-violet-500 rounded text-[10px] font-medium">
                            {t.nome}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-slate-300 group-hover:text-violet-400 flex-shrink-0 mt-1 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showForm && (
        <AtividadeForm
          turmas={turmas}
          onSave={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};
