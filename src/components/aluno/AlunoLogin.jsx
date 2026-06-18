import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validarLoginAluno } from '../../firebase/firestore-aluno';

export default function AlunoLogin() {
  const [login, setLogin] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valor = login.trim().toLowerCase();
    if (!valor) return;

    setErro('');
    setLoading(true);

    try {
      const dados = await validarLoginAluno(valor);
      if (!dados) {
        setErro('Login não encontrado. Verifique seu nome e data de nascimento.');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('aluno_login', JSON.stringify({
        login: valor,
        nome: dados.nome,
        alunoId: dados.alunoId,
        turmaId: dados.turmaId,
        professorUid: dados.professorUid
      }));

      navigate('/aluno/notas');
    } catch (err) {
      console.error('Erro ao validar login:', err);
      setErro('Erro ao validar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-card-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-tr from-violet-700 to-violet-400 flex items-center justify-center text-white text-sm font-extrabold shadow-glow">
            N
          </div>
          <h1 className="text-lg font-bold text-ink-950">Consulta de Notas</h1>
          <p className="text-sm text-slate-400 mt-1">
            Digite seu login para acessar suas notas.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-ink-950 mb-1.5">
              Login
            </label>
            <input
              type="text"
              value={login}
              onChange={(e) => { setLogin(e.target.value); setErro(''); }}
              placeholder="Ex: kelso0407"
              className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-sm text-ink-950 placeholder-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-violet-400/50 transition-all duration-300 input-glow"
              autoFocus
              disabled={loading}
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Seu primeiro nome + dia e mês de nascimento.<br />
              Exemplo: KELSO PALHETA nascido em 07/04 → <strong>kelso0407</strong>
            </p>
          </div>

          {erro && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-xs text-red-500">{erro}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!login.trim() || loading}
            className="w-full py-3 bg-violet-500 hover:bg-violet-400 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-xl text-white text-sm font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] btn-3d-primary"
          >
            {loading ? 'Verificando...' : 'Acessar Notas'}
          </button>
        </form>
      </div>
    </div>
  );
}
