import { db } from './config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { gerarLoginKey } from '../utils/loginAluno';

/**
 * Lê a atividade sem expor o campo gabarito.
 * IMPORTANTE: esta função é usada na página do aluno — nunca incluir gabarito.
 */
export async function getAtividadePublica(activityId) {
  const snap = await getDoc(doc(db, 'atividades', activityId));
  if (!snap.exists()) return null;
  const data = snap.data();
  // Remove gabarito antes de retornar para o client do aluno
  const { gabarito, ...publicData } = data;
  return publicData;
}

export async function submitEntrega({ activityId, alunoId, turmaId, bimestre, respostaTexto }) {
  const entregaId = `${activityId}_${alunoId}`;
  const ref = doc(db, 'entregas', entregaId);
  await setDoc(ref, {
    activityId,
    alunoId,
    turmaId,
    bimestre,
    respostaTexto,
    status: 'entregue',
    submittedAt: serverTimestamp()
  });
  return entregaId;
}

export async function getEntrega(activityId, alunoId) {
  const entregaId = `${activityId}_${alunoId}`;
  const snap = await getDoc(doc(db, 'entregas', entregaId));
  return snap.exists() ? { ...snap.data(), id: snap.id } : null;
}

export async function validarLoginAluno(login) {
  const loginKey = await gerarLoginKey(login);
  const snap = await getDoc(doc(db, 'alunoLogin', loginKey));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function getNotasAluno(recordId) {
  const snap = await getDoc(doc(db, 'notasAluno', recordId));
  if (!snap.exists()) return null;
  return snap.data();
}
