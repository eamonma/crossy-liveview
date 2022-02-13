import { gql, useQuery, useSubscription } from "@apollo/client"
import React, { Fragment, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Answers, CrosswordData } from "./crosswordTypes"

const gameUpdateSubscription = gql`
  subscription subscribeToGameUpdate($topic: String!) {
    subscribeToGameUpdate(topic: $topic) {
      answers
    }
  }
`

const gameQuery = gql`
  query gameById($gameId: String!) {
    gameById(gameId: $gameId) {
      channelId
      answers
      puzzle
    }
  }
`

// https://coolaj86.com/articles/bigints-and-base64-in-javascript/
function bnToB64(bn: string) {
  var hex = BigInt(bn).toString(16)
  if (hex.length % 2) {
    hex = "0" + hex
  }

  var bin = []
  var i = 0
  var d
  var b
  while (i < hex.length) {
    d = parseInt(hex.slice(i, i + 2), 16)
    b = String.fromCharCode(d)
    bin.push(b)
    i += 2
  }

  return window.btoa(bin.join(""))
  //   return Buffer.from(bin.join("")).toString("base64")
}

function b64ToBn(b64: string) {
  let bin = window.atob(b64)
  //   const bin = Buffer.from(b64).toString("base64")
  let hex: Array<string> = []

  bin.split("").forEach(function (ch) {
    var h = ch.charCodeAt(0).toString(16)
    if (h.length % 2) {
      h = "0" + h
    }
    hex.push(h)
  })

  return BigInt("0x" + hex.join(""))
}

const GameView = () => {
  const { gameId } = useParams()
  //   const gameId: string = useMemo(() => {
  //     return b64ToBn(gameIdb64 as string).toString(16)
  //     // 6208b6730917c7d6c9a77bee
  //   }, [gameIdb64])

  console.log(gameId)

  const { data, loading } = useSubscription(gameUpdateSubscription, {
    variables: { topic: gameId },
  })
  const [answers, setAnswers] = useState<Array<string>>([])
  const [puzzle, setPuzzle] = useState<CrosswordData>({
    size: { cols: 15, rows: 15 },
    answers: { across: [], down: [] },
    author: "",
    clues: { across: [], down: [] },
    date: "",
    grid: [],
    gridnums: [],
  })
  const [highlights, setHighlights] = useState<{ [gridNum: number]: string }>(
    {}
  )

  const {
    data: queryData,
    loading: queryLoading,
    refetch,
  } = useQuery(gameQuery, {
    variables: { gameId },
    notifyOnNetworkStatusChange: true,
  })

  console.log("Outside: " + data)

  useEffect(() => {
    console.log(data)

    if (!data) return

    const prevAnswers = answers
    const newAnswers: Array<string> = data.subscribeToGameUpdate.answers

    setAnswers(newAnswers)

    const newHighlights: { [gridNum: number]: string } = {}

    setHighlights([])

    newAnswers.map((newAnswer, i) => {
      if (
        newAnswer &&
        ((!prevAnswers[i] && !!newAnswer) || newAnswer !== prevAnswers[i])
      ) {
        newHighlights[i] = "#ffd96e"
      }
    })

    setHighlights(newHighlights)

    setTimeout(() => {
      setHighlights([])
    }, 4000)
  }, [data, loading])

  useEffect(() => {
    if (queryLoading || !queryData) return

    setAnswers(queryData.gameById.answers)

    setPuzzle(JSON.parse(queryData.gameById.puzzle) as CrosswordData)
  }, [queryData])

  return (
    <div>
      {puzzle && (
        <div className="flex flex-wrap">
          <div
            id="crossword-grid"
            className="p-1 sm:p-4 w-[100vh] h-[100vw] max-w-[100vw] max-h-[100vh]"
          >
            <div
              className="grid w-full border-2 border-black sm:border-4"
              style={{
                gridTemplateColumns: `repeat(${puzzle.size.cols}, 1fr)`,
                // gridTemplateRows: `repeat(${puzzle.size.rows}, 40px)`,
              }}
            >
              {[...new Array(puzzle.size.cols * puzzle.size.rows)].map(
                (_, i) => {
                  let backgroundColour = "#fff"
                  if (puzzle.grid[i] === ".") backgroundColour = "rgb(24 24 27)"
                  else if (Object.keys(highlights).includes(i.toString()))
                    backgroundColour = highlights[i]
                  return (
                    <div
                      key={i}
                      className={`relative flex items-center w-full h-full font-normal transition duration-300 border-gray-400 border-[0.8px] text-zinc-800 aspect-square`}
                      style={{
                        backgroundColor: backgroundColour,
                        fontSize: `calc(min(100vw, 100vh) / ${puzzle.size.cols} / 1.5)`,
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
                }
              )}
            </div>
          </div>
          <button
            className="flex items-center justify-center w-24 h-10 gap-2 p-4 py-2 m-4 font-medium bg-zinc-200 rounded-xl"
            onClick={async () => await refetch()}
          >
            {queryLoading ? (
              <div>
                <svg className="spinner" viewBox="0 0 50 50">
                  <circle
                    className="path"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    strokeWidth="7"
                  ></circle>
                </svg>
              </div>
            ) : (
              <span>Refetch</span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default GameView
