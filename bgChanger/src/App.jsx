import { useState } from 'react'

function App() {
  const [color, setColor] = useState('olive')

  return (
    <>
      <div className="w-full h-screen duration-200" style={{ backgroundColor: color }}>

        <div className='fixed flex flex-wrap justify-center bottom-12 inset-x-0 px-2'>
          <div className='flex flex-wrap justify-center gap-3 shadow-lg bg-white px-3 py-2 rounded-3xl'>
            <button
              onClick={() => setColor('red')}
              className='outline-none px-4 py-1 rounded-full cursor-pointer bg-red-500 text-white shadow-lg'>Red</button>
            <button
              onClick={() => setColor('green')}
              className='outline-none px-4 py-1 rounded-full cursor-pointer bg-green-500 text-white shadow-lg'>Green</button>
            <button
              onClick={() => setColor('blue')}
              className='outline-none px-4 py-1 rounded-full cursor-pointer bg-blue-500 text-white shadow-lg'>Blue</button>
            <button
              onClick={() => setColor('yellow')}
              className='outline-none px-4 py-1 rounded-full cursor-pointer bg-yellow-500 text-white shadow-lg'>Yellow</button>
            <button
              onClick={() => setColor('purple')}
              className='outline-none px-4 py-1 rounded-full cursor-pointer bg-purple-500 text-white shadow-lg'>Purple</button>
            <button
              onClick={() => setColor('pink')}
              className='outline-none px-4 py-1 rounded-full cursor-pointer bg-pink-500 text-white shadow-lg'>Pink</button>
            <button
              onClick={() => setColor('gray')}
              className='outline-none px-4 py-1 rounded-full cursor-pointer bg-gray-500 text-white shadow-lg'>Gray</button>
            <button
              onClick={() => setColor('black')}
              className='outline-none px-4 py-1 rounded-full cursor-pointer bg-black text-white shadow-lg'>Black</button>
            <button
              onClick={() => setColor('white')}
              className='outline-none px-4 py-1 rounded-full cursor-pointer bg-white text-black shadow-lg'>White</button>
          </div>

        </div>
      </div>
    </>
  )
}

export default App
