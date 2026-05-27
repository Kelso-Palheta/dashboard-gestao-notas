import { NumCell } from './NumCell';
import { calcDesempenhoAnual, fmt, titleCase, statusColor, round2 } from '../utils/calculos';

const ANUAL_MIN = 50;

const STATUS_STYLES = {
  good: 'text-green-600 bg-green-50 border border-green-400/20 font-semibold',
  warn: 'text-amber-600 bg-amber-50 border border-amber-400/20 font-semibold',
  bad:  'text-red-600 bg-red-50 border border-red-400/20 font-semibold',
  none: 'text-slate-400'
};

const STATUS_LABEL = {
  good: { text: 'Aprovado', emoji: '✅' },
  warn: { text: 'Pendente', emoji: '⏳' },
  bad:  { text: 'Reprovado', emoji: '❌' },
  none: { text: '—', emoji: '' }
};

const BimCell = ({ value, status }) => {
  if (value === null) return <span className="text-slate-500 font-mono text-sm">&mdash;</span>;
  return (
    <span className={`font-mono text-sm font-bold px-1.5 py-0.5 rounded ${STATUS_STYLES[status] || STATUS_STYLES.none}`}>
      {fmt(value)}
    </span>
  );
};

const SemestreCell = ({ value }) => {
  if (value === null) return <span className="text-slate-500 font-mono text-sm">&mdash;</span>;
  return (
    <span className="font-mono text-sm font-bold text-ink-950">
      {fmt(value)}
    </span>
  );
};

/** Quanto o aluno precisa no S2 para bater os 50 pontos anuais */
const PrecisaS2Cell = ({ s1Total, s2Completo }) => {
  if (s1Total === null) return <span className="text-slate-400 font-mono text-xs">&mdash;</span>;
  if (s1Total >= ANUAL_MIN) {
    return <span className="text-green-500 font-bold text-xs" title="Já alcançou 50 pontos só no 1º semestre">✓</span>;
  }
  if (s2Completo) {
    return <span className="text-slate-400 font-mono text-xs">&mdash;</span>;
  }
  const falta = round2(ANUAL_MIN - s1Total);
  return (
    <span className="font-mono text-xs text-amber-500 font-semibold" title={`Precisa tirar ${fmt(falta)} no 2º semestre para fechar 50`}>
      +{fmt(falta)}
    </span>
  );
};

/** Quanto falta no total anual para bater 50 */
const FaltaFinalCell = ({ total, todosBims }) => {
  if (total === null) return <span className="text-slate-400 font-mono text-xs">&mdash;</span>;
  if (total >= ANUAL_MIN) {
    return <span className="text-green-500 font-bold text-xs">✓</span>;
  }
  const falta = round2(ANUAL_MIN - total);
  const color = todosBims ? 'text-red-500 font-semibold' : 'text-amber-500 font-semibold';
  return (
    <span className={`font-mono text-xs ${color}`}>
      +{fmt(falta)}
    </span>
  );
};

const StatChipAnual = ({ label, value, color }) => (
  <div className={`flex flex-col items-center px-4 py-2 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${color}`}>
    <span className="font-bold text-lg font-mono tracking-tight tabular-nums">{value}</span>
    <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 mt-0.5">{label}</span>
  </div>
);

