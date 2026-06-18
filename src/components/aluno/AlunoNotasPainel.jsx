import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotasAluno, getAtividadesDoAluno, getEntregasDoAluno, getTokenAluno } from '../../firebase/firestore-aluno';
import { calcTotal, calcSemestre, fmt, temNota } from '../../utils/calculos';

const BimestreCard = ({ numero, turma, alunoId }) => {
  const bData = turma.bimestres[String(numero)];
  if (!bData) return null;
  const { atividades = [], notas = {}, config } = bData;
  const nota = notas[alunoId];
  const total = temNota(nota, atividades) ? calcTotal(nota?.simulado, atividades, nota, config) : null;

  return (
    <div className="bg-ink-700 border border-ink-600 rounded-xl p-4">
      <h3 className="text-xs font-semibold text-ink-950 uppercase tracking-wider mb-3">{numero}º Bimestre</h3>
      {total !== null ? (
        <>
          {nota?.simulado !== undefined && nota?.simulado !== '' && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Simulado</span>
              <span className="font-mono text-ink-950 tabular-nums">{fmt(nota.simulado)}</span>
            </div>
          )}
          {atividades.map((atv) => {
            const v = nota?.[atv.id];
            if (v === undefined || v === '') return null;
            return (
              <div key={atv.id} className="flex justify-between text-sm mb-1">
                <span className="text-slate-400 truncate mr-2 max-w-[160px]">{atv.nome}</span>
                <span className="font-mono text-ink-950 tabular-nums">{fmt(v)} / {fmt(atv.max)}</span>
              </div>
            );
          })}
          <div className="flex justify-between text-sm mt-3 pt-3 border-t border-ink-600">
            <span className="font-semibold text-ink-950">Total</span>
            <span className="font-bold font-mono text-violet-500 tabular-nums">{fmt(total)}</span>
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-400">Sem notas lançadas neste bimestre.</p>
      )}
    </div>
  );
};

const statusAtividade = (entrega, encerrada) => {
  if (!entrega) {
    return encerrada
      ? { label: 'Encerrada', cls: 'text-slate-500 bg-slate-50 border-slate-200' }
      : { label: 'Pendente', cls: 'text-blue-600 bg-blue-50 border-blue-200' };
  }
  if (entrega.status === 'corrigido' || entrega.status === 'revisado')
    return { label: 'Corrigida', cls: 'text-green-600 bg-green-50 border-green-200' };
  if (entrega.status === 'entregue')
    return { label: 'Aguardando correção', cls: 'text-amber-600 bg-amber-50 border-amber-200' };
  return { label: entrega.status, cls: 'text-slate-400 bg-slate-50 border-slate-200' };
};

