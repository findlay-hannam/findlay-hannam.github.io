import SurnameForm from '../components/SurnameForm'
import { useNames } from '../lib/store'

export default function Home() {
  const { surname } = useNames()
  return (
    <article>
      {surname === undefined ? <p>Set your last name to see full names.</p> : <p>{`Last name: ${surname}`}</p>}
      <SurnameForm />
    </article>
  )
}
