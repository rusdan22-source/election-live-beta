'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Sindaco = {
  id: number
  nome: string
  colore: string
}

type Lista = {
  id: number
  nome: string
  colore: string
  sindaco_id: number
}

export default function ScrutinioPage() {

  // =========================
  // STATE
  // =========================

  const [step, setStep] = useState(1)

  const [sindaci, setSindaci] = useState<Sindaco[]>([])

  const [liste, setListe] = useState<Lista[]>([])

  const [sindacoScelto, setSindacoScelto] =
    useState<Sindaco | null>(null)

  // =========================
  // LOAD
  // =========================

  async function caricaDati() {

    const sindaciQuery = await supabase
      .from('sindaci')
      .select('*')

    const listeQuery = await supabase
      .from('liste')
      .select('*')

    if (sindaciQuery.data) {
      setSindaci(sindaciQuery.data)
    }

    if (listeQuery.data) {
      setListe(listeQuery.data)
    }
  }

  useEffect(() => {
    caricaDati()
  }, [])

  // =========================
  // SCHEDE SPECIALI
  // =========================

  async function salvaSchedaSpeciale(
    tipo: 'bianca' | 'nulla'
  ) {

    const { error } = await supabase

      .from('schede_scrutinate')

      .insert({
        seggio_id: 1,
        tipo
      })

    if (error) {
      console.error(error)
      return
    }

    alert(`Scheda ${tipo} salvata`)
  }

  // =========================
  // STEP 1
  // =========================

  if (step === 1) {

    return (

      <main className="min-h-screen bg-black text-white p-6">

        <div className="max-w-5xl mx-auto">

          <div className="mb-12">

            <h1 className="text-7xl font-black mb-3">
              SEGGIO 1
            </h1>

            <p className="text-zinc-500 text-2xl">
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
                  p-10
                  text-left
                  transition-all
                  hover:scale-[1.02]
                "

                style={{
                  background: sindaco.colore
                }}
              >

                <p className="text-lg opacity-80 mb-3">
                  Candidato Sindaco
                </p>

                <h2 className="text-5xl font-black leading-tight">
                  {sindaco.nome}
                </h2>

              </button>

            ))}

          </div>

          {/* BIANCA / NULLA */}

          <div className="grid md:grid-cols-2 gap-6">

            {/* BIANCA */}

            <button

              onClick={() =>
                salvaSchedaSpeciale('bianca')
              }

              className="
                bg-white
                text-black
                rounded-3xl
                p-10
                text-left
                transition-all
                hover:scale-[1.02]
              "
            >

              <p className="text-lg opacity-70 mb-3">
                Scheda
              </p>

              <h2 className="text-5xl font-black">
                BIANCA
              </h2>

            </button>

            {/* NULLA */}

            <button

              onClick={() =>
                salvaSchedaSpeciale('nulla')
              }

              className="
                bg-zinc-800
                text-white
                rounded-3xl
                p-10
                text-left
                transition-all
                hover:scale-[1.02]
              "
            >

              <p className="text-lg opacity-70 mb-3">
                Scheda
              </p>

              <h2 className="text-5xl font-black">
                NULLA
              </h2>

            </button>

          </div>

        </div>

      </main>
    )
  }

  // =========================
  // STEP 2
  // =========================

  return (

    <main className="min-h-screen bg-black text-white p-6">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div
          className="
            rounded-3xl
            p-6
            mb-10
          "

          style={{
            background: sindacoScelto?.colore
          }}
        >

          <p className="text-lg opacity-80 mb-2">
            Sindaco selezionato
          </p>

          <h1 className="text-5xl font-black">
            {sindacoScelto?.nome}
          </h1>

        </div>

        {/* LISTE */}

        <div className="grid md:grid-cols-2 gap-6 mb-10">

          {liste.map((lista) => (

            <button

              key={lista.id}

              className="
                rounded-3xl
                p-10
                text-left
                transition-all
                hover:scale-[1.02]
              "

              style={{
                background: lista.colore
              }}
            >

              <p className="text-lg opacity-80 mb-3">
                Lista
              </p>

              <h2 className="text-5xl font-black leading-tight">
                {lista.nome}
              </h2>

            </button>

          ))}

        </div>

        {/* FOOTER */}

        <div className="flex gap-4">

          <button

            onClick={() => {

              setSindacoScelto(null)

              setStep(1)
            }}

            className="
              flex-1
              bg-orange-500
              text-white
              rounded-3xl
              p-6
              text-3xl
              font-black
            "
          >
            ANNULLA
          </button>

          <button

            className="
              flex-1
              bg-green-600
              text-white
              rounded-3xl
              p-6
              text-3xl
              font-black
            "
          >
            CONTINUA
          </button>

        </div>

      </div>

    </main>
  )
}