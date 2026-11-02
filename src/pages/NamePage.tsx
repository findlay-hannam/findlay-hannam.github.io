import { useLocation } from 'wouter'
import DeleteButton from '../components/DeleteButton'
import SurnameForm from '../components/SurnameForm'
import { combinations, findName } from '../lib/names'
import type { CategoryId, Stored } from '../lib/rules'
import { useNames } from '../lib/store'

type Props = { category: CategoryId; slug: string; names?: Stored }

export default function NamePage({ category, slug, names }: Props) {
  const live = useNames()
  const [, navigate] = useLocation()
  const data = names ?? live
  const { surname } = data
  const lists = data[category]
  const found = findName(lists, slug)
  if (!found) {
    return (
      <article>
        <h2>Name not found</h2>
      </article>
    )
  }
  const combos = surname === undefined ? undefined : combinations(lists, found.name, surname)
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
      <div className="name-row">
        <DeleteButton category={category} name={found.name} onDeleted={() => navigate(`/${category}`)} />
      </div>
    </article>
  )
}
