const PALETTE: Array<[string, string]> = [
  ['#c7d2fe', '#3730a3'], ['#a5f3fc', '#155e75'], ['#fbcfe8', '#9d174d'], ['#bbf7d0', '#166534'],
  ['#fde68a', '#92400e'], ['#ddd6fe', '#5b21b6'], ['#fecaca', '#991b1b'], ['#bae6fd', '#075985'],
];

export function initials(nom: string): string {
  const parts = nom.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function avatarStyle(id: number): Record<string, string> {
  const [bg, fg] = PALETTE[Math.abs(id) % PALETTE.length];
  return { background: bg, color: fg };
}
