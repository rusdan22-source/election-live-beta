import RankingCard from './RankingCard'

type Props = {

  titolo: string

  totale: string

  colore: string

  data: any[]
}

export default function ClassificaSlide({

  titolo,

  totale,

  colore,

  data

}: Props) {

  const left =
    data.slice(0, 5)

  const right =
    data.slice(5, 10)

  const totalePreferenze =

    titolo ===
    'TOTALE PREFERENZE'

  return (

    <div>

      {/* TITOLO */}

      <h1

        className="
          text-4xl
          xl:text-6xl
          font-black
          mb-2
          leading-tight
        "

        style={{

          color:

            totalePreferenze

              ? '#F97316'

              : colore
        }}
      >
        {titolo}
      </h1>

      {/* TOTALE */}

      <div

        className="
          inline-block
          items-center
          rounded-2xl
          px-5
          py-3
          text-xl
          xl:text-2xl
          font-black
          mb-6
        "

        style={{

          background:

            totalePreferenze

              ? '#F97316'

              : colore
        }}
      >
        {totale}
      </div>

      {/* GRID */}

      <div className="
        grid
        grid-cols-2
        gap-3
      ">

        {/* SINISTRA */}

        <div className="
          grid
          gap-3
        ">

          {left.map(
            (candidato: any, index: number) => (

              <RankingCard

                key={candidato.id}

                candidato={candidato}

                colore={

                  totalePreferenze

                    ? candidato.lista_id === 1

                      ? '#14532D'

                      : '#991B1B'

                    : colore
                }

                index={index + 1}
              />
            )
          )}

        </div>

        {/* DESTRA */}

        <div className="
          grid
          gap-3
        ">

          {right.map(
            (candidato: any, index: number) => (

              <RankingCard

                key={candidato.id}

                candidato={candidato}

                colore={

                  totalePreferenze

                    ? candidato.lista_id === 1

                      ? '#14532D'

                      : '#991B1B'

                    : colore
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