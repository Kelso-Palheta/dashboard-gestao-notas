import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { corrigirAtividade } from '../utils/correcaoIA';

export function useEntregas(activityId) {
  const [entregas, setEntregas] = useState([]);
  const [corrigindo, setCorrigindo] = useState(null); // entregaId sendo corrigida

  useEffect(() => {
    if (!activityId) return;

    const q = query(
      collection(db, 'entregas'),
      where('activityId', '==', activityId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      setEntregas(list);
    });

    return () => unsub();
  }, [activityId]);

  const overrideNota = useCallback(async (entregaId, novaNota, professorId) => {
    const entrega = entregas.find(e => e.id === entregaId);
    if (!entrega) return;

    const ref = doc(db, 'entregas', entregaId);
    await setDoc(ref, {
      notaRevisada: Number(novaNota),
      notaAnteriorRevisao: entrega.notaRevisada ?? entrega.notaFinal ?? null,
      revisadaPorId: professorId,
      revisadaEm: serverTimestamp(),
      status: 'revisado'
    }, { merge: true });
  }, [entregas]);

  /**
   * Aciona a correção por IA para uma entrega.
   * Roda no client do PROFESSOR — o aluno nunca acessa essa função.
   */
  const corrigirEntrega = useCallback(async (entregaId, atividade) => {
    const entrega = entregas.find(e => e.id === entregaId);
    if (!entrega || !atividade) return;

    setCorrigindo(entregaId);
    try {
      const resultado = await corrigirAtividade({
        enunciado: atividade.enunciado,
        gabarito: atividade.gabarito,
        respostaTexto: entrega.respostaTexto || '',
        notaMaxima: atividade.notaMaxima || 10,
        imagens: []
      });

      const ref = doc(db, 'entregas', entregaId);
      await setDoc(ref, {
        notaIA: resultado.notaIA,
        notaFinal: resultado.notaFinal,
        feedback: resultado.feedback,
        criterios: resultado.criterios,
        modeloIA: resultado.modelo,
        corrigidoEm: serverTimestamp(),
        status: 'corrigido'
      }, { merge: true });

      return resultado;
    } catch (err) {
      console.error('Erro na correção por IA:', err);

      const ref = doc(db, 'entregas', entregaId);
      await setDoc(ref, {
        status: 'erro_correcao'
      }, { merge: true });

      throw err;
    } finally {
      setCorrigindo(null);
    }
  }, [entregas]);

  return { entregas, corrigindo, overrideNota, corrigirEntrega };
}
