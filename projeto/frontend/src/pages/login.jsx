const login = async () => {

  const response = await fetch(
    "http://127.0.0.1:8000/api/login/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    }
  )

  const data = await response.json()

  console.log(data)
}