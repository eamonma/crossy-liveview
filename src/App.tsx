import React from "react"
import { FaPlus } from "react-icons/fa"

function App() {
  return (
    <div className="min-h-screen App dark:bg-stone-800 dark:text-slate-50">
      <main className="text-lg">
        <nav className="flex items-center h-20">
          <h1 className="p-4 font-serif text-3xl">Crossy</h1>
        </nav>
        <div className="flex flex-col items-center justify-center w-screen py-4 min-h-[calc(100vh-5rem)] bg-opacity-30 dark:bg-opacity-30 dark:bg-stone-700 bg-stone-100">
          <div className="relative flex flex-col items-start p-4 bottom-10">
            <h2 className="max-w-xl text-5xl">
              Solve crosswords collaboratively on Discord.
            </h2>
            <a
              href="/#"
              className="flex items-center gap-2 p-3 px-5 my-4 mb-6 ml-0 font-semibold transition shadow-sm bg-[#5865F2] rounded-xl"
            >
              <span className="relative scale-105 top-[1px]">
                <FaPlus />
              </span>
              Invite to server
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
