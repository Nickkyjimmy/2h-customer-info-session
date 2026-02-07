'use client'

import { useStore } from '@/store/useStore'

export default function Home() {
  const { count, increment, decrement, reset } = useStore()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">
          2h-customer-info-session
        </h1>
      </div>

      <div className="flex flex-col items-center gap-4 p-8 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black shadow-sm">
        <h2 className="text-2xl font-semibold">Zustand Counter</h2>
        <div className="text-6xl font-bold my-4">{count}</div>
        <div className="flex gap-2">
          <button
            onClick={decrement}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Decrement
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={increment}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Increment
          </button>
        </div>
      </div>
      
      <div className="mt-12 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
           <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100/30 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h2 className="mb-3 text-2xl font-semibold">
              Tailwind 4.0{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Configured and ready to use.
            </p>
          </div>
      </div>
    </main>
  )
}
