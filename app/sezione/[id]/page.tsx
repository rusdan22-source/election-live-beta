'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// =====================================
// TYPES
// =====================================

type Sindaco = {
  id: number
  nome: string
  colore: string
}

type Lista = {
  id: number
  nome: string
  colore: string
  numero: number
  sindaco_id: number
}

type Candidato = {
  id: number
  nome: string
  genere: string
  lista_id: number
}




export default function SezionePage() {

  // =====================================
  // URL PARAM
  // =====================================

  const [sezioneId, setSezioneId] =
    useState<number | null>(null)

  const [sezioneValida, setSezioneValida] =
    useState<boolean | null>(null)

// =====================================
// PAGE
// =====================================

useEffect(() => {

  if (!sezioneId) return

  document.title =
    `Sezione ${sezioneId} | Election Live`

}, [sezioneId])

  // =====================================
  // STATE
  // =====================================

  const [step, setStep] =
    useState(1)

  const [loading, setLoading] =
    useState(false)

  const [salvata, setSalvata] =
    useState(false)

  const [sindaci, setSindaci] =
    useState<Sindaco[]>([])

  const [liste, setListe] =
    useState<Lista[]>([])

  const [candidati, setCandidati] =
    useState<Candidato[]>([])

  const [preferenze, setPreferenze] =
    useState<Candidato[]>([])

  const [sindacoScelto, setSindacoScelto] =
    useState<Sindaco | null>(null)

  const [listaScelta, setListaScelta] =
    useState<Lista | null>(null)

  const [scrutinioAperto, setScrutinioAperto] =
    useState(true)

  const [totaleVotanti, setTotaleVotanti] =
    useState(0)

  const [schedeScrutinate, setSchedeScrutinate] =
    useState(0)

  const [sezioneCompletata, setSezioneCompletata] =
    useState(false)

  // =====================================
  // GET URL PARAM
  // =====================================

  useEffect(() => {

    const path =
      window.location.pathname

    const id =
      path.split('/').pop()

    setSezioneId(Number(id))

  }, [])

  // =====================================
  // LOAD DATA
  // =====================================

  async function caricaDati() {

    if (sezioneId === null) return

    // CHECK SEZIONE

    const sezioneQuery = await supabase

      .from('seggi')

      .select('*')

      .eq('id', sezioneId)

      .single()

    if (sezioneQuery.error) {

      setSezioneValida(false)

      return
    }

    setSezioneValida(true)

    const sezione = sezioneQuery.data

    setTotaleVotanti(
      sezione.totale_votanti || 0
    )

    // SINDACI

    const sindaciQuery = await supabase

      .from('sindaci')

      .select('*')

      .order('id')

    if (sindaciQuery.data) {

      setSindaci(
        sindaciQuery.data
      )
    }

    // LISTE

    const listeQuery = await supabase

      .from('liste')

      .select('*')

      .order('numero')

    if (listeQuery.data) {

      setListe(
        listeQuery.data
      )
    }

    const conteggioQuery = await supabase

      .from('schede_scrutinate')

      .select('*', {
        count: 'exact',
        head: true
      })

      .eq('seggio_id', sezioneId)

    const totaleSchede =

      conteggioQuery.count || 0

    setSchedeScrutinate(
      totaleSchede
    )

    if (

      sezione.totale_votanti > 0 &&

      totaleSchede >=
      sezione.totale_votanti

    ) {

      setSezioneCompletata(true)

    } else {

      setSezioneCompletata(false)
    }

    // IMPOSTAZIONI

    const { data: impostazioni } =
      await supabase

        .from('impostazioni')

        .select(
          'scrutinio_aperto'
        )

        .limit(1)

    setScrutinioAperto(

      impostazioni?.[0]
        ?.scrutinio_aperto ?? true
    )
  }

  // =====================================
  // EFFECT
  // =====================================

  useEffect(() => {

    if (sezioneId === null) return

    caricaDati()

    // REALTIME

    const channel = supabase

      .channel(
        'realtime-impostazioni'
      )

      .on(

        'postgres_changes',

        {

          event: 'UPDATE',

          schema: 'public',

          table: 'impostazioni'
        },

        (payload) => {

          setScrutinioAperto(

            payload.new
              .scrutinio_aperto
          )
        }
      )

      .subscribe()

    return () => {

      supabase.removeChannel(
        channel
      )
    }

  }, [sezioneId])

  // =====================================
  // LOAD CANDIDATI
  // =====================================

  async function caricaCandidati(
    listaId: number
  ) {

    const { data, error } = await supabase

      .from('candidati')

      .select('*')

      .eq('lista_id', listaId)

      .order('nome')

    if (error) {

      console.error(error)

      return
    }

    setCandidati(data || [])
  }

  // =====================================
  // RESET
  // =====================================

  function resetScheda() {

    setPreferenze([])

    setCandidati([])

    setListaScelta(null)

    setSindacoScelto(null)

    setStep(1)
  }

  // =====================================
  // FEEDBACK
  // =====================================

  function mostraFeedbackSalvataggio() {

    setSalvata(true)

    setTimeout(() => {

      setSalvata(false)

    }, 1200)
  }

  // =====================================
  // SALVA SCHEDA SPECIALE
  // =====================================

  async function salvaSchedaSpeciale(
    tipo: 'bianca' | 'nulla'
  ) {

    if (sezioneCompletata) {

      alert(
        'Sezione completata'
      )

      return
    }

    if (!scrutinioAperto) {

      alert(
        'Scrutinio chiuso'
      )

      return
    }

    setLoading(true)

    const { error } = await supabase

      .from('schede_scrutinate')

      .insert({

        seggio_id: sezioneId,

        tipo
      })

    setLoading(false)

    if (error) {

      console.error(error)

      return
    }

    resetScheda()

    mostraFeedbackSalvataggio()

    await caricaDati()
  }

  // =====================================
  // SALVA SCHEDA
  // =====================================

  async function salvaScheda() {

    if (sezioneCompletata) {

      alert(
        'Sezione completata'
      )

      return
    }

    if (!scrutinioAperto) {

      alert(
        'Scrutinio chiuso'
      )

      return
    }

    if (!sindacoScelto) return

    if (!listaScelta) return

    setLoading(true)

    // CREA SCHEDA

    const { data, error } = await supabase

      .from('schede_scrutinate')

      .insert({

        seggio_id: sezioneId,

        tipo: 'valida',

        sindaco_id: sindacoScelto.id,

        lista_id: listaScelta.id

      })

      .select()

      .single()

    if (error) {

      setLoading(false)

      console.error(error)

      return
    }

    // SALVA PREFERENZE

    for (const candidato of preferenze) {

      const { error } = await supabase

        .from('preferenze_scheda')

        .insert({

          scheda_id: data.id,

          candidato_id: candidato.id
        })

      if (error) {
        console.error(error)
      }
    }

    setLoading(false)

    resetScheda()

    mostraFeedbackSalvataggio()

    await caricaDati()
  }

  // =====================================
  // TOGGLE PREFERENZA
  // =====================================

  function togglePreferenza(
    candidato: Candidato
  ) {

    const esiste = preferenze.find(
      (p) => p.id === candidato.id
    )

    // REMOVE

    if (esiste) {

      setPreferenze((prev) =>

        prev.filter(
          (p) => p.id !== candidato.id
        )
      )

      return
    }

    // MAX 2

    if (preferenze.length >= 2) {
      return
    }

    // ADD

    setPreferenze((prev) => [
      ...prev,
      candidato
    ])
  }

  // =====================================
  // VALIDAZIONE
  // =====================================

  const erroreGenere =

    preferenze.length === 2 &&

    preferenze[0].genere ===
    preferenze[1].genere

  const puoConfermare = !erroreGenere

  // =====================================
  // STEP 1
  // =====================================

  if (sezioneValida === null) {

    return (

      <main className="
        min-h-screen
        bg-black
        text-white
        flex
        items-center
        justify-center
      ">

        <div className="
          text-4xl
          font-black
        ">
          Caricamento...
        </div>

      </main>
    )
  }

  if (sezioneValida === false) {

    return (

      <main className="
        min-h-screen
        bg-black
        text-white
        flex
        items-center
        justify-center
        p-6
      ">

        <div className="
          text-center
        ">

          <h1 className="
            text-4xl
            md:text-6xl
            font-black
            mb-6
            text-red-500
          ">
            SEZIONE NON VALIDA
          </h1>

          <p className="
            text-xl
            md:text-2xl
            text-zinc-400
          ">
            Questa sezione non esiste
          </p>

        </div>

      </main>
    )
  }

  // =====================================
  // STEP 1 UI
  // =====================================

  if (step === 1) {

    return (

      <main className="min-h-screen bg-black text-white p-4 md:p-6">

        <div className="max-w-5xl px-2 mx-auto">

          {/* FEEDBACK */}

          {salvata && (

            <div className="
              bg-green-600
              text-white
              rounded-3xl
              p-6
              md:p-8
              mb-8
              text-center
              text-2xl
              md:text-3xl
              font-black
            ">
              ✅ SCHEDA SALVATA
            </div>

          )}

          {/* HEADER */}

          <div className="mb-12">

            <h1 className="
              text-3xl
              md:text-7xl
              font-black
              mb-3
            ">
              SEZIONE {sezioneId}
            </h1>

            {sezioneCompletata && (

              <div className="
                mt-4
                inline-block
                bg-green-600
                text-white
                rounded-2xl
                px-6
                py-3
                text-xl
                md:text-2xl
                font-black
              ">

                ✅ SEZIONE COMPLETATA

              </div>

            )}

            <p className="
              text-zinc-500
              text-xl
              md:text-2xl
            ">
              Seleziona il tipo di scheda
            </p>

          </div>

          {/* SINDACI */}

          <div className="grid md:grid-cols-2 gap-6 mb-10">

            {sindaci.map((sindaco) => (

              <button

                key={sindaco.id}

                onClick={() => {

                  setSindacoScelto(sindaco)

                  setStep(2)
                }}

                className="
                  rounded-3xl
                  p-5 md:p-10
                  text-left
                  transition-all
                  hover:scale-[1.02]
                "

                style={{
                  background: sindaco.colore
                }}
              >

                <p className="text-lg md:text-xl opacity-80 mb-3">
                  Candidato Sindaco
                </p>

                <h2 className="text-2xl md:text-5xl font-black leading-tight">
                  {sindaco.nome}
                </h2>

              </button>

            ))}

          </div>

          {/* BIANCA / NULLA */}

          <div className="grid md:grid-cols-2 gap-6">

            <button

              disabled={loading}

              onClick={() =>
                salvaSchedaSpeciale('bianca')
              }

              className="
                bg-white
                text-black
                rounded-3xl
                p-5 md:p-10
                text-left
                transition-all
                hover:scale-[1.02]
                disabled:opacity-40
              "
            >

              <p className="text-lg md:text-xl opacity-70 mb-3">
                Scheda
              </p>

              <h2 className="text-2xl md:text-5xl font-black">
                BIANCA
              </h2>

            </button>

            <button

              disabled={loading}

              onClick={() =>
                salvaSchedaSpeciale('nulla')
              }

              className="
                bg-zinc-800
                text-white
                rounded-3xl
                p-5 md:p-10
                text-left
                transition-all
                hover:scale-[1.02]
                disabled:opacity-40
              "
            >

              <p className="text-lg md:text-xl opacity-70 mb-3">
                Scheda
              </p>

              <h2 className="text-2xl md:text-5xl font-black">
                NULLA
              </h2>

            </button>

          </div>

        </div>

        {/* STATO SCRUTINIO */}

        <div className="mt-8">

          <div

            className={`
              w-full
              rounded-3xl
              p-6
              text-center
              text-xl
              md:text-3xl
              font-black

              ${scrutinioAperto

                ? 'bg-green-600 text-white'

                : 'bg-red-600 text-white'
              }
            `}
          >

            {scrutinioAperto

              ? '🟢 SCRUTINIO APERTO'

              : '🔴 SCRUTINIO CHIUSO'
            }

          </div>

        </div>

      </main>
    )
  }

  // =====================================
  // STEP 2
  // =====================================

  if (step === 2) {

    return (

      <main className="min-h-screen bg-black text-white p-4 md:p-6">

        <div className="max-w-5xl px-2 mx-auto">

          {/* HEADER */}

          <div

            className="
              rounded-3xl
              p-5 md:p-6
              mb-10
            "

            style={{
              background: sindacoScelto?.colore
            }}
          >

            <p className="text-base md:text-lg opacity-80 mb-2">
              Sindaco selezionato
            </p>

            <h1 className="
              text-3xl
              md:text-5xl
              font-black
            ">
              {sindacoScelto?.nome}
            </h1>

          </div>

          {/* LISTE */}

          <div className="grid md:grid-cols-2 gap-6 mb-10">

            {liste.map((lista) => {

              const selezionata =
                listaScelta?.id === lista.id

              return (

                <button

                  key={lista.id}

                  onClick={() =>
                    setListaScelta(lista)
                  }

                  className="
                    rounded-3xl
                    p-5 md:p-10
                    text-left
                    transition-all
                  "

                  style={{

                    background: lista.colore,

                    outline: selezionata
                      ? '6px solid white'
                      : '0px solid transparent',

                    transform: selezionata
                      ? 'scale(1.03)'
                      : 'scale(1)'
                  }}
                >

                  <p className="
                    text-xl
                    md:text-2xl
                    opacity-80
                    mb-4
                    font-bold
                  ">
                    LISTA {lista.numero}
                  </p>

                  <h2 className="
                    text-2xl
                    md:text-5xl
                    font-black
                    leading-tight
                    mb-6
                  ">
                    {lista.nome}
                  </h2>

                  {selezionata && (

                    <div className="
                      text-xl
                      md:text-2xl
                      font-black
                    ">
                      ✅ SELEZIONATA
                    </div>

                  )}

                </button>
              )
            })}

          </div>

          {/* FOOTER */}

          <div className="
            flex
            flex-col
            md:flex-row
            gap-4
          ">

            <button

              onClick={resetScheda}

              className="
                flex-1
                bg-orange-500
                text-white
                rounded-3xl
                p-5 md:p-6
                text-2xl
                md:text-3xl
                font-black
              "
            >
              ANNULLA
            </button>

            <button

              disabled={!listaScelta}

              onClick={() => {

                if (!listaScelta) return

                caricaCandidati(listaScelta.id)

                setStep(3)
              }}

              className="
                flex-1
                bg-green-600
                text-white
                rounded-3xl
                p-5 md:p-6
                text-2xl
                md:text-3xl
                font-black
                disabled:opacity-40
              "
            >
              CONTINUA
            </button>

          </div>

        </div>

      </main>
    )
  }

  // =====================================
  // STEP 3
  // =====================================

  return (

    <main className="min-h-screen bg-black text-white p-4 md:p-6">

      <div className="max-w-5xl px-2 mx-auto">

        {/* HEADER */}

        <div

          className="
            rounded-3xl
            p-4 md:p-6
            mb-6
          "

          style={{
            background: listaScelta?.colore
          }}
        >

          <p className="text-base md:text-lg opacity-80 mb-2">
            Lista selezionata
          </p>

          <h1 className="text-2xl md:text-5xl font-black">
            {listaScelta?.nome}
          </h1>

        </div>

        {/* TOP ACTIONS */}

        <div className="
          flex
          flex-col
          md:flex-row
          gap-4
          mb-8
        ">

          <button

            onClick={() => {

              setPreferenze([])

              setStep(2)
            }}

            className="
              flex-1
              bg-orange-500
              text-white
              rounded-3xl
              p-5
              text-xl
              md:text-2xl
              font-black
            "
          >
            ANNULLA
          </button>

          <button

            disabled={!puoConfermare || loading}

            onClick={salvaScheda}

            className="
              flex-1
              bg-green-600
              text-white
              rounded-3xl
              p-5
              text-xl
              md:text-2xl
              font-black
              disabled:opacity-40
            "
          >
            {loading
              ? 'SALVATAGGIO...'
              : 'CONFERMA'}
          </button>

        </div>

        {/* WARNING */}

        {erroreGenere && (

          <div className="
            bg-red-600
            rounded-3xl
            p-5 md:p-6
            mb-8
            text-xl
            md:text-2xl
            font-black
          ">
            Le due preferenze devono
            essere di genere diverso
          </div>

        )}

        {/* CANDIDATI */}

        <div className="grid gap-4 mb-10">

          {candidati.map((candidato) => {

            const selezionato =
              preferenze.find(
                (p) => p.id === candidato.id
              )

            const bloccaNuoveScelte =

              preferenze.length >= 2 &&
              !selezionato

            return (

              <button

                key={candidato.id}

                disabled={bloccaNuoveScelte}

                onClick={() =>
                  togglePreferenza(candidato)
                }

                className="
                  rounded-3xl
                  p-5 md:p-6
                  text-left
                  transition-all
                  border-4
                  disabled:opacity-30
                "

                style={{

                  background: selezionato
                    ? listaScelta?.colore
                    : '#18181B',

                  borderColor: selezionato
                    ? 'white'
                    : '#27272A',

                  transform: selezionato
                    ? 'scale(1.02)'
                    : 'scale(1)'
                }}
              >

                <div className="
                  flex
                  items-center
                  justify-between
                ">

                  <div>

                    <p className="
                      text-base
                      md:text-lg
                      opacity-70
                      mb-2
                    ">
                      {candidato.genere === 'M'
                        ? 'UOMO'
                        : 'DONNA'}
                    </p>

                    <h2 className="
                      text-xl
                      md:text-3xl
                      font-black
                    ">
                      {candidato.nome}
                    </h2>

                  </div>

                  {selezionato && (

                    <div className="
                      text-2xl
                      md:text-3xl
                      font-black
                    ">
                      ✅
                    </div>

                  )}

                </div>

              </button>
            )
          })}

        </div>

        {/* BOTTOM CONFIRM */}

        <div className="mb-8">

          <button

            disabled={!puoConfermare || loading}

            onClick={salvaScheda}

            className="
              w-full
              bg-green-600
              text-white
              rounded-3xl
              p-5 md:p-6
              text-2xl
              md:text-3xl
              font-black
              disabled:opacity-40
            "
          >
            {loading
              ? 'SALVATAGGIO...'
              : 'CONFERMA SCHEDA'}
          </button>

        </div>

        {/* RESET TOTALE */}

        <button

          onClick={resetScheda}

          className="
            w-full
            bg-red-700
            text-white
            rounded-3xl
            p-5
            text-xl
            md:text-2xl
            font-black
          "
        >
          ANNULLA SCHEDA
        </button>

      </div>

    </main>
  )
}