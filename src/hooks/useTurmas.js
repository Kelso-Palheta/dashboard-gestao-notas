import { useState, useEffect, useCallback, useRef } from 'react';
import { normalizeNome, cleanNome, genId } from '../utils/calculos';
import { turmasIniciais } from '../data/turmasIniciais';

const LOCAL_KEY = 'dashboard_turmas_v2';

const getLocalTurmas = () => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw !== null) return JSON.parse(raw);
  } catch {}
  return null;
};

export const useTurmas = (initialTurmas, persistTurmas) => {
  const [turmas, setTurmas] = useState(() => {
    // priority: Firestore (from login) > localStorage > default initial data
    if (initialTurmas && initialTurmas.length > 0) return initialTurmas;
    const local = getLocalTurmas();
    if (local && local.length > 0) return local;
    return turmasIniciais;
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    // skip first render (state already initialized)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // sync to Firestore + localStorage cache
    if (persistTurmas) {
      persistTurmas(turmas);
    }
  }, [turmas, persistTurmas]);

  // When initialTurmas loads after login, update state if turmas is still empty/default
  useEffect(() => {
    if (initialTurmas && initialTurmas.length > 0) {
      setTurmas((prev) => {
        // only override if current state is the default initial data and different from Firestore
        const prevIds = prev.map(t => t.id).sort().join(',');
        const cloudIds = initialTurmas.map(t => t.id).sort().join(',');
        if (prevIds !== cloudIds) {
          return initialTurmas;
        }
        return prev;
      });
    }
  }, [initialTurmas]);

  const addTurma = useCallback((nome) => {
    const id = `turma-${nome.trim().replace(/\s+/g, '-').toLowerCase()}-${genId()}`;
    const bimestres = {};
    [1, 2, 3, 4].forEach((b) => {
      bimestres[String(b)] = { atividades: [], notas: {} };
    });
    const nova = { id, nome: nome.trim(), alunos: [], bimestres };
    setTurmas((prev) => [...prev, nova]);
    return nova;
  }, []);

  const removeTurma = useCallback((turmaId) => {
    setTurmas((prev) => prev.filter((t) => t.id !== turmaId));
  }, []);

  const addAlunos = useCallback((turmaId, nomesNovos) => {
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== turmaId) return t;
        const existentesNormalizados = new Set(t.alunos.map((a) => normalizeNome(a.nome)));
        const novos = nomesNovos
          .filter((n) => {
            const norm = normalizeNome(n);
            if (existentesNormalizados.has(norm)) return false;
            existentesNormalizados.add(norm);
            return true;
          })
          .map((nome) => ({ id: `al_${genId()}`, nome: cleanNome(nome) }));
        return { ...t, alunos: [...t.alunos, ...novos] };
      })
    );
  }, []);

  const removeAluno = useCallback((turmaId, alunoId) => {
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== turmaId) return t;
        const alunos = t.alunos.filter((a) => a.id !== alunoId);
        const bimestres = {};
        Object.entries(t.bimestres).forEach(([b, dados]) => {
          const notas = { ...dados.notas };
          delete notas[alunoId];
          bimestres[b] = { ...dados, notas };
        });
        return { ...t, alunos, bimestres };
      })
    );
  }, []);

  const removeAlunos = useCallback((turmaId, alunoIds) => {
    const idsSet = new Set(alunoIds);
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== turmaId) return t;
        const alunos = t.alunos.filter((a) => !idsSet.has(a.id));
        const bimestres = {};
        Object.entries(t.bimestres).forEach(([b, dados]) => {
          const notas = { ...dados.notas };
          alunoIds.forEach((alId) => {
            delete notas[alId];
          });
          bimestres[b] = { ...dados, notas };
        });
        const recuperacao = { ...(t.recuperacao || {}) };
        alunoIds.forEach((alId) => { delete recuperacao[alId]; });
        return { ...t, alunos, bimestres, recuperacao };
      })
    );
  }, []);

  const setRecuperacao = useCallback((turmaId, alunoId, tipo, valor) => {
    setTurmas((prev) =>
      prev.map((t) => {
        if (t.id !== turmaId) return t;
        const recObj = t.recuperacao || {};
        const alunoRec = typeof recObj[alunoId] === 'object' ? recObj[alunoId] : {};
        const novoValor = valor === '' ? '' : Number(valor);

        return {
          ...t,
          recuperacao: {
            ...recObj,
            [alunoId]: {
              ...alunoRec,
              [tipo]: novoValor
            }
          }
        };
      })
    );
  }, []);

  return { turmas, setTurmas, addTurma, removeTurma, addAlunos, removeAluno, removeAlunos, setRecuperacao };
};
