import { Link } from 'wouter'
import AddNameForm from '../components/AddNameForm'
import DeleteButton from '../components/DeleteButton'
import MoveButton from '../components/MoveButton'
import RowMenu from '../components/RowMenu'
import SurnameForm from '../components/SurnameForm'
import { firstNames, middleOnly } from '../lib/names'
import type { CategoryId, Stored } from '../lib/rules'
import { useNames } from '../lib/store'

export default function CategoryList({ category, names }: { category: CategoryId; names?: Stored }) {
  const live = useNames()
  const data = names ?? live
  const lists = data[category]
  const first = firstNames(lists)
  const middle = middleOnly(lists)
  const label = (name: string) => (data.surname === undefined ? name : `${name} ${data.surname}`)
  const title = `${category === 'boys' ? 'Boys' : 'Girls'} names`
  return (
    <article>
      <title>{`${title} · Baby Names`}</title>
      <header>
        <h2>{title}</h2>
      </header>
      {data.surname === undefined ? <SurnameForm /> : <AddNameForm category={category} />}
      {first.length === 0 && middle.length === 0 && (
        <p>
          {`No ${category}’ names yet. ${data.surname === undefined ? 'Set your last name above, then add the first one.' : 'Add the first one above.'}`}
        </p>
      )}
      {first.length > 0 && (
        <>
          <h3>First names</h3>
          <ul className="name-list">
            {first.map(({ name, slug }) => (
              <li key={slug} className="name-row">
                <Link href={`/${category}/${slug}`} className="name-link">
                  <span>{label(name)}</span>
                  <span aria-hidden="true">›</span>
                </Link>
                <RowMenu name={name}>
                  <MoveButton category={category} name={name} to="middle" />
                  <DeleteButton category={category} name={name} />
                </RowMenu>
              </li>
            ))}
          </ul>
        </>
      )}
      {middle.length > 0 && (
        <>
          <h3>Middle names only</h3>
          <ul className="name-list">
            {middle.map((name) => (
              <li key={name} className="name-row">
                <span className="name-text">{name}</span>
                <RowMenu name={name}>
                  <MoveButton category={category} name={name} to="first" />
                  <DeleteButton category={category} name={name} />
                </RowMenu>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  )
}
