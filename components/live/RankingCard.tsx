type Props = {

  candidato: any

  colore: string

  index: number
}

export default function RankingCard({

  candidato,

  colore,

  index

}: Props) {

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