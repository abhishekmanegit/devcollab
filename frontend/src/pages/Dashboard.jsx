import { useEffect, useState } from "react"
import api from "../services/api"

function Dashboard() {

  const [projects, setProjects] = useState([])

  useEffect(() => {

    fetchProjects()

  }, [])

  const fetchProjects = async () => {

    try {

      const response = await api.get("/projects")

      setProjects(response.data)

    } catch (error) {

      console.log(error)
    }
  }

  const joinProject = async (projectId) => {

  try {

    const response = await api.post(
      `/projects/${projectId}/join`
    )

    alert(response.data)

  } catch (error) {

    console.log(error)

    alert("Failed to join project")
  }
}

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-4xl font-bold mb-8">
        DEVCOLLAB 🚀
      </h1>

      <div className="grid gap-6">

        {projects.map((project) => (

          <div
            key={project.id}
            className="bg-zinc-900 p-6 rounded-2xl shadow-lg"
          >

            <h2 className="text-2xl font-bold">
              {project.title}
            </h2>

            <p className="text-gray-400 mt-2">
              {project.description}
            </p>

            <p className="mt-4 text-sm text-gray-500">
              Created by: {project.createdBy?.name}
            </p>

            <p className="mt-4 text-sm text-gray-500">
  Created by: {project.createdBy?.name}
</p>

<button
  onClick={() => joinProject(project.id)}
  className="mt-4 bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-300"
>
  Join Project
</button>
          </div>

        ))}

      </div>

    </div>
  )
}

export default Dashboard