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

  color:

    titolo === 'TOTALE PREFERENZE'

      ? '#F97316'

      : colore
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

  background:

    titolo === 'TOTALE PREFERENZE'

      ? '#F97316'

      : colore
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