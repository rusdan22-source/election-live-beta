type Props = {

  autoPlay: boolean

  setAutoPlay: any

  setSlide: any
}

export default function LiveControls({

  autoPlay,

  setAutoPlay,

  setSlide

}: Props) {

  return (

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

          setSlide((prev: number) =>

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

          setSlide((prev: number) =>

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
  )
}