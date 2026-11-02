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
        <title>Name not found · Baby Names</title>
        <h2>Name not found</h2>
      </article>
    )
  }
  const count = combinations(lists, found.name, '').length
  const countLabel = count === 0 ? 'No combinations yet' : `${count} combination${count === 1 ? '' : 's'}`
  const combos = surname === undefined ? undefined : combinations(lists, found.name, surname)
  return (
    <article>
      <title>{`${found.name} · Baby Names`}</title>
      <header>
        <hgroup>
          <h2>{found.name}</h2>
          <p>{countLabel}</p>
        </hgroup>
      </header>
      {combos === undefined ? (
        <SurnameForm />
      ) : combos.length === 0 ? (
        <p>{`Add more middle names to the ${category} list to see full names.`}</p>
      ) : (
        <ul className="combo-list">
          {combos.map((c) => (
            <li key={c.middle}>
              {c.first} <strong>{c.middle}</strong> {c.surname}
            </li>
          ))}
        </ul>
      )}
      <div className="name-row">
        <DeleteButton category={category} name={found.name} onDeleted={() => navigate(`/${category}`)} />
      </div>
    </article>
  )
}
