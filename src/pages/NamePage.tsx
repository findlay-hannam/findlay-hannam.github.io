import { Link } from 'wouter'
import SurnameForm from '../components/SurnameForm'
import type { CategoryId } from '../data/config'
import { combinations, findName } from '../lib/names'
import type { Names } from '../lib/rules'
import { useNames } from '../lib/store'

type Props = { category: CategoryId; slug: string; names?: Names }

export default function NamePage({ category, slug, names }: Props) {
  const live = useNames()
  const { surname, cfg } = names ?? live
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
  const combos = surname === undefined ? undefined : combinations(category, found.name, surname, cfg)
  return (
    <article>
      <header>
        <h2>{found.name}</h2>
      </header>
      {combos === undefined ? (
        <SurnameForm />
      ) : combos.length === 0 ? (
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
