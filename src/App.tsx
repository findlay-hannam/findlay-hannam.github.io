import { Route, Switch } from 'wouter'
import { isCategory } from './lib/names'
import CategoryList from './pages/CategoryList'
import Home from './pages/Home'
import NamePage from './pages/NamePage'
import NotFound from './pages/NotFound'

function App() {
  return (
    <>
      <header className="container">
        <hgroup>
          <h1>Baby Names</h1>
          <p>Combine, organise and list names.</p>
        </hgroup>
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
