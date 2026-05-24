import type { Metadata } from 'next'

import SezioneClient from './SezioneClient'

export async function generateMetadata(
  { params }: any
): Promise<Metadata> {

  return {

    title:
      `Sezione ${params.id} | Election Live`,

    description:
      'Sistema scrutinio elettorale live per le elezioni comunali - Beta version - Realizzato da Daniele Russo'
  }
}

export default function Page(
  { params }: any
) {

  return (

    <SezioneClient
      sezioneId={Number(params.id)}
    />
  )
}