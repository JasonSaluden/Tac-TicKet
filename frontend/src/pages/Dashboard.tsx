import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tac-TicKet</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.firstName} {user?.lastName}
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                {user?.role}
              </span>
            </span>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-500 text-sm">Dashboard — your teammates will build this part.</p>
        </div>
      </div>
    </div>
  )
}
