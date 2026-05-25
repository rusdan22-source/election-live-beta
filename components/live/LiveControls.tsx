type Props = {

  autoPlay: boolean

  setAutoPlay: any

  setSlide: any

  setVisible: any
}

export default function LiveControls({

  autoPlay,

  setAutoPlay,

  setSlide,

  setVisible

}: Props) {

  return (

    <div className="
      fixed
      bottom-3
      left-1/2
      -translate-x-1/2
      flex
      items-center
      gap-3
      z-50
    ">

      {/* PREV */}

      <button

        onClick={() => {

  setVisible(false)

  setTimeout(() => {

    setSlide((prev: number) =>

      prev === 0
        ? 4
        : prev - 1
    )

    setVisible(true)

  }, 300)
}}

        className="
          bg-zinc-800
          hover:bg-zinc-700
          rounded-2xl
          px-5
          md:px-6
          py-3
          md:py-4
          text-2xl
          md:text-3xl
          font-black
          transition-all
        "
      >
        ⬅️
      </button>

      {/* PLAY / PAUSE */}

      <button

        onClick={() =>

          setAutoPlay(!autoPlay)
        }

        className={`
          rounded-2xl
          px-7
          md:px-8
          py-3
          md:py-4
          text-2xl
          md:text-3xl
          font-black
          transition-all

          ${autoPlay

            ? 'bg-green-600 hover:bg-green-500'

            : 'bg-red-600 hover:bg-red-500'
          }
        `}
      >
        {autoPlay
          ? '⏸️'
          : '▶️'}
      </button>

      {/* NEXT */}

      <button

        onClick={() => {

  setVisible(false)

  setTimeout(() => {

    setSlide((prev: number) =>

      (prev + 1) % 5
    )

    setVisible(true)

  }, 300)
}}

        className="
          bg-zinc-800
          hover:bg-zinc-700
          rounded-2xl
          px-5
          md:px-6
          py-3
          md:py-4
          text-2xl
          md:text-3xl
          font-black
          transition-all
        "
      >
        ➡️
      </button>

    </div>
  )
}