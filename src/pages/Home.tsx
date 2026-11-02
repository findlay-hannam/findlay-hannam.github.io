import { Link } from 'wouter'
import SurnameForm from '../components/SurnameForm'
import { useNames } from '../lib/store'

export default function Home() {
  const { surname } = useNames()
  return (
    <>
      {surname === undefined ? <p>Set your surname to see full names.</p> : <p>Surname: {surname}</p>}
      <SurnameForm />
      <nav>
        <ul>
          <li>
            <Link href="/boys">Boys</Link>
          </li>
          <li>
            <Link href="/girls">Girls</Link>
          </li>
        </ul>
      </nav>
    </>
  )
}
