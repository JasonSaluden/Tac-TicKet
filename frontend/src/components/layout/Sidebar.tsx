import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

type Role = 'ADMIN' | 'AGENT' | 'USER'

const links: { to: string; label: string; icon: string; roles?: Role[] }[] = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/tickets', label: 'Tickets', icon: '🎫' },
  { to: '/tickets/new', label: 'Nouveau ticket', icon: '➕' },
  { to: '/profile', label: 'Profil', icon: '👤' },
  { to: '/admin', label: 'Admin', icon: '⚙️', roles: ['ADMIN'] },
]

export default function Sidebar() {
  const { user } = useAuth()

  const visibleLinks = links.filter(
    l => !l.roles || (user && l.roles.includes(user.role)),
  )

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200">
      <nav className="p-4 space-y-1">
        {visibleLinks.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
