import { gql, useQuery, useSubscription } from "@apollo/client"
import { useColorScheme } from "@mantine/hooks"
// import { Skeleton } from "@mantine/core"
import { differenceInMinutes, differenceInSeconds } from "date-fns"
import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import CrosswordGrid from "./components/CrosswordGrid"
import { CrosswordData } from "./crosswordTypes"
import Skeleton, { SkeletonTheme } from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

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
  const [puzzle, setPuzzle] = useState<CrosswordData>()
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

  const [currentHighlight, setCurrentHighlight] = useState(0)

  useEffect(() => {
    const curr = currentHighlight
    const index: number = puzzle?.gridnums.indexOf(curr) as number
    setHighlights((prev) => {
      const returnObject = { [index]: "#03adfc77", [curr]: "" }

      // delete returnObject[currentHighlight]

      return returnObject
    })
  }, [currentHighlight, puzzle])

  return (
    <SkeletonTheme baseColor="rgb(87 83 78)" highlightColor="rgb(168 162 158)">
      <div className="flex flex-wrap min-h-screen dark:bg-stone-800 bg-stone-400 dark:text-slate-50">
        {/* {puzzle && answers && ( */}
        <div className="flex flex-col flex-wrap p-2 min-w-[50vw] max-w-[100vw] sm:p-4">
          <header className="max-w-xl my-4 mt-2 font-serif">
            <div className="flex items-baseline gap-4 text-2xl">
              <h1 className="mb-2 text-4xl font-semibold grow">
                {(puzzle && puzzle.publisher) || <Skeleton width={300} />}
              </h1>
              <div className="text-black dark:text-slate-50 text-opacity-60">
                {puzzle && new Date(puzzle.date).toLocaleDateString()}
              </div>
            </div>
            <h2 className="flex gap-4 text-lg grow">
              <div className="flex items-center justify-start gap-2">
                By {(puzzle && puzzle.author) || <Skeleton width={140} />}
              </div>
              <div className="flex gap-2 text-black dark:text-slate-50 text-opacity-60">
                Edited by{" "}
                {(puzzle && puzzle.editor) || <Skeleton width={140} />}
              </div>
            </h2>
            <div className="h-6 mt-4">
              {!showLoadingSpinner && queryData && !queryLoading ? (
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
                })()
              ) : (
                <Skeleton width={200} />
              )}
            </div>
          </header>
          {
            <CrosswordGrid
              puzzle={
                puzzle || {
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
                }
              }
              highlights={highlights}
              answers={answers}
            />
          }
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
        <div className="flex gap-4 p-4 mt-4">
          <div className="max-w-xs w-fit min-w-min">
            <h3 className="text-3xl">Across clues</h3>
            <ul>
              {puzzle?.clues.across.map((clue) => (
                <li
                  onClick={() =>
                    setCurrentHighlight(
                      parseInt(clue.substring(0, clue.indexOf(" ")))
                    )
                  }
                  className="py-1 transition cursor-pointer hover:brightness-75 my-[2px] opacity-90"
                  dangerouslySetInnerHTML={{
                    __html: `<span class="font-semibold">${clue.substring(
                      0,
                      clue.indexOf(" ")
                    )}</span> ${clue.substring(clue.indexOf(" "))}`,
                  }}
                ></li>
              ))}
            </ul>
          </div>
          <div className="max-w-sm w-fit min-w-min">
            <h3 className="text-3xl">Down clues</h3>
            <ul>
              {puzzle?.clues.down.map((clue) => (
                <li
                  onClick={() =>
                    setCurrentHighlight(
                      parseInt(clue.substring(0, clue.indexOf(" ")))
                    )
                  }
                  className="py-1 transition cursor-pointer hover:brightness-75 my-[2px] opacity-90"
                  dangerouslySetInnerHTML={{
                    __html: `<span class="font-semibold">${clue.substring(
                      0,
                      clue.indexOf(" ")
                    )}</span> ${clue.substring(clue.indexOf(" "))}`,
                  }}
                ></li>
              ))}
            </ul>
          </div>
        </div>
        {/* )} */}
      </div>
    </SkeletonTheme>
  )
}
export default GameView
