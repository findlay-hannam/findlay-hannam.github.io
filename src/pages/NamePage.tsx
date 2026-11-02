import { useLocation } from 'wouter'
import DeleteButton from '../components/DeleteButton'
import AddNameForm from '../components/AddNameForm'
import MoveButton from '../components/MoveButton'
import RowMenu from '../components/RowMenu'
import SurnameForm from '../components/SurnameForm'
import { combinations, findMiddleOnly, findName, nameFromSlug } from '../lib/names'
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
    // Say what was looked for, and offer the one fix that makes the page exist.
    const middle = findMiddleOnly(lists, slug)
    const guess = nameFromSlug(slug)
    const who = guess || 'That name'
    return (
      <article>
        <title>Name not found · Baby Names</title>
        <h2>Name not found</h2>
        {middle !== undefined ? (
          <>
            <p>{`${middle} is a middle name only, so it has no page of its own.`}</p>
            <p>
              <MoveButton category={category} name={middle} to="first" label={`Make ${middle} a first name`} />
            </p>
          </>
        ) : surname === undefined ? (
          <p>{`${who} isn’t in the ${category} names yet. Set your last name to add it.`}</p>
        ) : (
          <>
            <p>{`${who} isn’t in the ${category} names yet.`}</p>
            <AddNameForm category={category} initialName={guess} />
          </>
        )}
      </article>
    )
  }
  const count = combinations(lists, found.name, '').length
  const isFirst = (name: string) => lists.first.some((f) => f.toLowerCase() === name.toLowerCase())
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
            <li key={c.middle} className="name-row">
              <span className="name-text">
                <span>
                  {c.first} <strong>{c.middle}</strong> {c.surname}
                </span>
              </span>
              {/* Actions act on this card's middle name; only a middle-only name can be upgraded. */}
              <RowMenu name={c.middle}>
                {!isFirst(c.middle) && <MoveButton category={category} name={c.middle} to="first" />}
                <DeleteButton category={category} name={c.middle} />
              </RowMenu>
            </li>
          ))}
        </ul>
      )}
      <div className="name-row">
        <DeleteButton category={category} name={found.name} showName onDeleted={() => navigate(`/${category}`)} />
      </div>
    </article>
  )
}
