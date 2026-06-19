const BASE_URL = '/api-maritaca';
const MODEL = 'sabiazinho-4';

async function callAI(content, apiKey) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 1024, messages: [{ role: 'user', content }] })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Maritaca API error ${res.status}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  if (!text) throw new Error('Maritaca retornou resposta vazia');
  return text;
}

function buildDiscursivaPrompt(questao, resposta, materialTexto) {
  let prompt = `Você é um professor corretor do Ensino Médio. Corrija a resposta do aluno com rigor e clareza.

ENUNCIADO DA QUESTÃO:
${questao.enunciado}`;

  if (materialTexto?.trim()) {
    prompt += `\n\nMATERIAL DE APOIO (use como referência para correção):\n${materialTexto.slice(0, 6000)}`;
  }

  if (questao.rubrica?.trim()) {
    prompt += `\n\nRUBRICA DE CORREÇÃO:\n${questao.rubrica}`;
  }

  prompt += `\n\nRESPOSTA DO ALUNO:\n${resposta?.trim() || '(aluno não respondeu)'}

NOTA MÁXIMA DESTA QUESTÃO: ${questao.notaMaxima}

INSTRUÇÕES:
- Atribua uma nota de 0 a ${questao.notaMaxima} (pode usar 1 casa decimal)
- Escreva feedback construtivo em 2-4 frases dirigido ao aluno
- Liste os critérios de avaliação

Retorne APENAS JSON válido, sem blocos markdown:
{"nota": 0, "feedback": "...", "criterios": [{"nome": "...", "pontos_obtidos": 0, "pontos_maximos": 0}]}`;

  return prompt.trim();
}

async function corrigirDiscursiva(questao, resposta, materialTexto, apiKey) {
  const content = [{ type: 'text', text: buildDiscursivaPrompt(questao, resposta, materialTexto) }];

  if (questao.imagens?.length > 0) {
    for (const img of questao.imagens) {
      if (img.url) {
        content.push({ type: 'image_url', image_url: { url: img.url } });
      }
    }
  }

  const text = await callAI(content, apiKey);
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('IA não retornou JSON válido. Resposta: ' + text.slice(0, 200));

  const parsed = JSON.parse(match[0]);
  if (typeof parsed.nota !== 'number') throw new Error('Campo "nota" inválido na resposta da IA');

  return {
    notaObtida: Math.min(Math.max(Number(parsed.nota), 0), questao.notaMaxima),
    feedback: String(parsed.feedback || '').trim(),
    criterios: Array.isArray(parsed.criterios) ? parsed.criterios : []
  };
}

function corrigirObjetiva(questao, resposta) {
  const correto = resposta?.trim().toUpperCase() === questao.gabarito?.toUpperCase();
  return {
    notaObtida: correto ? questao.notaMaxima : 0,
    correto,
    feedback: correto
      ? 'Resposta correta!'
      : `Resposta incorreta. Alternativa correta: ${questao.gabarito}.`
  };
}

async function corrigirMultiQuestao({ questoes, respostas, materialTexto = '' }) {
  const apiKey = import.meta.env.VITE_MARITACA_API_KEY;
  if (!apiKey) throw new Error('VITE_MARITACA_API_KEY não configurada no .env');

  const resultados = {};
  let notaFinal = 0;

  for (const questao of questoes) {
    const resposta = respostas?.[questao.id]?.resposta ?? '';
    const resultado = questao.tipo === 'objetiva'
      ? corrigirObjetiva(questao, resposta)
      : await corrigirDiscursiva(questao, resposta, materialTexto, apiKey);

    resultados[questao.id] = { ...resultado, notaMaxima: questao.notaMaxima };
    notaFinal = Math.round((notaFinal + resultado.notaObtida) * 100) / 100;
  }

  return { resultados, notaFinal, modelo: MODEL };
}

async function corrigirLegacy({ enunciado, gabarito, respostaTexto, notaMaxima, imagens = [] }) {
  const apiKey = import.meta.env.VITE_MARITACA_API_KEY;
  if (!apiKey) throw new Error('VITE_MARITACA_API_KEY não configurada no .env');
  if (!enunciado?.trim()) throw new Error('Enunciado obrigatório');
  if (!gabarito?.trim()) throw new Error('Gabarito obrigatório');

  const questao = { enunciado, rubrica: gabarito, notaMaxima: notaMaxima || 10, imagens };
  const resultado = await corrigirDiscursiva(questao, respostaTexto, '', apiKey);

  return {
    notaIA: resultado.notaObtida,
    notaFinal: resultado.notaObtida,
    feedback: resultado.feedback,
    criterios: resultado.criterios,
    modelo: MODEL
  };
}

export const corrigirAtividade = async (params) => {
  if (params.questoes) return corrigirMultiQuestao(params);
  return corrigirLegacy(params);
};

export async function sugerirRubrica(questao, materialTexto = '') {
  const apiKey = import.meta.env.VITE_MARITACA_API_KEY;
  if (!apiKey) throw new Error('VITE_MARITACA_API_KEY não configurada no .env');

  let prompt = `Você é um professor experiente do Ensino Médio criando a rubrica de correção para uma questão discursiva.

ENUNCIADO DA QUESTÃO:
${questao.enunciado}`;

  if (materialTexto?.trim()) {
    prompt += `\n\nMATERIAL DE APOIO (use como base dos critérios):\n${materialTexto.slice(0, 4000)}`;
  }

  prompt += `

NOTA MÁXIMA: ${questao.notaMaxima} pontos

Crie de 3 a 5 critérios de avaliação claros e objetivos. A soma deve ser exatamente ${questao.notaMaxima} pontos.

Retorne SOMENTE os critérios, sem introdução, sem markdown. Use exatamente este formato:
X.X pts — Nome: Descrição do que o aluno deve demonstrar para obter estes pontos.

Exemplo:
0.5 pts — Identificação do tema: O aluno identifica corretamente o tema central e demonstra entender o contexto.
0.8 pts — Argumentação: Apresenta ao menos dois argumentos fundamentados no conteúdo estudado.`;

  return (await callAI([{ type: 'text', text: prompt }], apiKey)).trim();
}
