import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotasAluno } from '../../firebase/firestore-aluno';
import { calcTotal, calcSemestre, fmt, temNota } from '../../utils/calculos';

const BimestreCard = ({ numero, turma, alunoId }) => {
  const bData = turma.bimestres[String(numero)];
  if (!bData) return null;

  const { atividades = [], notas = {}, config } = bData;
  const nota = notas[alunoId];
  const total = temNota(nota, atividades) ? calcTotal(nota?.simulado, atividades, nota, config) : null;

  return (
    <div className="bg-ink-700 border border-ink-600 rounded-xl p-4">
      <h3 className="text-xs font-semibold text-ink-950 uppercase tracking-wider mb-3">
        {numero}º Bimestre
      </h3>

      {total !== null ? (
        <>
          {/* Simulado */}
          {nota?.simulado !== undefined && nota?.simulado !== '' && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Simulado</span>
              <span className="font-mono text-ink-950 tabular-nums">{fmt(nota.simulado)}</span>
            </div>
          )}

          {/* Atividades */}
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

          {/* Total */}
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

export default function AlunoNotasPainel() {
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('aluno_login');
    if (!raw) {
      navigate('/aluno');
      return;
    }

    let alunoData;
    try {
      alunoData = JSON.parse(raw);
    } catch {
      sessionStorage.removeItem('aluno_login');
      navigate('/aluno');
      return;
    }

    const recordId = `${alunoData.professorUid}_${alunoData.turmaId}_${alunoData.alunoId}`;

    getNotasAluno(recordId)
      .then((notasData) => {
        if (!notasData) {
          setErro('Nenhuma nota publicada ainda. Aguarde o professor publicar as notas.');
        } else {
          setDados({ ...alunoData, notas: notasData });
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar notas:', err);
        setErro('Erro ao carregar notas. Tente novamente mais tarde.');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('aluno_login');
    navigate('/aluno');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-700 to-violet-400 animate-pulse" />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm animate-card-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-ink-950 mb-2">Sem dados</h1>
          <p className="text-sm text-slate-400 mb-6">{erro}</p>
          <button onClick={handleLogout} className="text-sm text-violet-500 hover:text-violet-400 font-medium">
            Voltar ao login
          </button>
        </div>
      </div>
    );
  }

  const { notas, nome } = dados;
  const turma = {
    bimestres: notas.bimestres || {},
    alunos: [{ id: dados.alunoId }],
    recuperacao: {}
  };
  const alunoId = dados.alunoId;

  // Calcula totais bimestrais
  const bimTotais = [];
  for (let b = 1; b <= 4; b++) {
    const bData = turma.bimestres[String(b)];
    if (!bData) { bimTotais.push(null); continue; }
    const { atividades = [], notas = {}, config } = bData;
    const nota = notas[alunoId];
    bimTotais.push(temNota(nota, atividades) ? calcTotal(nota?.simulado, atividades, nota, config) : null);
  }

  const S1 = calcSemestre(bimTotais[0], bimTotais[1], null, 2, 3);
  const S2 = calcSemestre(bimTotais[2], bimTotais[3], null, 2, 3);

  const totalAnual = (S1.total !== null || S2.total !== null)
    ? (S1.total || 0) + (S2.total || 0)
    : null;

  const statusFinal = totalAnual !== null
    ? (totalAnual >= 50 ? 'Aprovado' : 'Recuperação/Reprovado')
    : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-700 to-violet-400 flex items-center justify-center text-white text-[10px] font-extrabold">
              N
            </div>
            <span className="text-xs text-slate-400 font-medium">Gestão de Notas</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            Sair
          </button>
        </div>

        <h1 className="text-xl font-bold text-ink-950 mb-1">Minhas Notas</h1>
        <p className="text-sm text-slate-400 mb-8">Aluno(a): {nome}</p>

        {/* Bimestres */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[1, 2, 3, 4].map((b) => (
            <BimestreCard key={b} numero={b} turma={turma} alunoId={alunoId} />
          ))}
        </div>

        {/* Semestres e Total */}
        <div className="bg-ink-700 border border-ink-600 rounded-xl p-4 sm:p-5">
          <h3 className="text-xs font-semibold text-ink-950 uppercase tracking-wider mb-4">Resumo Anual</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-xs text-slate-400">1º Semestre</span>
              <p className="text-lg font-bold font-mono text-ink-950 tabular-nums mt-1">
                {S1.total !== null ? fmt(S1.total) : '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400">2º Semestre</span>
              <p className="text-lg font-bold font-mono text-ink-950 tabular-nums mt-1">
                {S2.total !== null ? fmt(S2.total) : '—'}
              </p>
            </div>
          </div>

          <div className="border-t border-ink-600 pt-4">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold text-ink-950">Total Anual</span>
              <span className="text-2xl font-bold font-mono text-violet-500 tabular-nums">
                {totalAnual !== null ? fmt(totalAnual) : '—'}
              </span>
            </div>
            {statusFinal && (
              <p className={`text-xs font-semibold mt-1 ${totalAnual >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                {statusFinal}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
