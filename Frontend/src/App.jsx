import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>If you're seeing this, App.tsx works.</div>
      <button onClick={() => setCount(prev => prev + 1)}>{count}</button>
    </>
  )
}

export default App
