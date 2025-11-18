import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  BarChart3,
  DollarSign,
  CreditCard,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { useState } from 'react'

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
  },
  {
    title: 'Utilisateurs',
    icon: Users,
    href: '/admin/users',
  },
  {
    title: 'Demandes',
    icon: FileText,
    href: '/admin/demandes',
  },
  {
    title: 'Offres',
    icon: FileText,
    href: '/admin/offres',
  },
  {
    title: 'Commissions',
    icon: DollarSign,
    href: '/admin/commissions',
  },
  {
    title: 'Payouts',
    icon: CreditCard,
    href: '/admin/payouts',
  },
  {
    title: 'Statistiques',
    icon: BarChart3,
    href: '/admin/stats',
  },
  {
    title: 'Paramètres',
    icon: Settings,
    href: '/admin/settings',
  },
]

export function AdminSidebar({ onLogout }) {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white transition-transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          {/* Logout button */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
