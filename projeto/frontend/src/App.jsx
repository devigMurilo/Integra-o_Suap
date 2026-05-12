import { useEffect, useState } from 'react'

function App() {
  const [msg, setMsg] = useState('Carregando...')

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/hello/')
      .then((res) => res.json())
      .then((data) => {
        setMsg(data.message)
      })
      .catch((error) => {
        console.error(error)
        setMsg('Erro ao conectar API')
      })
  }, [])

  return (
    <div>
      <h1>{msg}</h1>
    </div>
  )
}

export default App