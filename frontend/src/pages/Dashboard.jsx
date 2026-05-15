import { useEffect, useState } from "react"
import api from "../services/api"
import Navbar from "../components/Navbar"

function Dashboard() {

  const [projects, setProjects] = useState([])
  const [comments, setComments] = useState({})
const [commentText, setCommentText] = useState("")
const [title, setTitle] = useState("")
const [description, setDescription] = useState("")

  useEffect(() => {

    fetchProjects()
    projects.forEach((project) => {
  fetchComments(project.id)
})

  }, [])

  const fetchProjects = async () => {

  try {

    const response = await api.get("/projects")

    setProjects(response.data)

    response.data.forEach((project) => {
      fetchComments(project.id)
    })

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

const fetchComments = async (projectId) => {

  try {

    const response = await api.get(
      `/projects/${projectId}/comments`
    )

    setComments((prev) => ({
      ...prev,
      [projectId]: response.data,
    }))

  } catch (error) {

    console.log(error)
  }
}

const addComment = async (projectId) => {

  try {

    await api.post(
      `/projects/${projectId}/comments`,
      {
        content: commentText,
      }
    )

    setCommentText("")

    fetchComments(projectId)

  } catch (error) {

    console.log(error)
  }
}

const createProject = async () => {

  try {

    await api.post("/projects", {
      title,
      description,
    })

    setTitle("")
    setDescription("")

    fetchProjects()

  } catch (error) {

    console.log(error)
  }
}

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <Navbar />

      <div className="bg-zinc-900 p-6 rounded-2xl mb-8">

  <h2 className="text-2xl font-bold mb-4">
    Create Project
  </h2>

  <input
    type="text"
    placeholder="Project title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    className="w-full p-3 mb-4 rounded-lg bg-zinc-800 text-white outline-none"
  />

  <textarea
    placeholder="Project description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    className="w-full p-3 mb-4 rounded-lg bg-zinc-800 text-white outline-none"
  />

  <button
    onClick={createProject}
    className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-300"
  >
    Create Project
  </button>

</div>

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

<div className="mt-6">

  <h3 className="font-bold mb-2">
    Comments
  </h3>

  <div className="space-y-2">

    {comments[project.id]?.map((comment) => (

      <div
        key={comment.id}
        className="bg-zinc-800 p-3 rounded-lg"
      >

        <p className="text-sm text-gray-300">
          {comment.content}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          {comment.user?.name}
        </p>

      </div>

    ))}

  </div>

  <div className="flex gap-2 mt-4">

    <input
      type="text"
      placeholder="Write a comment..."
      value={commentText}
      onChange={(e) => setCommentText(e.target.value)}
      className="flex-1 p-2 rounded-lg bg-zinc-800 text-white outline-none"
    />

    <button
      onClick={() => addComment(project.id)}
      className="bg-white text-black px-4 rounded-lg font-bold"
    >
      Send
    </button>

  </div>

</div>
          </div>

        ))}

      </div>

    </div>
  )
}

export default Dashboard