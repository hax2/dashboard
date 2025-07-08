export const todayISO = () => new Date().toISOString().slice(0, 10);
export const daysAgo = (d: string | null) =>
  d ? Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000) : "never";
export const uuid = () => Math.random().toString(36).slice(2, 10) + Date.now();

export const debounce = (() => {
  const t: Record<string, ReturnType<typeof setTimeout>> = {};
  return (k: string, fn: () => void, ms = 300) => {
    clearTimeout(t[k]);
    t[k] = setTimeout(fn, ms);
  };
})();
