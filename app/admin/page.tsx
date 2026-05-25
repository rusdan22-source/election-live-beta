'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'

export default function AdminPage() {

  const [sezioni, setSezioni] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(false)

  const [scrutinioAperto, setScrutinioAperto] =
    useState(true)

  const [preScrutinio, setPreScrutinio] =
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

      setPreScrutinio(

        impostazioniQuery.data
          .modalita_pre_scrutinio
      )
    }

    // SEZIONI

    const sezioniQuery = await supabase

      .from('seggi')

      .select('*')
      .order('id')

    setSezioni(
      sezioniQuery.data || []
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

  async function salvaSezioni() {

    setLoading(true)

    for (const sezione of sezioni) {

      await supabase

        .from('seggi')

        .update({

          totale_votanti:

            Number(
              sezione.totale_votanti
            )
        })

        .eq('id', sezione.id)
    }

    setLoading(false)

    alert('Totali sezioni aggiornati 😄')
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
  // TOGGLE SCRUTINIO
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

  // =====================================
  // TOGGLE PRE-SCRUTINIO
  // =====================================

  async function togglePreScrutinio() {

    if (preScrutinio) {

      // AVVIA SCRUTINIO

      await supabase

        .from('impostazioni')

        .update({

          modalita_pre_scrutinio:
            false,

          scrutinio_aperto:
            true
        })

        .eq('id', 1)

      setPreScrutinio(false)

      setScrutinioAperto(true)

    } else {

      // TORNA PRE-SCRUTINIO

      await supabase

        .from('impostazioni')

        .update({

          modalita_pre_scrutinio:
            true,

          scrutinio_aperto:
            false
        })

        .eq('id', 1)

      setPreScrutinio(true)

      setScrutinioAperto(false)
    }

    caricaDati()
  }

  // =====================================
  // UI
  // =====================================

  return (

    <main className="
      min-h-screen
      bg-black
      text-white
      p-4 md:p-6
    ">

      {/* HEADER */}

      <div className="
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-6
        mb-8
      ">

        <div>

          <h1 className="
            text-3xl
            md:text-5xl
            font-black
          ">
            ADMIN PANEL
          </h1>

          <p className="
            text-zinc-400
            mt-2
            text-base
            md:text-lg
          ">
            Gestione scrutinio live
          </p>

        </div>

        <div className="
          md:text-right
        ">

          <p className="
            text-zinc-500
            text-sm
          ">
            Ultimo aggiornamento
          </p>

          <p className="
            text-xl
            md:text-2xl
            font-black
          ">
            {ultimaModifica}
          </p>

        </div>

      </div>

      {/* CONTROLLI LIVE */}

      <div className="
        flex
        flex-col
        md:flex-row
        gap-4
        mb-8
      ">

        {/* PRE-SCRUTINIO / START */}

        <button

          onClick={togglePreScrutinio}

          className={`
            flex-1
            rounded-3xl
            px-8
            py-5
            text-xl
            md:text-2xl
            font-black
            transition-all

            ${preScrutinio

              ? 'bg-green-600 hover:bg-green-700'

              : 'bg-orange-500 hover:bg-orange-600'
            }
          `}
        >

          {preScrutinio

            ? '▶ INIZIA SCRUTINIO'

            : '⏸ MODALITÀ PRE-SCRUTINIO'
          }

        </button>

        {/* SCRUTINIO APERTO / CHIUSO */}

        <button

          onClick={toggleScrutinio}

          className={`
            flex-1
            rounded-3xl
            px-8
            py-5
            text-xl
            md:text-2xl
            font-black
            transition-all

            ${scrutinioAperto

              ? 'bg-green-600 hover:bg-green-700'

              : 'bg-red-600 hover:bg-red-700'
            }
          `}
        >

          {scrutinioAperto

            ? '🟢 SCRUTINIO APERTO'

            : '🔴 SCRUTINIO CHIUSO'
          }

        </button>

      </div>

      {/* SEZIONI */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        gap-4
        mb-8
      ">

        {sezioni.map((sezione: any) => (

          <div

            key={sezione.id}

            className="
              bg-zinc-900
              rounded-3xl
              p-4 md:p-5
            "
          >

            <h2 className="
              text-2xl
              md:text-3xl
              font-black
              mb-4
            ">
              {sezione.nome}
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
                sezione.totale_votanti || ''
              }

              onChange={(e) => {

                setSezioni(

                  sezioni.map((s) =>

                    s.id === sezione.id

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
                text-2xl
                md:text-3xl
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
        flex-col
        md:flex-row
        items-stretch
        md:items-center
        gap-4
      ">

        {/* SAVE */}

        <button

          onClick={salvaSezioni}

          disabled={loading}

          className="
            flex-1
            bg-green-700
            hover:bg-green-600
            rounded-2xl
            px-8
            py-5
            text-xl
            md:text-2xl
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
            flex-1
            bg-red-700
            hover:bg-red-600
            rounded-2xl
            px-8
            py-5
            text-xl
            md:text-2xl
            font-black
          "
        >
          ⚠️ RESET SCRUTINIO
        </button>

      </div>

    </main>
  )
}