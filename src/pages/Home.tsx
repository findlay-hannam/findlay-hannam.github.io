import { Link } from 'wouter'

export default function Home() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/boys">Boys</Link>
        </li>
        <li>
          <Link href="/girls">Girls</Link>
        </li>
      </ul>
    </nav>
  )
}
