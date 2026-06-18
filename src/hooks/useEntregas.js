import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { corrigirAtividade } from '../utils/correcaoIA';

export function useEntregas(activityId) {
  const [entregas, setEntregas] = useState([]);
  const [corrigindo, setCorrigindo] = useState(null);

  useEffect(() => {
    if (!activityId) return;
    const q = query(collection(db, 'entregas'), where('activityId', '==', activityId));
    const unsub = onSnapshot(q, (snap) => {
      setEntregas(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });
    return () => unsub();
  }, [activityId]);

  const overrideNota = useCallback(async (entregaId, novaNota, professorId) => {
    const entrega = entregas.find(e => e.id === entregaId);
    if (!entrega) return;
    await setDoc(doc(db, 'entregas', entregaId), {
      notaRevisada: Number(novaNota),
      notaAnteriorRevisao: entrega.notaRevisada ?? entrega.notaFinal ?? null,
      revisadaPorId: professorId,
      revisadaEm: serverTimestamp(),
      status: 'revisado'
    }, { merge: true });
  }, [entregas]);

  const corrigirEntrega = useCallback(async (entregaId, atividade) => {
    const entrega = entregas.find(e => e.id === entregaId);
    if (!entrega || !atividade) return;

    setCorrigindo(entregaId);
    try {
      let resultado;

      if (atividade.questoes?.length > 0) {
        resultado = await corrigirAtividade({
          questoes: atividade.questoes,
          respostas: entrega.respostas || {},
          materialTexto: atividade.materialApoio?.textoExtraido || ''
        });

        await setDoc(doc(db, 'entregas', entregaId), {
          resultados: resultado.resultados,
          notaFinal: resultado.notaFinal,
          modeloIA: resultado.modelo,
          corrigidoEm: serverTimestamp(),
          status: 'corrigido'
        }, { merge: true });
      } else {
        // Legado: atividade sem questoes (enunciado/gabarito)
        resultado = await corrigirAtividade({
          enunciado: atividade.enunciado,
          gabarito: atividade.gabarito,
          respostaTexto: entrega.respostaTexto || '',
          notaMaxima: atividade.notaMaxima || 10,
          imagens: []
        });

        await setDoc(doc(db, 'entregas', entregaId), {
          notaIA: resultado.notaIA,
          notaFinal: resultado.notaFinal,
          feedback: resultado.feedback,
          criterios: resultado.criterios,
          modeloIA: resultado.modelo,
          corrigidoEm: serverTimestamp(),
          status: 'corrigido'
        }, { merge: true });
      }

      return resultado;
    } catch (err) {
      console.error('Erro na correção por IA:', err);
      await setDoc(doc(db, 'entregas', entregaId), { status: 'erro_correcao' }, { merge: true });
      throw err;
    } finally {
      setCorrigindo(null);
    }
  }, [entregas]);

  return { entregas, corrigindo, overrideNota, corrigirEntrega };
}
