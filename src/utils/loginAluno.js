export const gerarLoginAluno = (nomeCompleto, dataNascimento) => {
  const primeiro = nomeCompleto
    .split(' ')[0]
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  return `${primeiro}${dataNascimento}`;
};

export const gerarLoginKey = async (login) => {
  const encoded = new TextEncoder().encode(login);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};
