import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

const LOCAL_KEY = 'dashboard_turmas_v2';

export async function loadTurmas(userId) {
  try {
    const ref = doc(db, 'users', userId, 'turmas', 'data');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      // cache local
      if (data.turmas) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(data.turmas));
      }
      return data.turmas || [];
    }
    return null; // null = sem dados no Firestore
  } catch (err) {
    console.error('Erro ao carregar turmas do Firestore:', err);
    // fallback para localStorage
    return null;
  }
}

let saveTimer = null;
export function saveTurmas(userId, turmas) {
  // cache local imediato
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(turmas));
  } catch {}

  // debounce Firestore writes (max 1 por segundo)
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      const ref = doc(db, 'users', userId, 'turmas', 'data');
      await setDoc(ref, { turmas, updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.error('Erro ao salvar turmas no Firestore:', err);
    }
  }, 1000);
}

export async function migrateFromLocalStorage(userId) {
  try {
    const ref = doc(db, 'users', userId, 'turmas', 'data');
    const snap = await getDoc(ref);

    if (snap.exists()) {
      // Firestore já tem dados → retorna eles
      const data = snap.data();
      if (data.turmas) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(data.turmas));
      }
      return data.turmas || [];
    }

    // Firestore vazio → tenta migrar do localStorage
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const turmas = JSON.parse(raw);
      await setDoc(ref, { turmas, updatedAt: serverTimestamp() });
      return turmas;
    }

    return null; // nada em lugar nenhum
  } catch (err) {
    console.error('Erro na migração:', err);
    return null;
  }
}
