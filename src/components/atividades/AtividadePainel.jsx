import { useState, useEffect, useCallback } from 'react';
import { useEntregas } from '../../hooks/useEntregas';
import { getAtividade } from '../../firebase/firestore-atividades';
import { EntregaDrawer } from './EntregaDrawer';
import { UrlCopyPanel } from './UrlCopyPanel';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { getDocs, collection } from 'firebase/firestore';

const statusColors = {
  entregue: 'bg-blue-50 text-blue-600 border-blue-200',
  corrigido: 'bg-green-50 text-green-600 border-green-200',
  erro_correcao: 'bg-red-50 text-red-600 border-red-200',
  revisado: 'bg-violet-50 text-violet-600 border-violet-200'
};

const statusLabels = {
  entregue: 'Entregue',
  corrigido: 'Corrigido',
  erro_correcao: 'Erro na correção',
  revisado: 'Revisado'
};

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
    {statusLabels[status] || status}
  </span>
);

export const AtividadePainel = ({ atividade, onBack, onDelete, useAtividadesHook, turmas = [] }) => {
  const { user } = useAuth();
  const { entregas, corrigindo, overrideNota, corrigirEntrega } = useEntregas(atividade.id);
  const [alunosInfo, setAlunosInfo] = useState({});
  const [selectedEntrega, setSelectedEntrega] = useState(null);
  const [showUrls, setShowUrls] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Carrega informações dos tokens (nome dos alunos) para todas as turmas vinculadas
  useEffect(() => {
    const load = async () => {
      const info = {};
      for (const turmaId of atividade.turmaIds) {
        try {
          const snap = await getDocs(collection(db, 'atividades', atividade.id, 'tokens'));
          snap.forEach((d) => {
            const data = d.data();
            info[data.alunoId] = { nome: data.nome, turmaId: data.turmaId, token: data.token };
          });
        } catch {}
      }
      setAlunosInfo(info);
    };
    load();
  }, [atividade.id, atividade.turmaIds]);

  const handleCorrigir = useCallback(async (entregaId) => {
    try {
      // Recarrega a atividade com gabarito (função do professor, não pública)
      const atvCompleta = await getAtividade(atividade.id);
      await corrigirEntrega(entregaId, atvCompleta);

      // Publica nota para o aluno
      const entrega = entregas.find(e => e.id === entregaId);
      if (entrega && atvCompleta) {
        useAtividadesHook.publicarNotaAluno(
          entrega.turmaId,
          entrega.alunoId,
          {} // Será atualizado pelo sync completo
        );
      }
    } catch (err) {
      alert('Erro na correção: ' + err.message);
    }
  }, [atividade, entregas, corrigirEntrega, useAtividadesHook]);

  const handleCorrigirTodas = useCallback(async () => {
    const pendentes = entregas.filter(e => e.status === 'entregue');
    if (pendentes.length === 0) {
      alert('Nenhuma entrega pendente de correção.');
      return;
    }
    if (!window.confirm(`Corrigir ${pendentes.length} entrega(s) com IA?`)) return;

    for (const e of pendentes) {
      await handleCorrigir(e.id);
    }
  }, [entregas, handleCorrigir]);

  const entregasFiltradas = filtroStatus === 'todos'
    ? entregas
    : entregas.filter(e => e.status === filtroStatus);

  const multiplaTurmas = (atividade.turmaIds?.length || 0) > 1;

  // Ordena por turmaId depois por nome (pt-BR)
  const alunosSorted = Object.entries(alunosInfo).sort(([, a], [, b]) => {
    const tc = (a.turmaId || '').localeCompare(b.turmaId || '', 'pt-BR');
    return tc !== 0 ? tc : (a.nome || '').localeCompare(b.nome || '', 'pt-BR');
  });

  // Quando há filtro de status, só mostra alunos com entrega naquele status
  const alunosVisiveis = filtroStatus === 'todos'
    ? alunosSorted
    : alunosSorted.filter(([alunoId]) => entregasFiltradas.some(e => e.alunoId === alunoId));

  const pendentes = entregas.filter(e => e.status === 'entregue').length;
  const corrigidas = entregas.filter(e => e.status === 'corrigido' || e.status === 'revisado').length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="text-slate-400 hover:text-ink-950 transition-colors p-1">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-ink-950">{atividade.titulo}</h3>
          <p className="text-xs text-slate-400">
            {corrigidas}/{entregas.length} corrigidas &middot; {pendentes} pendentes
          </p>
        </div>
        <div className="flex gap-2">
          {pendentes > 0 && (
            <button
              onClick={handleCorrigirTodas}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 rounded-lg text-white text-xs font-semibold transition-all"
            >
              Corrigir Todas ({pendentes})
            </button>
          )}
          <button
            onClick={() => setShowUrls(true)}
            className="px-3 py-1.5 bg-ink-700 hover:bg-ink-600 border border-ink-600 rounded-lg text-xs text-ink-950 font-medium transition-all"
          >
            URLs
          </button>
          <button
            onClick={() => onDelete(atividade.id)}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs text-red-500 font-medium transition-all"
          >
            Excluir
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {['todos', 'entregue', 'corrigido', 'erro_correcao', 'revisado'].map((s) => (
          <button
            key={s}
            onClick={() => setFiltroStatus(s)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all
              ${filtroStatus === s
                ? 'bg-violet-500 text-white'
                : 'bg-ink-700 text-slate-400 hover:bg-ink-600 border border-ink-600'}`}
          >
            {s === 'todos' ? 'Todos' : statusLabels[s] || s}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white border border-ink-600 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-600 bg-ink-700">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Aluno</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nota</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Entregue em</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(alunosInfo).length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 text-sm">
                    Carregando alunos...
                  </td>
                </tr>
              )}
              {(() => {
                if (alunosVisiveis.length === 0 && Object.keys(alunosInfo).length > 0) {
                  return (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 text-sm">
                        Nenhuma entrega com este status.
                      </td>
                    </tr>
                  );
                }
                const rows = [];
                let lastTurmaId = null;
                for (const [alunoId, info] of alunosVisiveis) {
                  if (multiplaTurmas && info.turmaId !== lastTurmaId) {
                    lastTurmaId = info.turmaId;
                    const turmaNome = turmas.find(t => t.id === info.turmaId)?.nome || info.turmaId;
                    rows.push(
                      <tr key={`h-${info.turmaId}`} className="bg-slate-50 border-b border-ink-600">
                        <td colSpan={5} className="px-4 py-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Turma {turmaNome}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                  const entrega = entregasFiltradas.find(e => e.alunoId === alunoId);
                  const nota = entrega?.notaRevisada ?? entrega?.notaFinal;
                  rows.push(
                    <tr key={alunoId} className="border-b border-ink-600 hover:bg-ink-700 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-medium text-ink-950 text-sm">{info.nome}</span>
                      </td>
                      <td className="px-4 py-3">
                        {entrega ? <StatusBadge status={entrega.status} /> : (
                          <span className="text-xs text-slate-400">Pendente</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {nota != null ? (
                          <span className="font-mono text-sm text-ink-950 tabular-nums">
                            {nota.toFixed(2).replace('.', ',')}
                            <span className="text-slate-400 text-xs">/{atividade.notaMaxima.toFixed(1).replace('.', ',')}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {entrega?.submittedAt?.toDate ? entrega.submittedAt.toDate().toLocaleDateString('pt-BR', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                        }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {entrega?.status === 'entregue' && (
                            <button
                              onClick={() => handleCorrigir(entrega.id)}
                              disabled={corrigindo === entrega.id}
                              className="px-2 py-1 bg-violet-50 hover:bg-violet-100 text-violet-500 rounded text-[10px] font-semibold transition-all disabled:opacity-50"
                            >
                              {corrigindo === entrega.id ? 'Corrigindo...' : 'Corrigir IA'}
                            </button>
                          )}
                          {entrega?.status === 'erro_correcao' && (
                            <button
                              onClick={() => handleCorrigir(entrega.id)}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-500 rounded text-[10px] font-semibold transition-all"
                            >
                              Re-corrigir
                            </button>
                          )}
                          {entrega && (
                            <button
                              onClick={() => setSelectedEntrega(entrega)}
                              className="px-2 py-1 bg-ink-700 hover:bg-ink-600 text-ink-950 rounded text-[10px] font-medium transition-all"
                            >
                              Ver
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }
                return rows;
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {selectedEntrega && (
        <EntregaDrawer
          entrega={selectedEntrega}
          atividade={atividade}
          alunoNome={alunosInfo[selectedEntrega.alunoId]?.nome || 'Aluno'}
          onOverride={(novaNota) => overrideNota(selectedEntrega.id, novaNota, user.uid)}
          onCorrigir={() => handleCorrigir(selectedEntrega.id)}
          onClose={() => setSelectedEntrega(null)}
        />
      )}

      {/* URL Panel */}
      {showUrls && (
        <UrlCopyPanel
          activityId={atividade.id}
          alunosInfo={alunosInfo}
          onClose={() => setShowUrls(false)}
        />
      )}
    </div>
  );
};
