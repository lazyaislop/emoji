import { Suspense } from 'react'
import { EmojiGhView } from './features/github-emojis'

function GithubEmojiApp() {
  return <>
    <Suspense fallback={<p role="status">Loading GitHub emojis...</p>}>
      <EmojiGhView />
    </Suspense>
  </>
}

export default GithubEmojiApp
