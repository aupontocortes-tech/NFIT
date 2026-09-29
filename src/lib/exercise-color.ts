const exerciseColors = [
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#eab308",
  "#06b6d4",
  "#ec4899",
  "#a855f7",
  "#e50914",
];

export function exerciseColor(index: number) {
  return exerciseColors[index % exerciseColors.length];
}
