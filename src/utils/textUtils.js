/**
 * Limpa texto copiado de PDF: remove quebras de linha no meio de parágrafos,
 * mantendo apenas quebras reais de parágrafo (linha em branco entre blocos).
 *
 * PDF: linha quebrada por margem/coluna → " " (espaço)
 * Parágrafo real (linha em branco) → "\n\n"
 */
export function cleanPdfText(text) {
  if (!text) return '';

  // Normaliza \r\n e \r para \n
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Divide em blocos de parágrafo (separados por 1+ linha em branco)
  const blocks = normalized.split(/\n{2,}/);

  return blocks
    .map(block =>
      block
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join(' ')          // junta as linhas do mesmo parágrafo com espaço
        .replace(/\s+/g, ' ') // remove espaços duplos internos
        .trim()
    )
    .filter(block => block.length > 0)
    .join('\n\n');
}
