import { useSubscription } from "@apollo/client"
import React from "react"

function App() {
  return (
    <div className="min-h-screen App dark:bg-stone-800 dark:text-slate-50">
      <main className="text-lg">
        <h1 className="p-4 font-serif text-3xl">Crossy</h1>
        <div className="min-h-[calc(100vh-20rem)] py-4 dark:bg-stone-700 flex w-screen justify-center flex-col items-center">
          <div className="flex flex-col items-start p-4">
            <h2 className="max-w-xl text-5xl">
              Solve crosswords collaboratively on Discord.
            </h2>
            <a
              href="#"
              className="p-3 px-5 my-4 ml-0 font-semibold transition shadow-sm dark:bg-sky-700 hasHover:hover:dark:bg-sky-600 rounded-xl"
            >
              Add to server
            </a>
            <div className="flex flex-wrap gap-2 -ml-3 text-base text-sky-800 dark:text-sky-300">
              <a
                className="p-1 px-4 transition hasHover:hover:dark:text-sky-200 hasHover:hover:text-sky-600"
                href="https://github.com/eamonma/crossy-api"
              >
                API source
              </a>
              <a
                className="p-1 px-4 transition hasHover:hover:dark:text-sky-200 hasHover:hover:text-sky-600"
                href="https://github.com/eamonma/crossy-bot"
              >
                Bot source
              </a>
              <a
                className="p-1 px-4 transition hasHover:hover:dark:text-sky-200 hasHover:hover:text-sky-600"
                href="https://github.com/eamonma/crossy-grid"
              >
                Grid renderer source
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
