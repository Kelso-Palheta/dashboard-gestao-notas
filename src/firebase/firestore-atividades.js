import { db } from './config';
import {
  doc, collection, setDoc, getDoc, getDocs, deleteDoc,
  query, where, serverTimestamp, writeBatch
} from 'firebase/firestore';
import { gerarLoginAluno, gerarLoginKey } from '../utils/loginAluno';
import { encodeToken } from '../utils/tokenUtils';

export async function createAtividade(data) {
  const id = `atv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const ref = doc(db, 'atividades', id);
  await setDoc(ref, {
    ...data,
    id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return id;
}

export async function updateAtividade(id, data) {
  const ref = doc(db, 'atividades', id);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteAtividade(id) {
  const ref = doc(db, 'atividades', id);
  await deleteDoc(ref);

  const entregasSnap = await getDocs(
    query(collection(db, 'entregas'), where('activityId', '==', id))
  );
  const batch = writeBatch(db);
  entregasSnap.forEach((docSnap) => batch.delete(docSnap.ref));

  const tokensSnap = await getDocs(collection(db, 'atividades', id, 'tokens'));
  tokensSnap.forEach((docSnap) => batch.delete(docSnap.ref));

  await batch.commit();
}

export async function listAtividades(professorId, turmaId) {
  const q = query(
    collection(db, 'atividades'),
    where('professorId', '==', professorId),
    where('turmaIds', 'array-contains', turmaId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
}

export async function getAtividade(id) {
  const snap = await getDoc(doc(db, 'atividades', id));
  return snap.exists() ? { ...snap.data(), id: snap.id } : null;
}

export async function createTokensForAtividade(activityId, turmaId, alunos) {
  const batch = writeBatch(db);
  for (const aluno of alunos) {
    const token = encodeToken(aluno.id, activityId);
    const ref = doc(db, 'atividades', activityId, 'tokens', aluno.id);
    batch.set(ref, {
      token,
      nome: aluno.nome,
      turmaId,
      alunoId: aluno.id
    });
  }
  await batch.commit();
}

export async function getTokenInfo(activityId, alunoId) {
  const snap = await getDoc(doc(db, 'atividades', activityId, 'tokens', alunoId));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function syncAlunoLogin(professorUid, aluno, turmaId) {
  if (!aluno.dataNascimento) return null;

  const login = gerarLoginAluno(aluno.nome, aluno.dataNascimento);
  const loginKey = await gerarLoginKey(login);

  const ref = doc(db, 'alunoLogin', loginKey);
  await setDoc(ref, {
    alunoId: aluno.id,
    professorUid,
    turmaId,
    nome: aluno.nome,
    login
  }, { merge: true });

  return login;
}

export async function removeAlunoLogin(aluno) {
  if (!aluno.dataNascimento) return;
  const login = gerarLoginAluno(aluno.nome, aluno.dataNascimento);
  const loginKey = await gerarLoginKey(login);
  await deleteDoc(doc(db, 'alunoLogin', loginKey));
}

export async function syncNotasAluno(professorUid, turmaId, turma) {
  const batch = writeBatch(db);
  for (const aluno of turma.alunos) {
    const recordId = `${professorUid}_${turmaId}_${aluno.id}`;
    const ref = doc(db, 'notasAluno', recordId);
    batch.set(ref, {
      nome: aluno.nome,
      bimestres: turma.bimestres,
      atualizadoEm: serverTimestamp()
    }, { merge: true });
  }
  await batch.commit();
}

export async function syncSingleNotasAluno(professorUid, turmaId, alunoId, bimestres) {
  const recordId = `${professorUid}_${turmaId}_${alunoId}`;
  const ref = doc(db, 'notasAluno', recordId);
  await setDoc(ref, {
    bimestres,
    atualizadoEm: serverTimestamp()
  }, { merge: true });
}
