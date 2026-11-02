import { Link } from 'wouter'
import { config } from '../data/config'
import type { CategoryId, Config } from '../data/config'
import { firstNames } from '../lib/names'

export default function CategoryList({ category, cfg = config }: { category: CategoryId; cfg?: Config }) {
  const names = firstNames(category, cfg)
  return (
    <article>
      <header>
        <h2>{category === 'boys' ? 'Boys' : 'Girls'} names</h2>
      </header>
      {names.length === 0 ? (
        <p>No names yet.</p>
      ) : (
        <ul>
          {names.map(({ name, slug }) => (
            <li key={slug}>
              <Link href={`/${category}/${slug}`}>{name}</Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
