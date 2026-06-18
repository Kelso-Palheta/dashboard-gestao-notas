export const ConfirmacaoView = ({ submittedAt }) => {
  const data = submittedAt?.toDate ? submittedAt.toDate() : new Date();
  const dataStr = data.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-sm animate-card-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-lg font-bold text-ink-950 mb-2">Entrega recebida!</h1>
        <p className="text-sm text-slate-400 mb-6">
          Sua resposta foi enviada em {dataStr}.<br />
          Em breve você verá sua nota e o feedback aqui.
        </p>
        <p className="text-xs text-slate-400">
          Você pode recarregar esta página para verificar se a correção já foi concluída.
        </p>
      </div>
    </div>
  );
};
