import { useEffect, useState } from 'react'

function App() {
  const [aluno, setAluno] = useState('Carregando...')

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/aluno/')
      .then((res) => res.json())
      .then((data) => {
        setAluno(data)
      })
      .catch((error) => {
        console.error(error)
        setAluno('Erro ao conectar API')
      })
  }, [])

  return (
    <div>
      <h1>{aluno.nome}</h1>
      <p>Curso: {aluno.curso}</p>
      <p>Idade: {aluno.idade}</p>
    </div>
  )
}

export default App