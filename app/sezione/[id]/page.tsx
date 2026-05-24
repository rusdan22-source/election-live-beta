import type { Metadata } from 'next'

import SezioneClient from './SezioneClient'

type Props = {

  params: Promise<{
    id: string
  }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {

  const resolvedParams =
    await params

  return {

    title:
      `Sezione ${resolvedParams.id} | Election Live`,

    description:
      'Sistema scrutinio elettorale live per le elezioni comunali - Beta version - Realizzato da Daniele Russo'
  }
}

export default async function Page(
  { params }: Props
) {

  const resolvedParams =
    await params


}