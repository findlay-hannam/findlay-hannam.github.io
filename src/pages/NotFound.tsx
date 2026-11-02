import { Link } from 'wouter'

export default function NotFound() {
  return (
    <article>
      <h2>Page not found</h2>
      <p>
        <Link href="/">Back home</Link>
      </p>
    </article>
  )
}
