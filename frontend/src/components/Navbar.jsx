import { useNavigate } from "react-router-dom"

function Navbar() {

  const navigate = useNavigate()

  const handleLogout = () => {

    localStorage.removeItem("token")

    navigate("/")
  }

  return (
    <div className="bg-zinc-900 px-8 py-4 flex items-center justify-between rounded-2xl mb-8">

      <h1 className="text-2xl font-bold text-white">
        DEVCOLLAB 🚀
      </h1>

      <button
        onClick={handleLogout}
        className="bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-300"
      >
        Logout
      </button>

    </div>
  )
}

export default Navbar