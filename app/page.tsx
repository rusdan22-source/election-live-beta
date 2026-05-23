export default function HomePage() {

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
        max-w-4xl
        w-full
        text-center
      ">

        {/* LOGO / TITLE */}

        <div className="mb-10">

          <div className="
            inline-flex
            items-center
            gap-4
            mb-6
          ">

            <div className="
              relative
              flex
              items-center
              justify-center
            ">

              <div className="
                absolute
                w-8
                h-8
                rounded-full
                bg-red-500/30
                animate-ping
              " />

              <div className="
                w-5
                h-5
                rounded-full
                bg-red-500
              " />

            </div>

            <span className="
              text-sm
              md:text-base
              font-black
              tracking-[0.3em]
              text-red-500
            ">
              BETA
            </span>

          </div>

          <h1 className="
            text-4xl
            md:text-7xl
            font-black
            leading-tight
            mb-6
          ">

            ELECTION LIVE

          </h1>

          <p className="
            text-xl
            md:text-2xl
            text-zinc-400
            leading-relaxed
            max-w-3xl
            mx-auto
          ">

            Sistema sperimentale di scrutinio
            elettorale in tempo reale,
            progettato per mostrare risultati,
            aggiornamenti live e statistiche
            durante lo spoglio.

          </p>

        </div>

        {/* INFO CARD */}

        <div className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-6
          md:p-10
          mb-8
          text-left
        ">

          <h2 className="
            text-2xl
            md:text-4xl
            font-black
            mb-6
          ">

            Progetto in evoluzione

          </h2>

          <div className="
            grid
            gap-5
            text-zinc-300
            text-lg
            md:text-xl
            leading-relaxed
          ">

            <p>

              Questa piattaforma rappresenta
              una beta pubblica di un progetto
              più ampio dedicato alla gestione
              e visualizzazione dello scrutinio
              elettorale in tempo reale.

            </p>

            <p>

              L'obiettivo è sviluppare un sistema
              moderno, rapido e trasparente,
              pensato sia per operatori interni
              che per la visualizzazione live
              dei risultati.

            </p>

            <p>

              Nuove funzionalità, miglioramenti
              grafici e aggiornamenti arriveranno
              progressivamente nelle prossime
              versioni.

            </p>

          </div>

        </div>

        {/* FOOTER */}

        <div className="
          text-zinc-500
          text-sm
          md:text-base
        ">

          Rimani sintonizzato per i prossimi
          aggiornamenti del progetto.

        </div>

      </div>

    </main>
  )
}