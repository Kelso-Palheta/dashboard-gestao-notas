import { db } from './config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { gerarLoginKey } from '../utils/loginAluno';

export async function getAtividadePublica(activityId) {
  const snap = await getDoc(doc(db, 'atividades', activityId));
  if (!snap.exists()) return null;
  const data = { ...snap.data(), id: snap.id };

  // Remove campos confidenciais de atividades no formato legado
  delete data.gabarito;

  // Remove gabarito/rubrica de cada questão (novo formato)
  if (Array.isArray(data.questoes)) {
    data.questoes = data.questoes.map(({ gabarito: _g, rubrica: _r, ...rest }) => rest);
  }

  return data;
}

export async function submitEntrega({ activityId, alunoId, turmaId, bimestre, respostas, respostaTexto }) {
  const entregaId = `${activityId}_${alunoId}`;
  const ref = doc(db, 'entregas', entregaId);
  await setDoc(ref, {
    activityId,
    alunoId,
    turmaId,
    bimestre,
    // novo formato multi-questão
    ...(respostas != null ? { respostas } : {}),
    // legado
    ...(respostaTexto != null ? { respostaTexto } : {}),
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
