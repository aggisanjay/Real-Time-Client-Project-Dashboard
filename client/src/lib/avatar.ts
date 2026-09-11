export const AVATAR_COLORS = [
  '#4B5563', // slate
  '#57F287', // green
  '#FEE75C', // yellow
  '#ED4245', // red
  '#EB459E', // pink
  '#3BA55D', // dark green
  '#FAA81A', // orange
  '#00D4AA', // teal
  '#593695', // purple
  '#206694', // dark blue
];

export function getAvatarColor(name: string): string {
  if (!name) return AVATAR_COLORS[0];
  const charCode = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[charCode % AVATAR_COLORS.length];
}
