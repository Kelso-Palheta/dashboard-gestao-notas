import * as XLSX from 'xlsx';
import { cleanNome } from './calculos';

const NOME_HINTS = ['nome', 'aluno', 'student', 'name', 'estudante'];

const detectNomeCol = (header) => {
  const lower = header.map((h) => String(h || '').toLowerCase().trim());
  for (const hint of NOME_HINTS) {
    const idx = lower.findIndex((h) => h.includes(hint));
    if (idx !== -1) return idx;
  }
  // fallback: col with longest avg string
  return lower.reduce((bestIdx, _, i, arr) => i === 0 ? 0 : bestIdx, 0);
};

export const importarXlsxOuCsv = (arquivo) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        if (!rows.length) return resolve([]);

        const [headerRow, ...dataRows] = rows;
        const colIdx = detectNomeCol(headerRow);

        const nomes = dataRows
          .map((r) => String(r[colIdx] || '').trim())
          .filter((n) => n.length > 3 && !/^\d+$/.test(n))
          .map(cleanNome);

        resolve([...new Set(nomes)]);
      } catch (err) {
        reject(new Error('Erro ao ler planilha: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsArrayBuffer(arquivo);
  });
