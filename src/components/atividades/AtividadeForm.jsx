import { useState } from 'react';
import { extractTextFromPDF } from '../../utils/pdfExtractor';
import { uploadFile } from '../../utils/storageUtils';

const BIMESTRES = [1, 2, 3, 4];
const genId = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
const genAtvId = () => `atv_${genId()}`;
const genQId = () => `q_${genId()}`;

const novaQuestao = (tipo = 'discursiva') => ({
  id: genQId(),
  tipo,
  enunciado: '',
  notaMaxima: 2,
  rubrica: '',
  alternativas: [{ id: 'A', texto: '' }, { id: 'B', texto: '' }, { id: 'C', texto: '' }, { id: 'D', texto: '' }],
  gabarito: 'A',
  imagensLocais: [] // { file, preview } — antes de upload
});

function QuestaoEditor({ questao, index, total, onChange, onRemove }) {
  const update = (field, value) => onChange({ ...questao, [field]: value });

  const updateAlternativa = (altId, texto) => {
    onChange({ ...questao, alternativas: questao.alternativas.map(a => a.id === altId ? { ...a, texto } : a) });
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files || []);
    const novas = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
    onChange({ ...questao, imagensLocais: [...questao.imagensLocais, ...novas] });
    e.target.value = '';
  };

  const removeImagem = (i) => {
    const novas = questao.imagensLocais.filter((_, idx) => idx !== i);
    onChange({ ...questao, imagensLocais: novas });
  };

  return (
    <div className="border border-ink-600 rounded-xl p-4 mb-4 bg-white">
      {/* Header da questão */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded-full bg-violet-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{index + 1}</span>

        {/* Toggle tipo */}
        <div className="flex rounded-lg overflow-hidden border border-ink-600 text-xs font-semibold">
          {['discursiva', 'objetiva'].map(tipo => (
            <button
              key={tipo}
              type="button"
              onClick={() => update('tipo', tipo)}
              className={`px-3 py-1.5 capitalize transition-colors ${questao.tipo === tipo ? 'bg-violet-500 text-white' : 'bg-white text-slate-500 hover:bg-ink-700'}`}
            >
              {tipo}
            </button>
          ))}
        </div>

        <input
          type="number"
          value={questao.notaMaxima}
          onChange={(e) => update('notaMaxima', Number(e.target.value))}
          min="0.1" max="10" step="0.1"
          title="Nota máxima desta questão"
          className="w-20 ml-auto bg-ink-700 border border-ink-600 rounded-lg px-2 py-1.5 text-xs text-ink-950 text-center outline-none focus:ring-1 focus:ring-violet-400/50"
          placeholder="pts"
        />
        <span className="text-xs text-slate-400">pts</span>

        {total > 1 && (
          <button type="button" onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors ml-1 text-lg leading-none">&times;</button>
        )}
      </div>

      {/* Enunciado */}
      <textarea
        value={questao.enunciado}
        onChange={(e) => update('enunciado', e.target.value)}
        placeholder="Enunciado da questão..."
        rows={3}
        className="w-full bg-ink-700 border border-ink-600 rounded-xl px-3 py-2.5 text-sm text-ink-950 placeholder-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-violet-400/50 transition-all resize-y mb-3"
      />

      {/* Imagens */}
      <div className="mb-3">
        {questao.imagensLocais.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {questao.imagensLocais.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img.preview} alt="" className="h-20 w-auto rounded-lg border border-ink-600 object-cover" />
                <button
                  type="button"
                  onClick={() => removeImagem(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center leading-none"
                >&times;</button>
              </div>
            ))}
          </div>
        )}
        <label className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-500 cursor-pointer transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span>Adicionar imagem</span>
          <input type="file" accept="image/*" multiple onChange={handleImageAdd} className="hidden" />
        </label>
      </div>

      {/* Discursiva: rubrica */}
      {questao.tipo === 'discursiva' && (
        <div>
          <label className="block text-xs font-semibold text-amber-600 mb-1">
            🔒 Rubrica de correção <span className="text-slate-400 font-normal">(confidencial — só você e a IA verão)</span>
          </label>
          <textarea
            value={questao.rubrica}
            onChange={(e) => update('rubrica', e.target.value)}
            placeholder="Critérios de correção, pontos por seção, o que esperar na resposta ideal..."
            rows={3}
            className="w-full bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-sm text-ink-950 placeholder-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-amber-400/50 transition-all resize-y"
          />
        </div>
      )}

      {/* Objetiva: alternativas + gabarito */}
      {questao.tipo === 'objetiva' && (
        <div>
          <label className="block text-xs font-semibold text-ink-950 mb-2">Alternativas</label>
          <div className="space-y-2">
            {questao.alternativas.map((alt) => (
              <div key={alt.id} className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name={`gabarito-${questao.id}`}
                    checked={questao.gabarito === alt.id}
                    onChange={() => update('gabarito', alt.id)}
                    className="w-4 h-4 accent-violet-500"
                  />
                  <span className="text-xs font-bold text-violet-500 w-4">{alt.id}</span>
                </label>
                <input
                  type="text"
                  value={alt.texto}
                  onChange={(e) => updateAlternativa(alt.id, e.target.value)}
                  placeholder={`Alternativa ${alt.id}`}
                  className="flex-1 bg-ink-700 border border-ink-600 rounded-lg px-3 py-1.5 text-sm text-ink-950 placeholder-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-violet-400/50 transition-all"
                />
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">🔒 Selecione o gabarito (rádio) — não será exibido ao aluno</p>
        </div>
      )}
    </div>
  );
}

export const AtividadeForm = ({ turmas, onSave, onClose, initialData }) => {
  const isEdit = !!initialData;
  const [titulo, setTitulo] = useState(initialData?.titulo || '');
  const [bimestre, setBimestre] = useState(initialData?.bimestre || 1);
  const [turmaIds, setTurmaIds] = useState(initialData?.turmaIds || []);
  const [dataEntrega, setDataEntrega] = useState(() => {
    if (initialData?.dataEntrega?.toDate) return initialData.dataEntrega.toDate().toISOString().slice(0, 16);
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [questoes, setQuestoes] = useState(() =>
    initialData?.questoes?.length > 0
      ? initialData.questoes.map(q => ({ ...q, imagensLocais: [] }))
      : [novaQuestao('discursiva')]
  );
  const [materialFile, setMaterialFile] = useState(null);
  const [materialTextoExtraido, setMaterialTextoExtraido] = useState(initialData?.materialApoio?.textoExtraido || '');
  const [materialNome, setMaterialNome] = useState(initialData?.materialApoio?.nome || '');
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  const notaTotalMaxima = questoes.reduce((sum, q) => sum + (Number(q.notaMaxima) || 0), 0);

  const toggleTurma = (id) => setTurmaIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);

  const handlePDFSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMaterialFile(file);
    setMaterialNome(file.name);
    setMaterialTextoExtraido('');
    setExtracting(true);
    try {
      const texto = await extractTextFromPDF(file);
      setMaterialTextoExtraido(texto);
    } catch (err) {
      setErro('Erro ao extrair texto do PDF: ' + err.message);
    } finally {
      setExtracting(false);
    }
    e.target.value = '';
  };

  const updateQuestao = (index, novaQ) => {
    setQuestoes(prev => prev.map((q, i) => i === index ? novaQ : q));
  };

  const addQuestao = (tipo) => setQuestoes(prev => [...prev, novaQuestao(tipo)]);

  const removeQuestao = (index) => setQuestoes(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!titulo.trim()) { setErro('Título obrigatório.'); return; }
    if (turmaIds.length === 0) { setErro('Selecione ao menos uma turma.'); return; }
    if (!dataEntrega) { setErro('Data de entrega obrigatória.'); return; }
    if (questoes.length === 0) { setErro('Adicione ao menos uma questão.'); return; }

    for (let i = 0; i < questoes.length; i++) {
      const q = questoes[i];
      if (!q.enunciado.trim()) { setErro(`Questão ${i + 1}: enunciado obrigatório.`); return; }
      if (q.tipo === 'objetiva') {
        const preenchidas = q.alternativas.filter(a => a.texto.trim()).length;
        if (preenchidas < 2) { setErro(`Questão ${i + 1}: preencha ao menos 2 alternativas.`); return; }
      }
    }

    setSaving(true);
    try {
      const atvId = initialData?.id || genAtvId();

      // Upload imagens de cada questão
      const questoesFinais = await Promise.all(questoes.map(async (q) => {
        const imagens = [...(q.imagens || [])];

        if (q.imagensLocais?.length > 0) {
          for (let i = 0; i < q.imagensLocais.length; i++) {
            const { file } = q.imagensLocais[i];
            const path = `atividades/${atvId}/questoes/${q.id}/img_${i}_${Date.now()}`;
            const { url } = await uploadFile(file, path);
            imagens.push({ url, path });
          }
        }

        const { imagensLocais: _, ...questaoFinal } = q;
        return { ...questaoFinal, imagens };
      }));

      // Upload PDF se houver
      let materialApoio = initialData?.materialApoio || null;
      if (materialFile && materialTextoExtraido) {
        const path = `atividades/${atvId}/material/${materialNome}`;
        const { url } = await uploadFile(materialFile, path);
        materialApoio = { nome: materialNome, url, textoExtraido: materialTextoExtraido };
      } else if (materialTextoExtraido && !materialFile) {
        materialApoio = { ...(materialApoio || {}), textoExtraido: materialTextoExtraido, nome: materialNome };
      }

      const alunosPorTurma = {};
      for (const tid of turmaIds) {
        const turma = turmas.find(t => t.id === tid);
        if (turma) alunosPorTurma[tid] = turma.alunos || [];
      }

      await onSave({
        id: atvId,
        titulo: titulo.trim(),
        bimestre,
        turmaIds,
        notaMaxima: Math.round(notaTotalMaxima * 100) / 100,
        dataEntrega: new Date(dataEntrega),
        questoes: questoesFinais,
        ...(materialApoio ? { materialApoio } : {}),
        alunosPorTurma
      });

      onClose();
    } catch (err) {
      setErro(err.message || 'Erro ao salvar atividade.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-ink-600 max-h-[92vh] overflow-y-auto animate-card-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white p-5 border-b border-ink-600 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-950">{isEdit ? 'Editar Atividade' : 'Nova Atividade'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-ink-950 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Informações gerais */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-950 mb-1">Título *</label>
              <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={120}
                placeholder="Ex: Redação — A Amazônia no Século XXI"
                className="w-full bg-ink-700 border border-ink-600 rounded-xl px-3 py-2.5 text-sm text-ink-950 placeholder-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-violet-400/50 transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-950 mb-1">Bimestre *</label>
                <div className="grid grid-cols-4 gap-1">
                  {BIMESTRES.map(b => (
                    <button key={b} type="button" onClick={() => setBimestre(b)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all border ${bimestre === b ? 'bg-violet-500 text-white border-violet-400/20' : 'bg-ink-700 text-slate-400 hover:bg-ink-600 border-ink-600'}`}>
                      {b}º
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-950 mb-1">Data de entrega *</label>
                <input type="datetime-local" value={dataEntrega} onChange={(e) => setDataEntrega(e.target.value)}
                  className="w-full bg-ink-700 border border-ink-600 rounded-xl px-3 py-2.5 text-sm text-ink-950 outline-none focus:bg-white focus:ring-1 focus:ring-violet-400/50 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-950 mb-1">Turmas *</label>
              <div className="bg-ink-700 border border-ink-600 rounded-xl p-2 max-h-28 overflow-y-auto space-y-0.5">
                {turmas.length === 0 && <p className="text-xs text-slate-400 p-2">Nenhuma turma.</p>}
                {turmas.map(t => (
                  <label key={t.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors">
                    <input type="checkbox" checked={turmaIds.includes(t.id)} onChange={() => toggleTurma(t.id)}
                      className="w-4 h-4 rounded accent-violet-500" />
                    <span className="text-sm text-ink-950">{t.nome}</span>
                    <span className="text-xs text-slate-400">({t.alunos.length} alunos)</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Material de apoio */}
          <div className="border border-dashed border-ink-600 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-ink-950">Material de apoio para a IA</p>
                <p className="text-[10px] text-slate-400 mt-0.5">PDF do conteúdo — a IA usará como contexto na correção</p>
              </div>
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-700 hover:bg-ink-600 border border-ink-600 rounded-lg text-xs text-slate-400 hover:text-ink-950 cursor-pointer transition-all">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                {materialNome ? 'Trocar PDF' : 'Carregar PDF'}
                <input type="file" accept="application/pdf" onChange={handlePDFSelect} className="hidden" />
              </label>
            </div>

            {extracting && (
              <div className="flex items-center gap-2 text-xs text-violet-500 animate-pulse">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Extraindo texto do PDF...
              </div>
            )}

            {materialNome && !extracting && (
              <div className="flex items-center gap-2 text-xs">
                <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                <span className="text-ink-950 font-medium">{materialNome}</span>
                {materialTextoExtraido && <span className="text-slate-400">({Math.round(materialTextoExtraido.length / 1000)}k caracteres extraídos)</span>}
              </div>
            )}

            {!materialNome && !extracting && (
              <p className="text-xs text-slate-400 italic">Nenhum material carregado — opcional</p>
            )}
          </div>

          {/* Questões */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-ink-950">Questões *</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Nota total: <span className="font-bold text-violet-500">{notaTotalMaxima.toFixed(1).replace('.', ',')} pts</span></p>
              </div>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => addQuestao('discursiva')}
                  className="px-2.5 py-1.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-600 rounded-lg text-xs font-semibold transition-all">
                  + Discursiva
                </button>
                <button type="button" onClick={() => addQuestao('objetiva')}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 rounded-lg text-xs font-semibold transition-all">
                  + Objetiva
                </button>
              </div>
            </div>

            {questoes.map((q, i) => (
              <QuestaoEditor
                key={q.id}
                questao={q}
                index={i}
                total={questoes.length}
                onChange={(novaQ) => updateQuestao(i, novaQ)}
                onRemove={() => removeQuestao(i)}
              />
            ))}
          </div>

          {erro && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-xs text-red-500">{erro}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-ink-700 hover:bg-ink-600 border border-ink-600 rounded-xl text-sm text-slate-500 font-medium transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-violet-500 hover:bg-violet-400 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl text-white text-sm font-semibold transition-all btn-3d-primary">
              {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Atividade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
