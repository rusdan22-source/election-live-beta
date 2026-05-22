'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'

// =====================================
// TYPES
// =====================================

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

// =====================================
// PAGE
// =====================================

export default function LiveTVPage() {

// =====================================
// STATE
// =====================================

const [slide, setSlide] =
  useState(0)

const [progress, setProgress] =
  useState(100)

const [autoPlay, setAutoPlay] =
  useState(true)

const [preferenze, setPreferenze] =
  useState<any[]>([])

const [seggi, setSeggi] =
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

  // =====================================
  // LOAD DATI
  // =====================================

  async function caricaDati() {

    // =====================================
    // SCHEDE
    // =====================================

    const schedeQuery = await supabase

      .from('schede_scrutinate')

      .select('*')

    const schede =
      schedeQuery.data || []
setTotaliSchede(schede)

// =====================================
// ULTIME SCHEDE
// =====================================

const ultimeQuery = await supabase

  .from('schede_scrutinate')

.select(`
  *,
  seggio:seggio_id (
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

const ultimeData =
  ultimeQuery.data || []

setUltimeSchede(ultimeData)

    // =====================================
    // TOTALI
    // =====================================

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

    // =====================================
    // SEGGI
    // =====================================

    const seggiQuery = await supabase

      .from('seggi')

      .select('*')

    const seggiData =
      seggiQuery.data || []

    const seggiStats = seggiData.map(
      (seggio: any) => {

        const scrutinate = schede.filter(
          (s) => s.seggio_id === seggio.id
        ).length

        const percentuale =

          seggio.totale_votanti > 0

          ? (
              scrutinate /
              seggio.totale_votanti
            ) * 100

          : 0

        return {

          ...seggio,

          scrutinate,

          percentuale
        }
      }
    )

    setSeggi(seggiStats)

    // =====================================
    // TUTTI I CANDIDATI
    // =====================================

    const candidatiQuery = await supabase

      .from('candidati')

      .select('*')

    const tuttiCandidati =
      candidatiQuery.data || []

    // =====================================
    // PREFERENZE REALI
    // =====================================

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

    // =====================================
    // MAPPA
    // =====================================

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

    // =====================================
    // AGGIUNGI VOTI
    // =====================================

    raw.forEach((p: any) => {

      const candidato =
        p.candidato

      if (!candidato) return

      if (!map[candidato.id]) return

      map[candidato.id].voti++
    })

    // =====================================
    // CLASSIFICA
    // =====================================

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

  // =====================================
  // INIT
  // =====================================

  useEffect(() => {

    caricaDati()

    const channel = supabase

      .channel('tv-live')

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

  // =====================================
  // AUTO SLIDES
  // =====================================

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

  // =====================================
  // FILTRI
  // =====================================

  const lista1 = preferenze.filter(
    (p) => p.lista_id === 1
  )

  const lista2 = preferenze.filter(
    (p) => p.lista_id === 2
  )

  // =====================================
  // UI
  // =====================================

  return (

    <main className="
      h-screen
      bg-black
      text-white
      p-6
      overflow-hidden
      select-none
      cursor-none
    ">

      {/* PROGRESS */}

      <div className="
        w-full
        h-2
        bg-zinc-800
        rounded-full
        overflow-hidden
        mb-6
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

      {/* ===================================== */}
      {/* SLIDE 0 */}
      {/* ===================================== */}

      {slide === 0 && (

        <div>

          <h1 className="
            text-5xl
            xl:text-6xl
            font-black
            mb-4
          ">
            SCRUTINIO LIVE
          </h1>

          {/* TOP */}

          <div className="
            grid
            grid-cols-4
            gap-3
            mb-3
          ">

            <Card
              title="Totale"
              value={totali.totale}
              color="#18181B"
            />

            <Card
              title="Valide"
              value={totali.valide}
              color="#1D4ED8"
            />

            <Card
              title="Bianche"
              value={totali.bianche}
              color="#FFFFFF"
              dark
            />

            <Card
              title="Nulle"
              value={totali.nulle}
              color="#3F3F46"
            />

          </div>

          {/* LISTE */}

          <div className="
            grid
            grid-cols-2
            gap-3
            mb-3
          ">

            <Card
              title="Totale voti Lista 1"
              value={totali.lista1}
              color="#14532D"
            />

            <Card
              title="Totale voti Lista 2"
              value={totali.lista2}
              color="#991B1B"
            />

          </div>

{/* SEGGI */}

<div className="
  grid
  grid-cols-4
  gap-3
  mb-3
">

  {seggi.map((seggio: any) => {

    // =====================================
    // VOTI NEL SEGGIO
    // =====================================

    const schedeSeggio =

      totaliSchede.filter(
        (s: any) =>
          s.seggio_id === seggio.id
      )

    const votiLoVerde =

      schedeSeggio.filter(
        (s: any) =>
          s.sindaco_id === 1
      ).length

    const votiLibrizzi =

      schedeSeggio.filter(
        (s: any) =>
          s.sindaco_id === 2
      ).length

    const verdeVince =
      votiLoVerde >= votiLibrizzi

    const colore =
      verdeVince
        ? '#14532D'
        : '#991B1B'

    const leader =
      verdeVince
        ? 'LO VERDE'
        : 'LIBRIZZI'

    return (

      <div

        key={seggio.id}

        className="
          rounded-3xl
          p-4
          border-2
        "

        style={{
          borderColor: colore,
          background: '#111111'
        }}
      >

        {/* HEADER */}

        <div className="
          flex
          items-center
          justify-between
          mb-3
        ">

          <h2 className="
            text-xl
            font-black
          ">
            {seggio.nome}
          </h2>

          <div className="
            text-lg
            font-black
          ">
            {seggio.scrutinate}
            /
            {seggio.totale_votanti}
          </div>

        </div>

        {/* BARRA */}

        <div className="
          w-full
          h-3
          bg-black/40
          rounded-full
          overflow-hidden
          mb-3
        ">

          <div

            className="
              h-full
              rounded-full
            "

            style={{
              width: `${seggio.percentuale}%`,
              background: colore
            }}
          />

        </div>

        {/* FOOTER */}

        <div className="
          flex
          items-center
          justify-between
        ">

          <div

            className="
              text-2xl
              font-black
            "

            style={{
              color: colore
            }}
          >
            {seggio.percentuale.toFixed(1)}%
          </div>

          <div

            className="
              px-3
              py-1
              rounded-xl
              text-sm
              font-black
            "

            style={{
              background: colore
            }}
          >
            {leader}
          </div>

        </div>

      </div>
    )
  })}

</div>

          {/* SINDACI */}

          <div className="
            grid
            grid-cols-3
            gap-3
          ">

            <SindacoCard
              nome="Gandolfo Lo Verde"
              voti={totali.loverde}
              colore="#14532D"
              percentuale={
                totali.valide > 0
                  ? (totali.loverde /
                    totali.valide) * 100
                  : 0
              }
            />

            <SindacoCard
              nome="Gandolfo Librizzi"
              voti={totali.librizzi}
              colore="#991B1B"
              percentuale={
                totali.valide > 0
                  ? (totali.librizzi /
                    totali.valide) * 100
                  : 0
              }
            />
<LiveLog
  ultimeSchede={ultimeSchede}
/>
          </div>

        </div>

      )}

      {/* ===================================== */}
      {/* SLIDE 1 */}
      {/* ===================================== */}

      {slide === 1 && (

        <ClassificaSlide
          titolo="PREFERENZE — LISTA 1"
          totale={`Totale voti lista 1: ${totali.lista1}`}
          colore="#14532D"
          data={lista1}
        />

      )}

      {/* ===================================== */}
      {/* SLIDE 2 */}
      {/* ===================================== */}

      {slide === 2 && (

        <ClassificaSlide
          titolo="PREFERENZE — LISTA 2"
          totale={`Totale voti lista 2: ${totali.lista2}`}
          colore="#991B1B"
          data={lista2}
        />

      )}

      {/* ===================================== */}
      {/* SLIDE 3 */}
      {/* ===================================== */}

      {slide === 3 && (

        <TotalePreferenzeSlide
          data={preferenze}
        />

      )}

      {/* CONTROLLI */}

      <div className="
        fixed
        bottom-6
        left-1/2
        -translate-x-1/2
        flex
        items-center
        gap-3
        z-50
      ">

        <button

          onClick={() => {

            setSlide((prev) =>

              prev === 0
                ? 3
                : prev - 1
            )
          }}

          className="
            bg-zinc-800
            rounded-2xl
            px-6
            py-4
            text-3xl
            font-black
          "
        >
          ⬅️
        </button>

        <button

          onClick={() =>

            setAutoPlay(!autoPlay)
          }

          className={`
            rounded-2xl
            px-8
            py-4
            text-3xl
            font-black

            ${autoPlay

              ? 'bg-green-600'

              : 'bg-red-600'
            }
          `}
        >
          {autoPlay
            ? '⏸️'
            : '▶️'}
        </button>

        <button

          onClick={() => {

            setSlide((prev) =>

              (prev + 1) % 4
            )
          }}

          className="
            bg-zinc-800
            rounded-2xl
            px-6
            py-4
            text-3xl
            font-black
          "
        >
          ➡️
        </button>

      </div>

    </main>
  )
}

function LiveLog({

  ultimeSchede

}: any) {

  return (

    <div className="
      bg-zinc-900
      rounded-3xl
      p-4
      overflow-hidden
    ">

      <div className="
        flex
        items-center
        justify-between
        mb-4
      ">

        <h2 className="
          text-2xl
          font-black
        ">
          ULTIME SCHEDE
        </h2>

        <div className="
          w-3
          h-3
          rounded-full
          bg-green-500
          animate-pulse
        " />

      </div>

      <div className="
        grid
        gap-2
      ">

        {ultimeSchede.map(
          (scheda: any) => {

            const colore =
              scheda.sindaco_id === 1
                ? '#14532D'
                : scheda.sindaco_id === 2
                  ? '#991B1B'
                  : '#3F3F46'

            let testo = ''

const preferenze =

  scheda.preferenze_scheda
    ?.map((p: any) =>

      p.candidato?.nome
    )

    .filter(Boolean)

    .join(' • ')

            if (scheda.tipo === 'bianca') {
              testo = 'SCHEDA BIANCA'
            }

            else if (scheda.tipo === 'nulla') {
              testo = 'SCHEDA NULLA'
            }

            else if (
              scheda.sindaco_id === 1
            ) {
              testo = 'LO VERDE'
            }

            else {
              testo = 'LIBRIZZI'
            }

            return (

              <div

                key={scheda.id}

                className="
                  rounded-2xl
                  p-3
                  text-sm
                "

                style={{
                  background: colore
                }}
              >

                <div className="
                  flex
                  items-center
                  justify-between
                  mb-1
                ">

                  <div className="
                    font-black
                  ">
                    {scheda.seggio?.nome}
                  </div>

                  <div className="
                    opacity-70
                  ">
                  {new Date(
  scheda.created_at
).toLocaleTimeString('it-IT')}
                  </div>

                </div>

<div className="
  font-bold
  mb-1
">
  {testo}
</div>

{scheda.tipo === 'valida' && (

  <div className="
    text-xs
    opacity-80
    font-semibold
  ">

    {scheda.lista_id === 1
      ? 'LISTA 1'
      : 'LISTA 2'}

    {preferenze && (
      <>
        {' — '}
        {preferenze}
      </>
    )}

  </div>

)}

<div className="
  text-[11px]
  opacity-60
  mt-1
">

  {new Date(
    scheda.created_at
  ).toLocaleTimeString('it-IT')}

</div>

              </div>
            )
          }
        )}

      </div>

    </div>
  )
}

// =====================================
// CARD
// =====================================

function Card({

  title,

  value,

  color,

  dark

}: any) {

  return (

    <div

      className="
        rounded-3xl
        p-4
        min-h-[120px]
        flex
        flex-col
        justify-center
      "

      style={{
        background: color,
        color: dark
          ? 'black'
          : 'white'
      }}
    >

      <p className="
        text-lg
        opacity-70
        mb-2
      ">
        {title}
      </p>

      <h2 className="
        text-4xl
        xl:text-5xl
        font-black
      ">
        {value}
      </h2>

    </div>
  )
}

// =====================================
// SINDACO CARD
// =====================================

function SindacoCard({

  nome,

  voti,

  colore,

  percentuale

}: any) {

  return (

    <div

      className="
        rounded-3xl
        p-6
      "

      style={{
        background: colore
      }}
    >

      <p className="
        text-2xl
        opacity-80
        mb-3
      ">
        {nome}
      </p>

      <h2 className="
        text-6xl
        xl:text-7xl
        font-black
        mb-4
      ">
        {voti}
      </h2>

      <div className="
        w-full
        h-5
        bg-black/30
        rounded-full
        overflow-hidden
      ">

        <div

          className="
            h-full
            bg-white
          "

          style={{
            width: `${percentuale}%`
          }}
        />

      </div>

      <p className="
        text-2xl
        font-black
        mt-3
      ">
        {percentuale.toFixed(1)}%
      </p>

    </div>
  )
}

// =====================================
// CLASSIFICA
// =====================================

function ClassificaSlide({

  titolo,

  totale,

  colore,

  data

}: any) {

  const left =
    data.slice(0, 5)

  const right =
    data.slice(5, 10)

  return (

    <div>

      <h1

        className="
          text-5xl
          xl:text-6xl
          font-black
          mb-2
        "

        style={{
          color: colore
        }}
      >
        {titolo}
      </h1>

      <div

        className="
          inline-block
          rounded-2xl
          px-5
          py-3
          text-2xl
          font-black
          mb-6
        "

        style={{
          background: colore
        }}
      >
        {totale}
      </div>

      <div className="
        grid
        grid-cols-2
        gap-3
      ">

        <div className="grid gap-3">

          {left.map(
            (candidato: any, index: number) => (

              <RankingCard
                key={candidato.id}
                candidato={candidato}
                colore={colore}
                index={index + 1}
              />
            )
          )}

        </div>

        <div className="grid gap-3">

          {right.map(
            (candidato: any, index: number) => (

              <RankingCard
                key={candidato.id}
                candidato={candidato}
                colore={colore}
                index={index + 6}
              />
            )
          )}

        </div>

      </div>

    </div>
  )
}

// =====================================
// TOTALE PREFERENZE
// =====================================

function TotalePreferenzeSlide({

  data

}: any) {

  const left =
    data.slice(0, 5)

  const right =
    data.slice(5, 10)

  return (

    <div>

      <h1 className="
        text-5xl
        xl:text-6xl
        font-black
        mb-8
      ">
        TOTALE PREFERENZE
      </h1>

      <div className="
        grid
        grid-cols-2
        gap-3
      ">

        <div className="grid gap-3">

          {left.map(
            (candidato: any, index: number) => (

              <RankingCard
                key={candidato.id}
                candidato={candidato}
                colore={
                  candidato.lista_id === 1
                    ? '#14532D'
                    : '#991B1B'
                }
                index={index + 1}
              />
            )
          )}

        </div>

        <div className="grid gap-3">

          {right.map(
            (candidato: any, index: number) => (

              <RankingCard
                key={candidato.id}
                candidato={candidato}
                colore={
                  candidato.lista_id === 1
                    ? '#14532D'
                    : '#991B1B'
                }
                index={index + 6}
              />
            )
          )}

        </div>

      </div>

    </div>
  )
}

// =====================================
// RANKING CARD
// =====================================

function RankingCard({

  candidato,

  colore,

  index

}: any) {

  return (

    <div

      className="
        rounded-3xl
        p-4
        flex
        items-center
        justify-between
        min-h-[88px]
        gap-4
        overflow-hidden
      "

      style={{
        background: colore
      }}
    >

      <div className="
        flex
        items-center
        gap-4
        min-w-0
      ">

        <div className="
          w-12
          h-12
          rounded-xl
          bg-black/30
          flex
          items-center
          justify-center
          text-xl
          font-black
          shrink-0
        ">
          {index}
        </div>

        <h2 className="
          text-xl
          xl:text-2xl
          font-black
          leading-tight
          break-words
          pr-4
        ">
          {candidato.nome}
        </h2>

      </div>

      <div className="
        text-4xl
        font-black
        shrink-0
      ">
        {candidato.voti}
      </div>

    </div>
  )
}