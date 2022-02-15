import { gql, useQuery, useSubscription } from "@apollo/client"
import { useColorScheme } from "@mantine/hooks"
import {
  differenceInMinutes,
  differenceInSeconds,
  formatDistance,
} from "date-fns"
import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import CrosswordGrid from "./components/CrosswordGrid"
import { CrosswordData } from "./crosswordTypes"

const gameUpdateSubscription = gql`
  subscription subscribeToGameUpdate($topic: String!) {
    subscribeToGameUpdate(topic: $topic) {
      answers
      updatedAt
      active
    }
  }
`

const gameQuery = gql`
  query gameById($gameId: String!) {
    gameById(gameId: $gameId) {
      channelId
      createdAt
      updatedAt
      active
      answers
      puzzle
    }
  }
`

const GameView = () => {
  const prefersColorScheme = useColorScheme()
  const isDarkMode = prefersColorScheme === "dark"

  const { gameId } = useParams()

  const { data, loading } = useSubscription(gameUpdateSubscription, {
    variables: { topic: gameId },
  })
  const [answers, setAnswers] = useState<Array<string>>([])
  const [puzzle, setPuzzle] = useState<CrosswordData>({
    size: { cols: 15, rows: 15 },
    answers: { across: [], down: [] },
    author: "Johnny Appleseed",
    clues: { across: [], down: [] },
    date: "2022-02-22",
    grid: [],
    gridnums: [],
    editor: "Jane Peachcore",
    publisher: "The Old Toronto Moments",
    title: "The Old Toronto Moments",
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

  const [showLoadingSpinner, setShowLoadingSpinner] = useState(false)

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
        newHighlights[i] = isDarkMode ? "#ab9148" : "#ffd96e"
      }
    }

    setHighlights(newHighlights)

    setTimeout(() => {
      setHighlights([])
    }, 4000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loading])

  useEffect(() => {
    if (queryLoading || !queryData) return

    setAnswers(queryData.gameById.answers)

    setPuzzle(JSON.parse(queryData.gameById.puzzle) as CrosswordData)
  }, [queryData, queryLoading])

  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    setInterval(() => setCurrentDate(new Date()), 1000)
  }, [])

  return (
    <div className="min-h-screen dark:bg-stone-800 dark:text-slate-50">
      {puzzle && answers && (
        <div className="flex flex-col flex-wrap w-screen p-2 max-w-[100vw] sm:p-4">
          <header className="my-4 mt-2 font-serif">
            <div className="flex items-baseline gap-4 text-2xl">
              <h1 className="text-4xl font-semibold">{puzzle.publisher}</h1>
              <div className="text-black dark:text-slate-50 text-opacity-60">
                {new Date(puzzle.date).toLocaleDateString()}
              </div>
            </div>
            <h2 className="flex gap-4 text-lg">
              <span>By {puzzle.author}</span>
              <span className="text-black dark:text-slate-50 text-opacity-60">
                Edited by {puzzle.editor}
              </span>
            </h2>
            <div className="h-6 mt-4">
              <span className="">
                {queryData &&
                  !queryLoading &&
                  (() => {
                    const { createdAt } = queryData.gameById

                    const { active, updatedAt } = data
                      ? data.subscribeToGameUpdate
                      : queryData.gameById

                    console.log(data, active)

                    const startDate = new Date(createdAt)
                    const endDate = active ? currentDate : new Date(updatedAt)

                    return (
                      // formatDistance(startDate, endDate) +
                      `${Math.abs(
                        differenceInMinutes(startDate, endDate)
                      )} minutes ${
                        Math.abs(differenceInSeconds(startDate, endDate)) % 60
                      } seconds`
                    )
                  })()}
              </span>
            </div>
          </header>
          <CrosswordGrid
            puzzle={puzzle}
            highlights={highlights}
            answers={answers}
          />
          <button
            className="flex items-center justify-center gap-2 p-0 py-2 my-4 font-semibold w-fit h-fit dark:text-sky-300 rounded-xl text-sky-700"
            onClick={async () => {
              setShowLoadingSpinner(true)
              setTimeout(() => setShowLoadingSpinner(false), 1000)
              await refetch()
            }}
          >
            {/* {queryLoading || showLoadingSpinner ? ( */}
            <div
              className="absolute transition"
              style={{
                opacity: queryLoading || showLoadingSpinner ? 1 : 0,
              }}
            >
              <svg className="spinner" viewBox="0 0 50 50">
                <circle
                  className="path dark:stroke-slate-50 stroke:slate-900"
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  strokeWidth="7"
                ></circle>
              </svg>
            </div>
            {/* ) : ( */}
            <span
              className="transition duration-200"
              style={{
                opacity: queryLoading || showLoadingSpinner ? 0 : 1,
              }}
            >
              Refetch
            </span>
            {/* )} */}
          </button>
        </div>
      )}
    </div>
  )
}
export default GameView
