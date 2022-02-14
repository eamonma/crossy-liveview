import { gql, useQuery, useSubscription } from "@apollo/client"
import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { CrosswordData } from "./crosswordTypes"
import { useWindowResize } from "beautiful-react-hooks"
import CrosswordGrid from "./components/CrosswordGrid"
import {
  differenceInMinutes,
  differenceInSeconds,
  formatDistance,
  formatDistanceStrict,
} from "date-fns"

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

const GameView = () => {
  const { gameId } = useParams()

  const onWindowResize = useWindowResize()

  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight)

  useWindowResize((event) => {
    setWidth(window.innerWidth)
    setHeight(window.innerHeight)
  })

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
    editor: "",
    publisher: "",
    title: "",
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

  useEffect(() => {
    if (!data) return

    const prevAnswers = answers
    const newAnswers: Array<string> = data.subscribeToGameUpdate.answers

    setAnswers(newAnswers)

    const newHighlights: { [gridNum: number]: string } = {}

    setHighlights([])

    for (const [i, newAnswer] of newAnswers.entries()) {
      if (
        newAnswer &&
        ((!prevAnswers[i] && !!newAnswer) || newAnswer !== prevAnswers[i])
      ) {
        newHighlights[i] = "#ffd96e"
      }
    }

    setHighlights(newHighlights)

    setTimeout(() => {
      setHighlights([])
    }, 4000)
  }, [data, loading])

  useEffect(() => {
    if (queryLoading || !queryData) return

    setAnswers(queryData.gameById.answers)

    setPuzzle(JSON.parse(queryData.gameById.puzzle) as CrosswordData)
  }, [queryData, queryLoading])

  return (
    <div>
      {puzzle && answers && (
        <div className="flex flex-col flex-wrap w-screen p-2 max-w-[100vw] sm:p-4">
          <header className="my-4 mt-2 font-serif">
            <div className="flex items-baseline gap-4 text-2xl">
              <h1 className="text-4xl font-semibold">{puzzle.publisher}</h1>
              <div className="text-black text-opacity-60">
                {new Date(puzzle.date).toLocaleDateString()}
              </div>
            </div>
            <h2 className="flex gap-4 text-lg">
              <span>By {puzzle.author}</span>
              <span className="text-black text-opacity-60">
                Edited by {puzzle.editor}
              </span>
            </h2>
            {/* <div className="mt-4">
              Time elapsed:{" "}
              {queryData &&
                !queryLoading &&
                (() => {
                  const { gameById: game } = queryData
                  const startDate = new Date(game.createdAt)
                  const endDate = active
                    ? currentDate
                    : new Date(game.updatedAt)

                  return (
                    formatDistance(
                      startDate,
                      endDate
                      //   { includeSeconds: true }
                      //   { unit: "second" }
                    ) +
                    ` (${Math.abs(
                      differenceInMinutes(startDate, endDate)
                    )} minutes ${
                      Math.abs(differenceInSeconds(startDate, endDate)) % 60
                    } seconds)`
                  )
                })()}
            </div> */}
          </header>
          <CrosswordGrid
            puzzle={puzzle}
            highlights={highlights}
            answers={answers}
          />
          <button
            className="flex items-center justify-center w-24 h-10 gap-2 p-4 py-2 my-4 font-medium bg-zinc-200 rounded-xl"
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
