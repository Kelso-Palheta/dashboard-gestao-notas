export const encodeToken = (alunoId, activityId) => {
  const payload = `${alunoId}:${activityId}`;
  return btoa(unescape(encodeURIComponent(payload)));
};

export const decodeToken = (token) => {
  try {
    const decoded = decodeURIComponent(escape(atob(token)));
    const [alunoId, activityId] = decoded.split(':');
    if (!alunoId || !activityId) return null;
    return { alunoId, activityId };
  } catch {
    return null;
  }
};
