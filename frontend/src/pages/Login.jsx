import { useState } from "react"
import api from "../services/api"
import { useNavigate } from "react-router-dom"

function Login() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async () => {

    try {

      const response = await api.post("/auth/login", {
        email,
        password,
      })

      // save token
      localStorage.setItem("token", response.data)

      navigate("/dashboard")

      console.log(response.data)

    } catch (error) {

      console.log(error)

      alert("Login failed ❌")
    }
  }

  return (
    <div className="h-screen bg-black flex items-center justify-center">
      
      <div className="bg-zinc-900 p-8 rounded-2xl w-96 shadow-xl">

        <h1 className="text-white text-3xl font-bold mb-6 text-center">
          DEVCOLLAB 🚀
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-zinc-800 text-white outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-zinc-800 text-white outline-none"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-white text-black p-3 rounded-lg font-bold hover:bg-gray-300"
        >
          Login
        </button>

      </div>
    </div>
  )
}

export default Login