export const MapaAnual = ({ turma, onSetRecuperacao }) => {
  const recuperacao = turma.recuperacao || {};

  const dadosAlunos = turma.alunos.map((al) => ({
    aluno: al,
    ...calcDesempenhoAnual(turma, al.id)
  }));

  const comMedia = dadosAlunos.filter((d) => d.totalAnual !== null);
  let aprovados = 0, pendentes = 0, reprovados = 0;
  comMedia.forEach((d) => {
    if (d.statusFinal === 'good') aprovados++;
    else if (d.statusFinal === 'warn') pendentes++;
    else if (d.statusFinal === 'bad') reprovados++;
  });

  const mediaGeral = comMedia.length > 0
    ? round2(comMedia.reduce((a, d) => a + d.totalAnual, 0) / comMedia.length)
    : null;

  const mediaBim = [0, 1, 2, 3].map((i) => {
    const vals = dadosAlunos.filter((d) => d.bimTotais[i] !== null).map((d) => d.bimTotais[i]);
    return vals.length > 0 ? round2(vals.reduce((a, v) => a + v, 0) / vals.length) : null;
  });

  const getBimStatus = (bIndex, val) => {
    if (val === null) return 'none';
    const bData = turma.bimestres[String(bIndex + 1)] || {};
    return statusColor(val, bData.config);
  };

  const mediaS1 = dadosAlunos.filter((d) => d.S1.total !== null).map((d) => d.S1.total);
  const avgS1 = mediaS1.length > 0 ? round2(mediaS1.reduce((a, v) => a + v, 0) / mediaS1.length) : null;

  const mediaS2 = dadosAlunos.filter((d) => d.S2.total !== null).map((d) => d.S2.total);
  const avgS2 = mediaS2.length > 0 ? round2(mediaS2.reduce((a, v) => a + v, 0) / mediaS2.length) : null;

  return (
    <div>
      {/* Header Stats */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <StatChipAnual
          label="Aprovados"
          value={aprovados}
          color="border-green-400/20 text-green-600 bg-green-50 hover:border-green-400/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.08)]"
        />
        <StatChipAnual
          label="Pendentes"
          value={pendentes}
          color="border-amber-400/20 text-amber-600 bg-amber-50 hover:border-amber-400/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.08)]"
        />
        <StatChipAnual
          label="Reprovados"
          value={reprovados}
          color="border-red-400/20 text-red-600 bg-red-50 hover:border-red-400/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.08)]"
        />
        {mediaGeral !== null && (
          <div className="ml-auto flex items-center gap-2 text-sm text-slate-500">
            M&eacute;dia geral:
            <span className={`font-mono font-bold text-base ${mediaGeral >= ANUAL_MIN ? 'text-green-600' : 'text-amber-600'}`}>
              {fmt(mediaGeral)}
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-ink-600 glass-card">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-ink-700 border-b border-ink-600 text-left">
              <th className="px-3 py-3 text-xs text-slate-500 font-bold uppercase tracking-wider w-8">#</th>
              <th className="px-3 py-3 text-xs text-slate-500 font-bold uppercase tracking-wider min-w-[130px]">Aluno</th>

              {/* 1º Semestre */}
              <th className="px-2 py-3 text-xs text-slate-500 font-bold uppercase tracking-wider text-center border-l border-ink-600 w-20">1º Bim</th>
              <th className="px-2 py-3 text-xs text-slate-500 font-bold uppercase tracking-wider text-center w-20">2º Bim</th>
              <th className="px-2 py-3 text-xs text-violet-500 font-bold uppercase tracking-wider text-center w-20">REC 1</th>
              <th className="px-2 py-3 text-xs text-violet-500 font-bold uppercase tracking-wider text-center w-24">Total S1</th>
              <th className="px-1 py-3 text-xs text-amber-600 font-bold uppercase tracking-wider text-center w-24" title="Quantos pontos precisa no 2º semestre para alcançar 50 no total">
                Precisa S2
              </th>

              {/* 2º Semestre */}
              <th className="px-2 py-3 text-xs text-slate-500 font-bold uppercase tracking-wider text-center border-l border-ink-600 w-20">3º Bim</th>
              <th className="px-2 py-3 text-xs text-slate-500 font-bold uppercase tracking-wider text-center w-20">4º Bim</th>
              <th className="px-2 py-3 text-xs text-violet-500 font-bold uppercase tracking-wider text-center w-20">REC 2</th>
              <th className="px-2 py-3 text-xs text-violet-500 font-bold uppercase tracking-wider text-center w-24">Total S2</th>

              {/* Final */}
              <th className="px-2 py-3 text-xs text-slate-500 font-bold uppercase tracking-wider text-center border-l border-ink-600 w-24">Soma Anual</th>
              <th className="px-1 py-3 text-xs text-red-500 font-bold uppercase tracking-wider text-center w-24" title="Pontos que faltam para atingir 50 no total anual">
                Falta Final
              </th>
              <th className="px-3 py-3 text-xs text-slate-500 font-bold uppercase tracking-wider text-center w-28">Status</th>
            </tr>
          </thead>
          <tbody>
            {dadosAlunos.map((d, idx) => {
              const { aluno, bimTotais, S1, S2, totalAnual, statusFinal } = d;
              const label = STATUS_LABEL[statusFinal] || STATUS_LABEL.none;
              const alunoRec = recuperacao[aluno.id] || {};

              const sem2Completo = bimTotais[2] !== null && bimTotais[3] !== null;
              const todosBims = bimTotais[0] !== null && bimTotais[1] !== null && sem2Completo;

              return (
                <tr
                  key={aluno.id}
                  className={`border-b border-ink-600 transition-all duration-300
                    ${idx % 2 === 0 ? 'bg-ink-700/40' : 'bg-transparent'}
                    hover:bg-ink-700/70`}
                >
                  <td className="px-3 py-2 text-slate-400 font-mono text-xs">{idx + 1}</td>
                  <td className="px-3 py-2 text-ink-950 font-medium">{titleCase(aluno.nome)}</td>

                  {/* 1º Semestre */}
                  <td className="px-2 py-2 text-center border-l border-ink-600">
                    <BimCell value={bimTotais[0]} status={getBimStatus(0, bimTotais[0])} />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <BimCell value={bimTotais[1]} status={getBimStatus(1, bimTotais[1])} />
                  </td>
                  <td className="px-1 py-1 text-center">
                    <NumCell
                      value={alunoRec.rec1 ?? ''}
                      min={0} max={10}
                      onChange={(v) => onSetRecuperacao(turma.id, aluno.id, 'rec1', v)}
                      placeholder="—"
                    />
                  </td>
                  <td className="px-2 py-2 text-center bg-violet-50/60">
                    <SemestreCell value={S1.total} />
                  </td>
                  <td className="px-1 py-2 text-center">
                    <PrecisaS2Cell s1Total={S1.total} s2Completo={sem2Completo} />
                  </td>

                  {/* 2º Semestre */}
                  <td className="px-2 py-2 text-center border-l border-ink-600">
                    <BimCell value={bimTotais[2]} status={getBimStatus(2, bimTotais[2])} />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <BimCell value={bimTotais[3]} status={getBimStatus(3, bimTotais[3])} />
                  </td>
                  <td className="px-1 py-1 text-center">
                    <NumCell
                      value={alunoRec.rec2 ?? ''}
                      min={0} max={10}
                      onChange={(v) => onSetRecuperacao(turma.id, aluno.id, 'rec2', v)}
                      placeholder="—"
                    />
                  </td>
                  <td className="px-2 py-2 text-center bg-violet-50/60">
                    <SemestreCell value={S2.total} />
                  </td>

                  {/* Soma Anual */}
                  <td className="px-2 py-2 text-center border-l border-ink-600">
                    {totalAnual !== null ? (
                      <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${STATUS_STYLES[statusFinal]}`}>
                        {fmt(totalAnual)}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs font-mono">&mdash;</span>
                    )}
                  </td>
                  <td className="px-1 py-2 text-center">
                    <FaltaFinalCell total={totalAnual} todosBims={todosBims} />
                  </td>

                  {/* Status */}
                  <td className="px-2 py-2 text-center">
                    {statusFinal !== 'none' ? (
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[statusFinal]}`}>
                        <span>{label.emoji}</span>
                        <span>{label.text}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">&mdash;</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-ink-700/60 border-t-2 border-ink-600">
              <td className="px-3 py-3" colSpan={2}>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Média da Turma</span>
              </td>
              {mediaBim.slice(0, 2).map((m, i) => (
                <td key={i} className="px-2 py-3 text-center border-l border-ink-600">
                  {m !== null ? (
                    <span className={`font-mono font-semibold text-sm ${STATUS_STYLES[statusColor(m, {})].split(' ')[0]}`}>
                      {fmt(m)}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-mono text-sm">&mdash;</span>
                  )}
                </td>
              ))}
              <td className="px-2 py-3 text-center">
                <span className="text-slate-400 font-mono text-sm">&mdash;</span>
              </td>
              <td className="px-2 py-3 text-center bg-violet-50/80">
                {avgS1 !== null ? (
                  <span className="font-mono font-bold text-sm text-ink-950">
                    {fmt(avgS1)}
                  </span>
                ) : (
                  <span className="text-slate-400 font-mono text-sm">&mdash;</span>
                )}
              </td>
              <td className="px-1 py-3 text-center">
                <span className="text-slate-400 font-mono text-xs">&mdash;</span>
              </td>

              {mediaBim.slice(2, 4).map((m, i) => (
                <td key={i + 2} className="px-2 py-3 text-center border-l border-ink-600">
                  {m !== null ? (
                    <span className={`font-mono font-semibold text-sm ${STATUS_STYLES[statusColor(m, {})].split(' ')[0]}`}>
                      {fmt(m)}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-mono text-sm">&mdash;</span>
                  )}
                </td>
              ))}
              <td className="px-2 py-3 text-center">
                <span className="text-slate-400 font-mono text-sm">&mdash;</span>
              </td>
              <td className="px-2 py-3 text-center bg-violet-50/80">
                {avgS2 !== null ? (
                  <span className="font-mono font-bold text-sm text-ink-950">
                    {fmt(avgS2)}
                  </span>
                ) : (
                  <span className="text-slate-400 font-mono text-sm">&mdash;</span>
                )}
              </td>

              <td className="px-2 py-3 text-center border-l border-ink-600">
                {mediaGeral !== null ? (
                  <span className={`font-mono font-bold text-sm ${mediaGeral >= ANUAL_MIN ? 'text-green-600' : 'text-amber-600'}`}>
                    {fmt(mediaGeral)}
                  </span>
                ) : (
                  <span className="text-slate-400 font-mono text-sm">&mdash;</span>
                )}
              </td>
              <td className="px-1 py-3 text-center">
                <span className="text-slate-400 font-mono text-xs">&mdash;</span>
              </td>
              <td className="px-2 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
