import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, ArrowLeftRight, Clock, User, LogOut,
  Building2, Menu, X, Shield
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import styles from './Layout.module.css'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/transfer', label: 'Transfer', Icon: ArrowLeftRight },
  { to: '/transactions', label: 'Transactions', Icon: Clock },
  { to: '/profile', label: 'Profile', Icon: User },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}><Building2 size={22} /></div>
            <span className={styles.logoText}>BankEase</span>
          </div>
          <button className={styles.closeSidebar} onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userChip}>
            <div className={styles.avatar}>{user?.fullName?.[0]?.toUpperCase() || 'U'}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.fullName || 'User'}</span>
              <span className={styles.userEmail}>{user?.email || ''}</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className={styles.topbarRight}>
            <div className={styles.securedBadge}>
              <Shield size={14} />
              <span>Secured</span>
            </div>
            <div className={styles.avatarSm}>{user?.fullName?.[0]?.toUpperCase() || 'U'}</div>
          </div>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

