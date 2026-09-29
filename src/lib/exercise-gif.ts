export function exerciseGifUrl(id?: string | null) {
  if (!id) return null;
  return `https://raw.githubusercontent.com/mohamedatef90/exercise-library/main/gifs/${id}.gif`;
}
