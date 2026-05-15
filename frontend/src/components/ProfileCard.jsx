function ProfileCard() {

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-3xl border border-zinc-700 shadow-xl mb-8">

      <div className="flex items-center gap-4">

        <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-2xl font-bold">
          A
        </div>

        <div>

          <h2 className="text-2xl font-bold text-white">
            Abhi
          </h2>

          <p className="text-gray-400">
            Full Stack Developer
          </p>

        </div>

      </div>

      <div className="mt-6">

        <h3 className="text-lg font-bold mb-2">
          Skills
        </h3>

        <div className="flex gap-3 flex-wrap">

          <span className="bg-zinc-800 px-4 py-2 rounded-xl text-sm">
            React
          </span>

          <span className="bg-zinc-800 px-4 py-2 rounded-xl text-sm">
            Spring Boot
          </span>

          <span className="bg-zinc-800 px-4 py-2 rounded-xl text-sm">
            PostgreSQL
          </span>

        </div>

      </div>

    </div>
  )
}

export default ProfileCard