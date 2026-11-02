import { Link } from 'wouter'
import AddNameForm from '../components/AddNameForm'
import SurnameForm from '../components/SurnameForm'
import type { CategoryId } from '../data/config'
import { firstNames } from '../lib/names'
import type { Names } from '../lib/rules'
import { useNames } from '../lib/store'

export default function CategoryList({ category, names }: { category: CategoryId; names?: Names }) {
  const live = useNames()
  const { surname, cfg } = names ?? live
  const list = firstNames(category, cfg)
  return (
    <article>
      <header>
        <h2>{category === 'boys' ? 'Boys' : 'Girls'} names</h2>
      </header>
      {surname === undefined ? <SurnameForm /> : <AddNameForm category={category} />}
      {list.length === 0 ? (
        <p>No names yet.</p>
      ) : (
        <ul>
          {list.map(({ name, slug }) => (
            <li key={slug}>
              <Link href={`/${category}/${slug}`}>{name}</Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
