export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="px-6 py-3 flex items-center justify-between text-xs text-gray-500">
        <p>© {new Date().getFullYear()} TicTac</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-gray-700">Mentions légales</a>
          <a href="#" className="hover:text-gray-700">Contact</a>
          <span>v0.1.0</span>
        </div>
      </div>
    </footer>
  )
}
