import { Link } from 'wouter'
import DeleteButton from '../components/DeleteButton'
import MoveButton from '../components/MoveButton'
import RowMenu from '../components/RowMenu'
import SurnameForm from '../components/SurnameForm'
import { findMiddle, findName, nextMiddles } from '../lib/names'
import type { CategoryId, Stored } from '../lib/rules'
import { useNames } from '../lib/store'
import NamePage from './NamePage'
import NotFound from './NotFound'

type Props = { category: CategoryId; slug: string; middle: string; names?: Stored }

/** Second middle names for "First Middle": the deepest level (two middle names at most). */
export default function ChainPage({ category, slug, middle, names }: Props) {
  const live = useNames()
  const data = names ?? live
  const { surname } = data
  const lists = data[category]
  const first = findName(lists, slug)
  if (!first) return <NamePage category={category} slug={slug} names={names} />
  const second = findMiddle(lists, middle)
  if (!second || second.toLowerCase() === first.name.toLowerCase()) return <NotFound />
  const chain = [first.name, second]
  const options = nextMiddles(lists, chain)
  const isFirst = (name: string) => lists.first.some((f) => f.toLowerCase() === name.toLowerCase())
  return (
    <article>
      <title>{`${chain.join(' ')} · Baby Names`}</title>
      <header>
        <hgroup>
          <h2>{chain.join(' ')}</h2>
          <p>{options.length === 0 ? 'No combinations yet' : `${options.length} combination${options.length === 1 ? '' : 's'}`}</p>
        </hgroup>
        <Link href={`/${category}/${first.slug}`}>← Back</Link>
      </header>
      {surname === undefined ? (
        <SurnameForm />
      ) : options.length === 0 ? (
        <p>{`Add more middle names to the ${category} list to see full names.`}</p>
      ) : (
        <ul className="combo-list">
          {options.map((m) => (
            <li key={m} className="name-row">
              <span className="name-text">
                <span>
                  {chain.join(' ')} <strong>{m}</strong> {surname}
                </span>
              </span>
              <RowMenu name={m}>
                {!isFirst(m) && <MoveButton category={category} name={m} to="first" />}
                <DeleteButton category={category} name={m} />
              </RowMenu>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
