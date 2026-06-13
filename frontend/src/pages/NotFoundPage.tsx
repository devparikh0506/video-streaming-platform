import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="page notfound">
      <p className="notfound__code">404</p>
      <p className="notfound__text">That page wandered off the reel.</p>
      <Link to="/" className="btn btn--primary btn--lg">
        Back to browse
      </Link>
    </div>
  )
}
