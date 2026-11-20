export async function getGhEmojiData(): Promise<Record<string, string> | undefined> {
  const ghEmojiUrl = 'https://api.github.com/emojis'
  const response = await fetch(ghEmojiUrl)
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`)
  }
  return await response.json()
}
