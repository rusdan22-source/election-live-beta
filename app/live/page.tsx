'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'

import LivePageSlide from '@/components/live/LivePageSlide'

import ClassificaSlide from '@/components/live/ClassificaSlide'

import LiveControls from '@/components/live/LiveControls'

type Totali = {

  totale: number

  valide: number

  bianche: number

  nulle: number

  loverde: number

  librizzi: number

  lista1: number

  lista2: number
}

export default function LivePage() {

  const [slide, setSlide] =
    useState(0)

  const [progress, setProgress] =
    useState(100)

  const [autoPlay, setAutoPlay] =
    useState(true)

  const [preferenze, setPreferenze] =
    useState<any[]>([])

  const [sezioni, setSezioni] =
    useState<any[]>([])

  const [totaliSchede, setTotaliSchede] =
    useState<any[]>([])

  const [ultimeSchede, setUltimeSchede] =
    useState<any[]>([])

  const [totali, setTotali] =

    useState<Totali>({

      totale: 0,

      valide: 0,

      bianche: 0,

      nulle: 0,

      loverde: 0,

      librizzi: 0,

      lista1: 0,

      lista2: 0
    })

  const durations = [
    20000,
    10000,
    10000,
    10000
  ]

  async function caricaDati() {

    const schedeQuery = await supabase

      .from('schede_scrutinate')

      .select('*')

    const schede =
      schedeQuery.data || []

    setTotaliSchede(schede)

    const ultimeQuery = await supabase

      .from('schede_scrutinate')

      .select(`
        *,
        sezione:seggio_id (
          nome
        ),
        preferenze_scheda (
          candidato:candidato_id (
            nome
          )
        )
      `)

      .order('created_at', {
        ascending: false
      })

      .limit(10)

    setUltimeSchede(
      ultimeQuery.data || []
    )

    const totale = schede.length

    const valide = schede.filter(
      (s) => s.tipo === 'valida'
    ).length

    const bianche = schede.filter(
      (s) => s.tipo === 'bianca'
    ).length

    const nulle = schede.filter(
      (s) => s.tipo === 'nulla'
    ).length

    const loverde = schede.filter(
      (s) => s.sindaco_id === 1
    ).length

    const librizzi = schede.filter(
      (s) => s.sindaco_id === 2
    ).length

    const lista1 = schede.filter(
      (s) => s.lista_id === 1
    ).length

    const lista2 = schede.filter(
      (s) => s.lista_id === 2
    ).length

    setTotali({

      totale,

      valide,

      bianche,

      nulle,

      loverde,

      librizzi,

      lista1,

      lista2
    })

    const sezioniQuery = await supabase

      .from('seggi')

      .select('*')

    const sezioniData =
      sezioniQuery.data || []

    const sezioniStats = sezioniData.map(
      (sezione: any) => {

        const scrutinate = schede.filter(
          (s) => s.seggio_id === sezione.id
        ).length

        const percentuale =

          sezione.totale_votanti > 0

            ? (
                scrutinate /
                sezione.totale_votanti
              ) * 100

            : 0

        return {

          ...sezione,

          scrutinate,

          percentuale
        }
      }
    )

    setSezioni(sezioniStats)

    const candidatiQuery = await supabase

      .from('candidati')

      .select('*')

    const tuttiCandidati =
      candidatiQuery.data || []

    const prefQuery = await supabase

      .from('preferenze_scheda')

      .select(`
        id,
        candidato:candidato_id (
          id,
          nome,
          lista_id
        )
      `)

    const raw = prefQuery.data || []

    const map: any = {}

    tuttiCandidati.forEach(
      (candidato: any) => {

        map[candidato.id] = {

          id: candidato.id,

          nome: candidato.nome,

          lista_id: candidato.lista_id,

          voti: 0
        }
      }
    )

    raw.forEach((p: any) => {

      const candidato =
        p.candidato

      if (!candidato) return

      if (!map[candidato.id]) return

      map[candidato.id].voti++
    })

    const classifica =

      Object.values(map)

        .sort((a: any, b: any) => {

          if (b.voti !== a.voti) {

            return b.voti - a.voti
          }

          return a.nome.localeCompare(
            b.nome
          )
        })

    setPreferenze(classifica)
  }

  useEffect(() => {

    caricaDati()

    const channel = supabase

      .channel('live')

      .on(

        'postgres_changes',

        {

          event: '*',

          schema: 'public',

          table: 'schede_scrutinate'
        },

        () => {

          caricaDati()
        }
      )

      .on(

        'postgres_changes',

        {

          event: '*',

          schema: 'public',

          table: 'preferenze_scheda'
        },

        () => {

          caricaDati()
        }
      )

      .subscribe()

    return () => {

      supabase.removeChannel(channel)
    }

  }, [])

  useEffect(() => {

    if (!autoPlay) return

    setProgress(100)

    const duration =
      durations[slide]

    const start = Date.now()

    const progressTimer = setInterval(() => {

      const elapsed =
        Date.now() - start

      const remaining =

        100 - (
          elapsed / duration
        ) * 100

      setProgress(
        Math.max(remaining, 0)
      )

    }, 100)

    const slideTimer = setTimeout(() => {

      setSlide((prev) =>

        (prev + 1) % 4
      )

    }, duration)

    return () => {

      clearTimeout(slideTimer)

      clearInterval(progressTimer)
    }

  }, [slide, autoPlay])

  const lista1 = preferenze.filter(
    (p) => p.lista_id === 1
  )

  const lista2 = preferenze.filter(
    (p) => p.lista_id === 2
  )

  function percentuale(
    voti: number
  ) {

    if (!totali.valide)
      return '0.0'

    return (

      (
        voti /
        totali.valide
      ) * 100

    ).toFixed(1)
  }

  return (

    <main className="
      h-screen
      bg-black
      text-white
      p-4 md:p-6
      overflow-hidden
      select-none
    ">

      <div className="
        w-full
        h-2
        bg-zinc-800
        rounded-full
        overflow-hidden
        mb-4 md:mb-6
      ">

        <div

          className="
            h-full
            bg-white
          "

          style={{
            width: `${progress}%`
          }}
        />

      </div>

      {slide === 0 && (

        <LivePageSlide

          totali={totali}

          seggi={sezioni}

          totaliSchede={totaliSchede}

          ultimeSchede={ultimeSchede}
        />

      )}

      {slide === 1 && (

        <ClassificaSlide
          titolo="PREFERENZE — LISTA 1 - Polizzi Futura"
          totale={`
${totali.lista1} voti
• ${percentuale(
  totali.lista1
)}%
`}
          colore="#14532D"
          data={lista1}
        />

      )}

      {slide === 2 && (

        <ClassificaSlide
          titolo="PREFERENZE — LISTA 2 - Costruire Comunità"
          totale={`
${totali.lista2} voti
• ${percentuale(
  totali.lista2
)}%
`}
          colore="#991B1B"
          data={lista2}
        />

      )}

      {slide === 3 && (

        <ClassificaSlide
          titolo="TOTALE PREFERENZE"
          totale={`Totale preferenze: ${preferenze.length}`}
          colore="#27272A"
          data={preferenze}
        />

      )}

      <LiveControls

        autoPlay={autoPlay}

        setAutoPlay={setAutoPlay}

        setSlide={setSlide}
      />

    </main>
  )
}