import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { decodeToken } from '../../utils/tokenUtils';
import { getAtividadePublica, getEntrega, submitEntrega } from '../../firebase/firestore-aluno';
import { getTokenInfo } from '../../firebase/firestore-atividades';
import { RespostaForm } from './RespostaForm';
import { ConfirmacaoView } from './ConfirmacaoView';
import { FeedbackView } from './FeedbackView';
import { ErroView } from './ErroView';

export default function AtividadePageAluno() {
  const { activityId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [estado, setEstado] = useState('carregando');
  const [erroTipo, setErroTipo] = useState('token_invalido');
  const [atividade, setAtividade] = useState(null);
  const [alunoInfo, setAlunoInfo] = useState(null);
  const [entrega, setEntrega] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!token) { setErroTipo('token_invalido'); setEstado('erro'); return; }

    const decoded = decodeToken(token);
    if (!decoded || decoded.activityId !== activityId) {
      setErroTipo('token_invalido'); setEstado('erro'); return;
    }

    const { alunoId } = decoded;

    Promise.all([
      getAtividadePublica(activityId),
      getTokenInfo(activityId, alunoId),
      getEntrega(activityId, alunoId)
    ])
      .then(([atv, info, ent]) => {
        if (!atv) { setErroTipo('atividade_nao_encontrada'); setEstado('erro'); return; }

        setAtividade(atv);
        setAlunoInfo(info);

        const agora = new Date();
        const prazo = atv.dataEntrega?.toDate?.() || new Date(atv.dataEntrega);
        if (prazo < agora && !ent) { setErroTipo('prazo_encerrado'); setEstado('erro'); return; }

        if (ent) {
          setEntrega(ent);
          setEstado(ent.status === 'corrigido' || ent.status === 'revisado' ? 'feedback' : 'confirmacao');
        } else {
          setEstado('form');
        }
      })
      .catch(() => { setErroTipo('erro_carregamento'); setEstado('erro'); });
  }, [activityId, token]);

  const handleSubmit = async (respostaTexto, respostas) => {
    if (!atividade || !alunoInfo) return;
    setEnviando(true);
    try {
      await submitEntrega({
        activityId,
        alunoId: alunoInfo.alunoId,
        turmaId: alunoInfo.turmaId,
        bimestre: atividade.bimestre,
        ...(respostas != null ? { respostas } : { respostaTexto })
      });
      const ent = await getEntrega(activityId, alunoInfo.alunoId);
      setEntrega(ent);
      setEstado('confirmacao');
    } catch (err) {
      console.error('Erro ao enviar resposta:', err);
      alert('Erro ao enviar resposta. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  if (estado === 'carregando') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-700 to-violet-400 animate-pulse" />
      </div>
    );
  }

  if (estado === 'erro') {
    const prazo = atividade?.dataEntrega?.toDate?.();
    const dataStr = prazo ? prazo.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;
    return <ErroView tipo={erroTipo} dataEntrega={dataStr} />;
  }

  const prazo = atividade?.dataEntrega?.toDate?.() || new Date(atividade?.dataEntrega || Date.now());
  const prazoStr = prazo.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-700 to-violet-400 flex items-center justify-center text-white text-[10px] font-extrabold">N</div>
            <span className="text-xs text-slate-400 font-medium">Gestão de Notas</span>
          </div>
          <h1 className="text-xl font-bold text-ink-950 mt-2">{atividade?.titulo}</h1>
          {alunoInfo?.nome && <p className="text-sm text-slate-400 mt-0.5">Aluno(a): {alunoInfo.nome}</p>}
          <p className="text-xs text-slate-400 mt-1">Prazo: {prazoStr}</p>
        </div>

        {/* Texto de apoio */}
        {atividade?.textoBase && estado === 'form' && (
          <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Material de apoio</p>
            <div
              className="prose prose-sm max-w-none text-slate-700"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(atividade.textoBase) }}
            />
          </div>
        )}

        {/* Conteúdo dinâmico */}
        {estado === 'form' && (
          <RespostaForm atividade={atividade} onSubmit={handleSubmit} loading={enviando} />
        )}
        {estado === 'confirmacao' && <ConfirmacaoView submittedAt={entrega?.submittedAt} />}
        {estado === 'feedback' && (
          <FeedbackView entrega={entrega} atividade={atividade} />
        )}
      </div>
    </div>
  );
}
