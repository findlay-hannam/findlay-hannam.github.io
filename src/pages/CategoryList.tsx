import { Link } from 'wouter'
import AddNameForm from '../components/AddNameForm'
import DeleteButton from '../components/DeleteButton'
import MoveButton from '../components/MoveButton'
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
  return (
    <article>
      <header>
        <h2>{category === 'boys' ? 'Boys' : 'Girls'} names</h2>
      </header>
      {data.surname === undefined ? <SurnameForm /> : <AddNameForm category={category} />}
      {first.length === 0 && middle.length === 0 && <p>No names yet.</p>}
      {first.length > 0 && (
        <>
          <h3>First and middle names</h3>
          <ul>
            {first.map(({ name, slug }) => (
              <li key={slug}>
                <Link href={`/${category}/${slug}`}>{name}</Link> <MoveButton category={category} name={name} to="middle" />{' '}
                <DeleteButton category={category} name={name} />
              </li>
            ))}
          </ul>
        </>
      )}
      {middle.length > 0 && (
        <>
          <h3>Middle names only</h3>
          <ul>
            {middle.map((name) => (
              <li key={name}>
                {name} <MoveButton category={category} name={name} to="first" />{' '}
                <DeleteButton category={category} name={name} />
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  )
}
