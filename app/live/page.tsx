import type { Metadata } from 'next'

import LiveClient from './LiveClient'

<img
  src="/logo-electionlive.png"
/>

export const metadata: Metadata = {

  title:
    'Scrutinio Live | Elezioni Comunali Polizzi Generosa | Election Live',

  description:
    'Sistema di scrutinio elettorale live in tempo reale per le elezioni comunali di Polizzi Generosa. Beta version realizzata da Daniele Russo.'
}

export default function Page() {

  return <LiveClient />
}