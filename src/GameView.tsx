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
  const { gameId: gameIdb64 } = useParams()
  const gameId: string = useMemo(() => {
    return b64ToBn(gameIdb64 as string).toString(16)
    // 6208b6730917c7d6c9a77bee
  }, [gameIdb64])

  console.log(gameId)

  const { data, loading } = useSubscription(gameUpdateSubscription, {
    variables: { topic: gameId },
  })
  const [answers, setAnswers] = useState<Array<string>>([])
  const [puzzle, setPuzzle] = useState<CrosswordData>()
  const [highlights, setHighlights] = useState<{ [gridNum: number]: string }>(
    {}
  )

  const { data: initialData, loading: initialLoading } = useQuery(gameQuery, {
    variables: { gameId },
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
    if (initialLoading) return

    setAnswers(initialData.gameById.answers)

    setPuzzle(JSON.parse(initialData.gameById.puzzle) as CrosswordData)
  }, [initialData])

  return (
    <div>
      {puzzle && (
        <Fragment>
          <div
            id="crossword-grid"
            className="w-screen p-1 sm:p-4 max-w-[100vh] max-h-[100vw]"
          >
            <div
              className="grid w-full border border-black sm:border-4"
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
                      className={`relative flex items-center w-full h-full text-[100%] font-normal border-gray-400 sm:text-3xl border-[0.8px] text-zinc-800 aspect-square transition duration-300`}
                      style={{
                        backgroundColor: backgroundColour,
                      }}
                    >
                      <div className="absolute p-0 m-0 font-semibold tracking-tighter text-[8px] sm:text-[11px] leading-[11px] sm:top-[1px] top-[-1px] left-[1.5px]">
                        {!!puzzle.gridnums[i] && puzzle.gridnums[i]}
                      </div>
                      <div className="relative flex items-center justify-center w-full h-full sm:top-1">
                        {answers[i] && puzzle.grid[i] !== "." && answers[i]}
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </div>
        </Fragment>
      )}
    </div>
  )
}

export default GameView
