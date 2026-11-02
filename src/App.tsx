import { useState } from 'react'
import { Link, Route, Switch, useLocation } from 'wouter'
import LastNameModal from './components/LastNameModal'
import { isCategory } from './lib/names'
import CategoryList from './pages/CategoryList'
import Home from './pages/Home'
import NamePage from './pages/NamePage'
import NotFound from './pages/NotFound'

function App() {
  const [location] = useLocation()
  // The modal belongs to the page it was opened on: navigating (e.g. back) closes it.
  const [openAt, setOpenAt] = useState<string | null>(null)
  const section = location.split('/')[1]?.toLowerCase() ?? ''
  const theme = isCategory(section) ? section : 'home'
  return (
    <div className="app" data-category={theme}>
      <header className="container">
        <nav aria-label="Main">
          <ul>
            <li>
              <Link href="/boys" className="pill pill-boys">
                Boys
              </Link>
            </li>
            <li>
              <Link href="/girls" className="pill pill-girls">
                Girls
              </Link>
            </li>
            <li>
              <button type="button" className="pill pill-home" aria-haspopup="dialog" onClick={() => setOpenAt(location)}>
                Set Last Name
              </button>
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
      {openAt === location && <LastNameModal onClose={() => setOpenAt(null)} />}
    </div>
  )
}

export default App
