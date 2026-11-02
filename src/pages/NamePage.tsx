import { Link } from 'wouter'
import { config } from '../data/config'
import type { CategoryId, Config } from '../data/config'
import { combinations, findName } from '../lib/names'

type Props = { category: CategoryId; slug: string; cfg?: Config }

export default function NamePage({ category, slug, cfg = config }: Props) {
  const found = findName(category, slug, cfg)
  if (!found) {
    return (
      <article>
        <h2>Name not found</h2>
        <p>
          <Link href={`/${category}`}>Back to the {category} list</Link>
        </p>
      </article>
    )
  }
  const combos = combinations(category, found.name, cfg)
  return (
    <article>
      <header>
        <h2>{found.name}</h2>
      </header>
      {combos.length === 0 ? (
        <p>No combinations yet.</p>
      ) : (
        <ul>
          {combos.map((c) => (
            <li key={c.middle}>{c.full}</li>
          ))}
        </ul>
      )}
      <footer>
        <Link href={`/${category}`}>Back to the {category} list</Link>
      </footer>
    </article>
  )
}
