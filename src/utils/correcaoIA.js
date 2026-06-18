// Maritaca AI — correção automática de atividades
// Usa sabia-3 (mais capaz) via mesmo proxy do importIA.js

const BASE_URL = '/api-maritaca';
const MODEL    = 'sabiazinho-4';

const buildPrompt = (enunciado, gabarito, respostaTexto) => `
Você é um professor corretor do Ensino Médio. Avalie a resposta do aluno com rigor e clareza.

ENUNCIADO DA ATIVIDADE:
${enunciado}

GABARITO / RUBRICA DE CORREÇÃO:
${gabarito}

RESPOSTA DO ALUNO:
${respostaTexto || '(aluno não escreveu resposta textual)'}

INSTRUÇÕES:
- Atribua uma nota de 0 a 10 (pode usar 1 casa decimal, ex: 7.5)
- Escreva um feedback construtivo em português, de 2 a 4 frases, dirigido ao aluno
- Liste os critérios de avaliação usados com os pontos obtidos e máximos de cada um

Retorne APENAS um JSON válido, sem blocos de código markdown, exatamente neste formato:
{"nota":8.5,"feedback":"Sua resposta demonstrou boa compreensão do tema...","criterios":[{"nome":"Clareza e coesão","pontos_obtidos":2.5,"pontos_maximos":3},{"nome":"Conteúdo e argumentação","pontos_obtidos":4,"pontos_maximos":5},{"nome":"Conclusão","pontos_obtidos":2,"pontos_maximos":2}]}
`.trim();

const buildContent = (enunciado, gabarito, respostaTexto, imagens) => {
  const textoPrompt = buildPrompt(enunciado, gabarito, respostaTexto);

  if (!imagens || imagens.length === 0) {
    return [{ type: 'text', text: textoPrompt }];
  }

  // Inclui imagens para modelos com visão (sabia-3 suporta image_url)
  return [
    { type: 'text', text: textoPrompt },
    ...imagens.map((img) => ({
      type: 'image_url',
      image_url: { url: `data:${img.mediaType};base64,${img.base64}` }
    }))
  ];
};

const parseResposta = (text, notaMaxima) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Maritaca não retornou JSON válido. Resposta: ' + text.slice(0, 300));

  const parsed = JSON.parse(match[0]);

  if (typeof parsed.nota !== 'number') throw new Error('Campo "nota" ausente ou inválido na resposta da IA');
  if (typeof parsed.feedback !== 'string') throw new Error('Campo "feedback" ausente na resposta da IA');

  const notaIA    = Math.min(Math.max(Number(parsed.nota), 0), 10);
  const notaFinal = Math.round((notaIA / 10) * notaMaxima * 100) / 100;

  return {
    notaIA,
    notaFinal,
    feedback:  parsed.feedback.trim(),
    criterios: Array.isArray(parsed.criterios) ? parsed.criterios : [],
    modelo:    MODEL
  };
};

/**
 * Corrige uma resposta de aluno usando a Maritaca AI.
 *
 * @param {object} params
 * @param {string} params.enunciado    - Texto do enunciado da atividade
 * @param {string} params.gabarito     - Gabarito/rubrica de correção (confidencial — nunca exibir ao aluno)
 * @param {string} params.respostaTexto - Resposta textual do aluno
 * @param {number} params.notaMaxima   - Nota máxima configurada pelo professor (ex: 3.0)
 * @param {Array}  params.imagens      - Opcional: [{ base64, mediaType }] para respostas com imagem
 * @returns {Promise<{ notaIA, notaFinal, feedback, criterios, modelo }>}
 */
export const corrigirAtividade = async ({ enunciado, gabarito, respostaTexto, notaMaxima, imagens = [] }) => {
  const apiKey = import.meta.env.VITE_MARITACA_API_KEY;
  if (!apiKey) throw new Error('VITE_MARITACA_API_KEY não configurada no arquivo .env');
  if (!enunciado?.trim()) throw new Error('Enunciado é obrigatório para correção');
  if (!gabarito?.trim()) throw new Error('Gabarito é obrigatório para correção automática');

  const content = buildContent(enunciado, gabarito, respostaTexto, imagens);

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content }]
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Maritaca API error ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  if (!text) throw new Error('Maritaca retornou resposta vazia');

  return parseResposta(text, notaMaxima);
};
