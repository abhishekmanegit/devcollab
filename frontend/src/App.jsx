import { Routes, Route } from "react-router-dom"
import ProtectedRoute from "./components/ProtectedRoute"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

function App() {

  return (
    <Routes>

      <Route path="/" element={<Login />} />
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

    </Routes>
  )
}

export default App