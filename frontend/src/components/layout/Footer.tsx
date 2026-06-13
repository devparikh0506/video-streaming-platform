import { Icon } from '@/components/ui/Icon'

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <div>
          <span className="app-footer__brand">
            <Icon name="play" size={16} />
            StreamForge
          </span>
          <p className="app-footer__note">Upload, transcode, and stream — DASH-native.</p>
        </div>
        <nav className="app-footer__links" aria-label="Footer">
          <a href="#browse">Browse</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#about">About</a>
        </nav>
      </div>
    </footer>
  )
}
