export const ErroView = ({ tipo, dataEntrega }) => {
  const mensagens = {
    token_invalido: {
      titulo: 'Link inválido',
      texto: 'Este link não é válido ou expirou. Verifique se a URL está correta.'
    },
    prazo_encerrado: {
      titulo: 'Prazo encerrado',
      texto: dataEntrega
        ? `O prazo para esta atividade encerrou em ${dataEntrega}. Não é mais possível enviar respostas.`
        : 'O prazo para esta atividade está encerrado. Não é mais possível enviar respostas.'
    },
    atividade_nao_encontrada: {
      titulo: 'Atividade não encontrada',
      texto: 'Esta atividade não existe ou foi removida pelo professor.'
    },
    erro_carregamento: {
      titulo: 'Erro ao carregar',
      texto: 'Ocorreu um erro ao carregar a atividade. Tente novamente mais tarde.'
    }
  };

  const msg = mensagens[tipo] || mensagens.token_invalido;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-sm animate-card-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-lg font-bold text-ink-950 mb-2">{msg.titulo}</h1>
        <p className="text-sm text-slate-400">{msg.texto}</p>
      </div>
    </div>
  );
};
