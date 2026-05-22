'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'

export default function AdminPage() {

  const [seggi, setSeggi] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(false)

  const [scrutinioAperto, setScrutinioAperto] =
    useState(true)

  const [ultimaModifica, setUltimaModifica] =
    useState('—')

  // =====================================
  // LOAD
  // =====================================

  async function caricaDati() {

const impostazioniQuery = await supabase

  .from('impostazioni')

  .select('*')

  .single()

if (impostazioniQuery.data) {

  setScrutinioAperto(

    impostazioniQuery.data
      .scrutinio_aperto
  )
}

    // SEGGI

    const seggiQuery = await supabase

      .from('seggi')

      .select('*')
      .order('id')

    setSeggi(
      seggiQuery.data || []
    )

    // ULTIMA MODIFICA

    const schedeQuery = await supabase

      .from('schede_scrutinate')

      .select('created_at')
      .order('created_at', {
        ascending: false
      })
      .limit(1)

    if (
      schedeQuery.data &&
      schedeQuery.data.length > 0
    ) {

      const data = new Date(
        schedeQuery.data[0].created_at
      )

      setUltimaModifica(

        data.toLocaleTimeString('it-IT')
      )
    }
  }

  // =====================================
  // INIT
  // =====================================

  useEffect(() => {

    caricaDati()

  }, [])

  // =====================================
  // SALVA TOTALI
  // =====================================

  async function salvaSeggi() {

    setLoading(true)

    for (const seggio of seggi) {

      await supabase

        .from('seggi')

        .update({

          totale_votanti:

            Number(
              seggio.totale_votanti
            )
        })

        .eq('id', seggio.id)
    }

    setLoading(false)

    alert('Totali seggi aggiornati 😄')
  }

  // =====================================
  // RESET
  // =====================================

  async function resetTotale() {

    const conferma = prompt(

      'Scrivi RESET per confermare'
    )

    if (conferma !== 'RESET') {

      alert('Reset annullato')

      return
    }

    setLoading(true)

    // PREFERENZE

    await supabase

      .from('preferenze_scheda')

      .delete()
      .neq('id', 0)

    // SCHEDE

    await supabase

      .from('schede_scrutinate')

      .delete()
      .neq('id', 0)

    setLoading(false)

    alert('Scrutinio resettato')
  }

  // =====================================
  // UI
  // =====================================

async function toggleScrutinio() {

  const nuovoStato =
    !scrutinioAperto

  await supabase

    .from('impostazioni')

    .update({

      scrutinio_aperto:
        nuovoStato
    })

    .eq('id', 1)

  setScrutinioAperto(
    nuovoStato
  )
}

  return (

    <main className="
      min-h-screen
      bg-black
      text-white
      p-6
    ">

      {/* HEADER */}

      <div className="
        flex
        items-center
        justify-between
        mb-8
      ">

        <div>

          <h1 className="
            text-5xl
            font-black
          ">
            ADMIN PANEL
          </h1>

          <p className="
            text-zinc-400
            mt-2
          ">
            Gestione scrutinio live
          </p>

        </div>

        <div className="
          text-right
        ">

          <p className="
            text-zinc-500
            text-sm
          ">
            Ultimo aggiornamento
          </p>

          <p className="
            text-2xl
            font-black
          ">
            {ultimaModifica}
          </p>

        </div>

      </div>

      {/* STATO */}

      <div className="
        mb-8
      ">

<button

  onClick={toggleScrutinio}

  className={`
    rounded-3xl
    px-6
    py-4
    text-2xl
    font-black

    ${scrutinioAperto

      ? 'bg-green-600'

      : 'bg-red-600'
    }
  `}
>

  {scrutinioAperto

    ? 'SCRUTINIO APERTO'

    : 'SCRUTINIO CHIUSO'
  }

</button>

      </div>

      {/* SEGGI */}

      <div className="
        grid
        grid-cols-2
        gap-4
        mb-8
      ">

        {seggi.map((seggio: any) => (

          <div

            key={seggio.id}

            className="
              bg-zinc-900
              rounded-3xl
              p-5
            "
          >

            <h2 className="
              text-3xl
              font-black
              mb-4
            ">
              {seggio.nome}
            </h2>

            <p className="
              text-zinc-400
              mb-2
            ">
              Totale votanti
            </p>

            <input

              type="number"

              value={
                seggio.totale_votanti || ''
              }

              onChange={(e) => {

                setSeggi(

                  seggi.map((s) =>

                    s.id === seggio.id

                      ? {

                          ...s,

                          totale_votanti:

                            e.target.value
                        }

                      : s
                  )
                )
              }}

              className="
                w-full
                bg-black
                border
                border-zinc-700
                rounded-2xl
                p-4
                text-3xl
                font-black
                outline-none
              "
            />

          </div>
        ))}

      </div>

      {/* ACTIONS */}

      <div className="
        flex
        items-center
        gap-4
      ">

        {/* SAVE */}

        <button

          onClick={salvaSeggi}

          disabled={loading}

          className="
            bg-green-700
            hover:bg-green-600
            rounded-2xl
            px-8
            py-5
            text-2xl
            font-black
          "
        >
          💾 SALVA TOTALI
        </button>

        {/* RESET */}

        <button

          onClick={resetTotale}

          disabled={loading}

          className="
            bg-red-700
            hover:bg-red-600
            rounded-2xl
            px-8
            py-5
            text-2xl
            font-black
          "
        >
          ⚠️ RESET SCRUTINIO
        </button>

      </div>

    </main>
  )
}