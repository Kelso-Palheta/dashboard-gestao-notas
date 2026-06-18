import { useState, useCallback } from 'react';
import {
  createAtividade as fbCreate,
  updateAtividade as fbUpdate,
  deleteAtividade as fbDelete,
  listAtividades as fbList,
  createTokensForAtividade,
  syncAlunoLogin,
  syncNotasAluno,
  syncSingleNotasAluno
} from '../firebase/firestore-atividades';

export function useAtividades(professorId) {
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAtividades = useCallback(async (turmaId) => {
    if (!professorId || !turmaId) return;
    setLoading(true);
    try {
      const list = await fbList(professorId, turmaId);
      setAtividades(list);
    } catch (err) {
      console.error('Erro ao carregar atividades:', err);
    } finally {
      setLoading(false);
    }
  }, [professorId]);

  const createAtividade = useCallback(async (data) => {
    if (!professorId) throw new Error('Usuário não autenticado');

    const atvData = {
      ...data,
      professorId,
      status: 'ativa'
    };

    const id = await fbCreate(atvData);

    // Cria tokens para todos os alunos das turmas vinculadas
    for (const turmaId of data.turmaIds) {
      if (data.alunosPorTurma?.[turmaId]) {
        await createTokensForAtividade(id, turmaId, data.alunosPorTurma[turmaId]);
      }
    }

    return id;
  }, [professorId]);

  const updateAtividade = useCallback(async (id, data) => {
    await fbUpdate(id, data);
  }, []);

  const deleteAtividade = useCallback(async (id, onRemoveFromMapa) => {
    await fbDelete(id);
    if (onRemoveFromMapa) onRemoveFromMapa(id);
  }, []);

  const publicarNotas = useCallback(async (turma) => {
    if (!professorId) return;
    await syncNotasAluno(professorId, turma.id, turma);
  }, [professorId]);

  const publicarNotaAluno = useCallback(async (turmaId, alunoId, bimestres) => {
    if (!professorId) return;
    await syncSingleNotasAluno(professorId, turmaId, alunoId, bimestres);
  }, [professorId]);

  const syncLogin = useCallback(async (aluno, turmaId) => {
    if (!professorId) return;
    return syncAlunoLogin(professorId, aluno, turmaId);
  }, [professorId]);

  return {
    atividades,
    loading,
    loadAtividades,
    createAtividade,
    updateAtividade,
    deleteAtividade,
    publicarNotas,
    publicarNotaAluno,
    syncLogin
  };
}
