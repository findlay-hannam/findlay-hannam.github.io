import { Link, Route, Switch } from 'wouter'
import { isCategory } from './lib/names'
import CategoryList from './pages/CategoryList'
import Home from './pages/Home'
import NamePage from './pages/NamePage'
import NotFound from './pages/NotFound'

function App() {
  return (
    <>
      <header className="container">
        <nav aria-label="Main">
          <ul>
            <li>
              <Link href="/boys">Boys</Link>
            </li>
            <li>
              <Link href="/girls">Girls</Link>
            </li>
            <li>
              <Link href="/">Set Last Name</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="container">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/:category/:slug">
            {({ category, slug }) => {
              const c = category.toLowerCase()
              return isCategory(c) ? <NamePage category={c} slug={slug.toLowerCase()} /> : <NotFound />
            }}
          </Route>
          <Route path="/:category">
            {({ category }) => {
              const c = category.toLowerCase()
              return isCategory(c) ? <CategoryList category={c} /> : <NotFound />
            }}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
    </>
  )
}

export default App
