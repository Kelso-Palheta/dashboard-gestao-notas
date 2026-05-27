import { useState, useEffect, useCallback } from 'react';
import { normalizeNome, cleanNome, genId } from '../utils/calculos';

const KEY = 'dashboard_turmas_v2';

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== null) return JSON.parse(raw);
  } catch {}
  return null;
};

const saveToStorage = (turmas) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(turmas));
  } catch {}
};

export const useTurmas = () => {
  const [turmas, setTurmas] = useState(() => {
    const saved = loadFromStorage();
    return saved !== null ? saved : [];
  });

  useEffect(() => {
    saveToStorage(turmas);
  }, [turmas]);

  const addTurma = useCallback((nome) => {
    const id = `turma-${nome.trim().replace(/\s+/g, '-').toLowerCase()}-${genId()}`;
    const bimestres = {};
    [1, 2, 3, 4].forEach((b) => {
      bimestres[String(b)] = { atividades: [], notas: {} };
    });
    setTurmas((prev) => [...prev, { id, nome: nome.trim(), alunos: [], bimestres }]);
    return id;
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
