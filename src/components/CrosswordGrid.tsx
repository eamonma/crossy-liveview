import React from "react"
import { CrosswordData } from "../crosswordTypes"
import { useColorScheme } from "@mantine/hooks"

const CrosswordGrid = ({
  puzzle,
  highlights,
  answers,
}: {
  puzzle: CrosswordData
  highlights: { [gridNum: number]: string }
  answers: Array<string>
}) => {
  const prefersColorScheme = useColorScheme()
  const isDarkMode = prefersColorScheme === "dark"

  return (
    <div
      id="crossword-grid"
      className="max-w-full w-[800px]"
      style={
        {
          //   width: `${width}px`,
          //   height: `${height}px`,
          //   maxWidth: `${width}px`,
          //   maxHeight: `${height}px`,
        }
      }
    >
      <div
        className="grid w-full border-2 border-black dark:border-zinc-50 sm:border-3"
        style={{
          gridTemplateColumns: `repeat(${puzzle.size.cols}, 1fr)`,
          // gridTemplateRows: `repeat(${puzzle.size.rows}, 40px)`,
        }}
      >
        {[...new Array(puzzle.size.cols * puzzle.size.rows)].map((_, i) => {
          let backgroundColour = ""
          if (puzzle.grid[i] === ".")
            backgroundColour = isDarkMode
              ? "rgb(120, 120, 120)"
              : "rgb(24 24 27)"
          else if (Object.keys(highlights).includes(i.toString()))
            backgroundColour = highlights[i]

          return (
            <div
              key={i}
              className={`relative flex items-center w-full h-full font-normal transition duration-300 border-gray-400 border-[0.8px] text-zinc-800 dark:text-zinc-100 aspect-square`}
              style={{
                backgroundColor: backgroundColour,
                fontSize: `calc(min(100vw, 800px) / ${puzzle.size.cols} / 1.5)`,
              }}
            >
              <div className="absolute p-0 m-0 font-semibold tracking-tighter select-none text-[8px] sm:text-[11px] md:text-xs leading-[11px] lg:top-[1px] top-[-1px] left-[1.5px] cursor-none">
                {!!puzzle.gridnums[i] && puzzle.gridnums[i]}
              </div>
              <div className="relative flex items-center justify-center w-full h-full top-[3px]">
                {answers[i] && puzzle.grid[i] !== "." && answers[i]}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CrosswordGrid
