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

  const [visible, setVisible] =
    useState(true)

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
    10000,
    5000
  ]

const [preScrutinio, setPreScrutinio] =
  useState(true)

  async function caricaDati() {

const impostazioniQuery = await supabase

  .from('impostazioni')

  .select(`
    scrutinio_aperto,
    modalita_pre_scrutinio
  `)

  .single()

setPreScrutinio(
  impostazioniQuery.data
    ?.modalita_pre_scrutinio ?? true
)

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

    table: 'impostazioni'
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

  setVisible(true)

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

  // FADE OUT

  const fadeTimer = setTimeout(() => {

    setVisible(false)

  }, duration - 700)

  // NEXT SLIDE

  const slideTimer = setTimeout(() => {

    setSlide((prev) =>

      (prev + 1) % 5
    )

    setVisible(true)

  }, duration)

  return () => {

    clearTimeout(slideTimer)

    clearTimeout(fadeTimer)

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

if (preScrutinio) {

  return (

    <main className="
      h-screen
      bg-black
      flex
      items-center
      justify-center
      overflow-hidden
      relative
    ">

     {/* LIVE DOT OVER LOGO */}

<div className="
  absolute
  top-[18%]
  left-198
  -translate-x-[-235px]
  -translate-y-1/2
  z-0
">

  {/* OUTER PULSE */}

  <div className="
    absolute
    w-16
    h-16
    rounded-full
    bg-red-500/25
    animate-ping
  " />

  {/* INNER DOT */}

  <div className="
    relative
    rounded-full
    shadow-[0_0_25px_rgba(239,68,68,0.9)]
  " />

</div>
      {/* CONTENT */}

      <div className="
        flex
        flex-col
        items-center
        text-center
      ">

<img

  src="/logo-electionlive.png"

  alt="Election Live"

  className="
    relative
    z-20

    w-[700px]
    max-w-[90vw]

    animate-[logoPulse_3s_ease-in-out_infinite]

    mb-10
    select-none
    pointer-events-none
  "
/>

        <h1 className="
          text-4xl
          xl:text-6xl
          font-black
          text-white
          mb-4
          italic
          uppercase
        ">
          Lo scrutinio inizierà a breve
        </h1>

        <p className="
          text-zinc-500
          text-xl
          xl:text-2xl
          italic
        ">
          Hai giusto il tempo di un caffè...
        </p>

      </div>

    </main>
  )
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

<div

  className={`
    transition-opacity
    duration-700

    ${visible

      ? 'opacity-100'

      : 'opacity-0'
    }
  `}
>

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

      
{slide === 4 && (

  <div className="
    h-190
    flex
    items-center
    justify-center
    px-10
  ">

    <div className="
      max-w-7xl
      rounded-[40px]
      border
      border-zinc-800
      bg-zinc-950
      p-10
      text-center
      shadow-2xl
    ">

      {/* LIVE BADGE */}

      <div className="
        inline-flex
        items-center
        gap-3
        bg-red-600/20
        border
        border-red-500/40
        rounded-full
        px-6
        py-3
        mb-8
      ">

        <div className="
          w-4
          h-4
          rounded-full
          bg-red-500
          animate-pulse
        " />

        <span className="
          text-4xl
          font-black
          tracking-wide
          text-red-400
        ">
          SCRUTINIO LIVE
        </span>

      </div>

      {/* TITLE */}

      <h1 className="
        text-4xl
        xl:text-6xl
        font-black
        leading-tight
        mb-6
      ">

        Sistema realtime indipendente
        <br />
        di monitoraggio elettorale

      </h1>

      {/* TEXT */}

      <div className="
        text-zinc-300
        text-xl
        xl:text-2xl
        leading-relaxed
        space-y-5
      ">

        <p>
          I dati mostrati sono raccolti
          e sincronizzati in tempo reale
          a scopo puramente informativo.
        </p>

        <p>
          Le informazioni visualizzate
          possono differire dai dati
          ufficiali, la piattaforma è
          operatore dipendente,
          ogni errore umano può influenzare
          i risultati visualizzati.
        </p>
      </div>

      {/* FOOTER */}

      <div className="
        mt-10
        text-zinc-500
        text-lg
        font-bold
      ">
<p>
        ElectionLive • Polizzi Generosa 2026
</p>
<p>Beta version — Piattaforma sperimentale realizzata da Daniele Russo.</p>
      </div>

    </div>

  </div>

)}
</div>

      <LiveControls

        autoPlay={autoPlay}

        setAutoPlay={setAutoPlay}

        setSlide={setSlide}

        setVisible={setVisible}
      />

    </main>
  )
}