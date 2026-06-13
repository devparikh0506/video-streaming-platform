import { Link, NavLink } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'

const navItems = [
  { to: '/', label: 'Browse', end: true },
  { to: '/dashboard', label: 'Dashboard', end: false },
]

export function Header() {
  return (
    <header className="app-header">
      <Link to="/" className="app-header__brand">
        <span className="app-header__brand-mark">
          <Icon name="play" />
        </span>
        StreamForge
      </Link>

      <nav className="app-header__nav app-header__nav-labels" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `app-header__link${isActive ? ' app-header__link--active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <span className="app-header__spacer" />

      <div className="app-header__actions">
        <label className="searchbar">
          <Icon name="search" />
          <input type="search" placeholder="Search videos" aria-label="Search videos" />
        </label>
        <Link to="/dashboard" className="btn btn--primary btn--sm">
          <Icon name="upload" />
          Upload
        </Link>
      </div>
    </header>
  )
}