const AtividadeCard = ({ atividade, entrega, token }) => {
  const prazo = atividade.dataEntrega?.toDate?.() || new Date(atividade.dataEntrega);
  const encerrada = prazo < new Date();
  const { label, cls } = statusAtividade(entrega, encerrada);
  const nota = entrega?.notaRevisada ?? entrega?.notaFinal;
  const podeClicar = token && (!entrega ? !encerrada : entrega.status === 'corrigido' || entrega.status === 'revisado');

  return (
    <div className="bg-ink-700 border border-ink-600 rounded-xl p-4 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cls}`}>{label}</span>
          <span className="text-[10px] text-slate-400">{atividade.bimestre}º Bimestre</span>
        </div>
        <p className="text-sm font-semibold text-ink-950 truncate">{atividade.titulo}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Prazo: {prazo.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
        {nota != null && (
          <p className="text-xs font-mono font-bold text-violet-500 mt-1">
            {nota.toFixed(2).replace('.', ',')} / {(atividade.notaMaxima ?? 10).toFixed(1).replace('.', ',')} pts
          </p>
        )}
      </div>
      {podeClicar && (
        <a
          href={`/atividade/${atividade.id}?token=${token}`}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            !entrega
              ? 'bg-violet-500 hover:bg-violet-400 text-white'
              : 'bg-white border border-ink-600 hover:border-violet-300 text-ink-950'
          }`}
        >
          {!entrega ? 'Responder' : 'Ver feedback'}
        </a>
      )}
    </div>
  );
};

export default function AlunoNotasPainel() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [atividades, setAtividades] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [tokens, setTokens] = useState({});
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [abaAtv, setAbaAtv] = useState('pendentes');

  useEffect(() => {
    const raw = sessionStorage.getItem('aluno_login');
    if (!raw) { navigate('/aluno'); return; }

    let alunoData;
    try { alunoData = JSON.parse(raw); }
    catch { sessionStorage.removeItem('aluno_login'); navigate('/aluno'); return; }

    const { professorUid, turmaId, alunoId } = alunoData;
    const recordId = `${professorUid}_${turmaId}_${alunoId}`;

    Promise.all([
      getNotasAluno(recordId),
      getAtividadesDoAluno(professorUid, turmaId),
      getEntregasDoAluno(alunoId)
    ]).then(async ([notasData, atvsData, entregasData]) => {
      if (!notasData) setErro('Nenhuma nota publicada ainda. Aguarde o professor publicar as notas.');
      else setDados({ ...alunoData, notas: notasData });

      setAtividades(atvsData.sort((a, b) => {
        const pa = a.dataEntrega?.toDate?.() || new Date(a.dataEntrega);
        const pb = b.dataEntrega?.toDate?.() || new Date(b.dataEntrega);
        return pa - pb;
      }));
      setEntregas(entregasData);

      // Busca tokens para todas as atividades (para acessar e ver feedback)
      const tks = {};
      await Promise.all(atvsData.map(async (atv) => {
        const t = await getTokenAluno(atv.id, alunoId);
        if (t) tks[atv.id] = t;
      }));
      setTokens(tks);
    }).catch((err) => {
      console.error(err);
      setErro('Erro ao carregar dados. Tente novamente mais tarde.');
    }).finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => { sessionStorage.removeItem('aluno_login'); navigate('/aluno'); };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-700 to-violet-400 animate-pulse" />
      </div>
    );
  }

  if (erro && !dados) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm animate-card-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h1 className="text-lg font-bold text-ink-950 mb-2">Sem dados</h1>
          <p className="text-sm text-slate-400 mb-6">{erro}</p>
          <button onClick={handleLogout} className="text-sm text-violet-500 hover:text-violet-400 font-medium">Voltar ao login</button>
        </div>
      </div>
    );
  }

  const { notas, nome } = dados;
  const turma = { bimestres: notas.bimestres || {}, alunos: [{ id: dados.alunoId }], recuperacao: {} };
  const alunoId = dados.alunoId;

  const bimTotais = [];
  for (let b = 1; b <= 4; b++) {
    const bData = turma.bimestres[String(b)];
    if (!bData) { bimTotais.push(null); continue; }
    const { atividades: atvsB = [], notas: notasB = {}, config } = bData;
    const nota = notasB[alunoId];
    bimTotais.push(temNota(nota, atvsB) ? calcTotal(nota?.simulado, atvsB, nota, config) : null);
  }
  const S1 = calcSemestre(bimTotais[0], bimTotais[1], null, 2, 3);
  const S2 = calcSemestre(bimTotais[2], bimTotais[3], null, 2, 3);
  const totalAnual = (S1.total !== null || S2.total !== null) ? (S1.total || 0) + (S2.total || 0) : null;

  const agora = new Date();
  const pendentes = atividades.filter(atv => {
    const prazo = atv.dataEntrega?.toDate?.() || new Date(atv.dataEntrega);
    const entrega = entregas.find(e => e.activityId === atv.id);
    return !entrega && prazo >= agora;
  });
  const realizadas = atividades.filter(atv => {
    const entrega = entregas.find(e => e.activityId === atv.id);
    return !!entrega;
  });
  const encerradas = atividades.filter(atv => {
    const prazo = atv.dataEntrega?.toDate?.() || new Date(atv.dataEntrega);
    const entrega = entregas.find(e => e.activityId === atv.id);
    return !entrega && prazo < agora;
  });

  const abaMap = { pendentes, realizadas, encerradas };
  const abaAtual = abaMap[abaAtv] || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-700 to-violet-400 flex items-center justify-center text-white text-[10px] font-extrabold">N</div>
            <span className="text-xs text-slate-400 font-medium">Gestão de Notas</span>
          </div>
          <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-red-500 transition-colors">Sair</button>
        </div>

        <h1 className="text-xl font-bold text-ink-950 mb-1">Minhas Notas</h1>
        <p className="text-sm text-slate-400 mb-8">Aluno(a): {nome}</p>

        {/* Bimestres */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[1, 2, 3, 4].map((b) => (
            <BimestreCard key={b} numero={b} turma={turma} alunoId={alunoId} />
          ))}
        </div>

        {/* Resumo Anual */}
        <div className="bg-ink-700 border border-ink-600 rounded-xl p-4 sm:p-5 mb-8">
          <h3 className="text-xs font-semibold text-ink-950 uppercase tracking-wider mb-4">Resumo Anual</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-xs text-slate-400">1º Semestre</span>
              <p className="text-lg font-bold font-mono text-ink-950 tabular-nums mt-1">{S1.total !== null ? fmt(S1.total) : '—'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">2º Semestre</span>
              <p className="text-lg font-bold font-mono text-ink-950 tabular-nums mt-1">{S2.total !== null ? fmt(S2.total) : '—'}</p>
            </div>
          </div>
          <div className="border-t border-ink-600 pt-4">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold text-ink-950">Total Anual</span>
              <span className="text-2xl font-bold font-mono text-violet-500 tabular-nums">{totalAnual !== null ? fmt(totalAnual) : '—'}</span>
            </div>
            {totalAnual !== null && (
              <p className={`text-xs font-semibold mt-1 ${totalAnual >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                {totalAnual >= 50 ? 'Aprovado' : 'Recuperação/Reprovado'}
              </p>
            )}
          </div>
        </div>

        {/* Atividades */}
        {atividades.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-ink-950 uppercase tracking-wider mb-3">Atividades</h2>

            {/* Abas */}
            <div className="flex gap-1 mb-4 bg-ink-700 border border-ink-600 rounded-xl p-1">
              {[
                { key: 'pendentes', label: 'Pendentes', count: pendentes.length },
                { key: 'realizadas', label: 'Realizadas', count: realizadas.length },
                { key: 'encerradas', label: 'Encerradas', count: encerradas.length },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setAbaAtv(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    abaAtv === key ? 'bg-white text-ink-950 shadow-sm' : 'text-slate-400 hover:text-ink-950'
                  }`}
                >
                  {label}
                  {count > 0 && (
                    <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                      abaAtv === key ? 'bg-violet-500 text-white' : 'bg-ink-600 text-slate-400'
                    }`}>{count}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {abaAtual.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">Nenhuma atividade nesta categoria.</p>
              ) : (
                abaAtual.map(atv => (
                  <AtividadeCard
                    key={atv.id}
                    atividade={atv}
                    entrega={entregas.find(e => e.activityId === atv.id) || null}
                    token={tokens[atv.id] || null}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
