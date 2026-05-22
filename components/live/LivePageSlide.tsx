import RankingCard from './RankingCard'

type Props = {

  totali: any

  seggi: any[]

  totaliSchede: any[]

  ultimeSchede: any[]
}

function Card({

  title,

  value,

  percentuale,

  color,

  dark

}: any) {

  // CARD SEMPLICE

  if (
    percentuale === undefined ||
    percentuale === null
  ) {

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

  // CARD SPLIT

  return (

    <div

      className="
        rounded-3xl
        p-4
        min-h-[120px]
        flex
        flex-col
        justify-between
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
        mb-3
      ">
        {title}
      </p>

      <div className="
        flex
        items-center
        justify-between
        gap-4
      ">

        {/* VOTI */}

        <div className="
          flex-1
        ">

          <div className="
            text-4xl
            xl:text-5xl
            font-black
          ">
            {value}
          </div>

          <div className="
            text-sm
            opacity-70
            mt-1
          ">
            voti
          </div>

        </div>

        {/* DIVISORE */}

        <div

          className="
            w-[2px]
            bg-black/40
            rounded-full
          "

          style={{
            height: '80px'
          }}
        />

        {/* PERCENTUALE */}

        <div className="
          flex-1
          text-right
        ">

          <div className="
            text-4xl
            xl:text-5xl
            font-black
          ">
            {percentuale}%
          </div>

        </div>

      </div>

    </div>
  )
}


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

export default function LivePageSlide({

  totali,

  seggi,

  totaliSchede,

  ultimeSchede

}: Props) {

  return (

    <div className="h-full">

      {/* HEADER */}

      <div className="
        flex
        items-center
        gap-4
        mb-4
      ">

        <h1 className="
          text-5xl
          xl:text-6xl
          font-black
        ">
          Elezioni comunali Polizzi Generosa - SCRUTINIO LIVE
        </h1>

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

      </div>

      

      {/* CONTENT */}

      <div className="
        grid
        grid-cols-[2fr_1fr]
        gap-3
        items-start
      ">

        {/* SINISTRA */}

        <div>

        {/* TOP */}

      <div className="
        grid
        grid-cols-4
        gap-3
        mb-3
      ">

        <Card
          title="Totale schede scrutinate"
          value={totali.totale}
          color="#18181B"
        />

        <Card
          title="Schede valide"
          value={totali.valide}
          color="#1D4ED8"
        />

        <Card
          title="Schede bianche"
          value={totali.bianche}
          color="#FFFFFF"
          dark
        />

        <Card
          title="Schede nulle"
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
              title="Lista 1 - Polizzi Futura"
              value={totali.lista1}

              percentuale={
                totali.valide > 0

                  ? (
                      (
                        totali.lista1 /
                        totali.valide
                      ) * 100
                    ).toFixed(1)

                  : '0.0'
              }

              color="#14532D"
            />

            <Card
              title="Lista 2 - Costruire Comunità"
              value={totali.lista2}

              percentuale={
                totali.valide > 0

                  ? (
                      (
                        totali.lista2 /
                        totali.valide
                      ) * 100
                    ).toFixed(1)

                  : '0.0'
              }

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

                  <div className="
                    flex
                    items-center
                    justify-between
                    mb-2
                  ">

                    <h2 className="
                      text-lg
                      font-black
                    ">
                      {seggio.nome}
                    </h2>

                    <div className="
                      text-sm
                      font-black
                    ">
                      {seggio.scrutinate}
                      /
                      {seggio.totale_votanti}
                    </div>

                  </div>

                  <div className="
                    w-full
                    h-3
                    bg-black/40
                    rounded-full
                    overflow-hidden
                    mb-2
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

                  <div className="
                    flex
                    items-center
                    justify-between
                  ">

                    <div

                      className="
                        text-lg
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
                        px-2
                        py-1
                        rounded-xl
                        text-xs
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
            grid-cols-2
            gap-3
          ">

            <SindacoCard
              nome="Gandolfo Lo Verde"
              voti={totali.loverde}
              colore="#14532D"
              percentuale={
                totali.valide > 0
                  ? (
                      totali.loverde /
                      totali.valide
                    ) * 100
                  : 0
              }
            />

            <SindacoCard
              nome="Gandolfo Librizzi"
              voti={totali.librizzi}
              colore="#991B1B"
              percentuale={
                totali.valide > 0
                  ? (
                      totali.librizzi /
                      totali.valide
                    ) * 100
                  : 0
              }
            />

          </div>

        </div>

        {/* DESTRA */}

        <div className="
          bg-zinc-900
          rounded-3xl
          p-4
          overflow-hidden
          h-[672px]
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
            -mt-[7px]
          ">

            {ultimeSchede
              .slice(0, 8)
              .map(
                (scheda: any) => {

                  let sindaco = ''

                  if (scheda.tipo === 'bianca') {
                    sindaco = 'SCHEDA BIANCA'
                  }

                  else if (scheda.tipo === 'nulla') {
                    sindaco = 'SCHEDA NULLA'
                  }

                  else if (
                    scheda.sindaco_id === 1
                  ) {
                    sindaco = 'LO VERDE'
                  }

                  else {
                    sindaco = 'LIBRIZZI'
                  }

                  const listaNome =
                    scheda.lista_id === 1
                      ? 'Polizzi Futura'
                      : 'Costruire Comunità'

                  const preferenze =

                    scheda.preferenze_scheda
                      ?.map((p: any) =>

                        p.candidato?.nome
                      )

                      .filter(Boolean)

                      .join(' • ')

                  return (

                    <div

                      key={scheda.id}

                      className="
                        rounded-2xl
                        overflow-hidden
                        flex
                      "
                    >

                      {/* SINISTRA */}

                      <div

                        className="
                          w-1/2
                          p-3
                        "

                        style={{

                          background:

                            scheda.sindaco_id === 1

                              ? '#14532D'

                              : scheda.sindaco_id === 2

                                ? '#991B1B'

                                : '#3F3F46'
                        }}
                      >

                        <div className="
                          flex
                          items-center
                          justify-between
                          mb-2
                        ">

                          <div className="
                            font-black
                            text-xs
                          ">
                            {scheda.seggio?.nome}
                          </div>

                          <div className="
                            text-[10px]
                            opacity-70
                          ">
                            {new Date(
                              scheda.created_at
                            ).toLocaleTimeString('it-IT')}
                          </div>

                        </div>

                        <div className="
                          font-black
                          text-sm
                        ">
                          {sindaco}
                        </div>

                      </div>

                      {/* DESTRA */}

                      <div

                        className="
                          w-1/2
                          p-3
                          flex
                          items-center
                        "

                        style={{

                          background:

                            scheda.lista_id === 1

                              ? '#14532D'

                              : scheda.lista_id === 2

                                ? '#991B1B'

                                : '#27272A'
                        }}
                      >

                        <div className="
                          text-xs
                          font-bold
                          leading-snug
                          -mt-1
                        ">

                          {scheda.tipo === 'valida' && (

                            <div>

                              <div className="
                                mb-1
                              ">

                                Lista {scheda.lista_id}

                                {' — '}

                                {listaNome}

                              </div>

                              {preferenze && (

                                <div className="
                                  opacity-90
                                ">
                                  {preferenze}
                                </div>

                              )}

                            </div>

                          )}

                        </div>

                      </div>

                    </div>
                  )
                }
              )}

          </div>

        </div>

      </div>

    </div>
  )
}