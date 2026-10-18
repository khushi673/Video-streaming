import { HashRouter, Routes, Route } from 'react-router-dom'
import Shell from './components/Shell'
import Auth from './pages/Auth'
import Home from './pages/Home'
import ShowPage from './pages/Show'
import Player from './pages/Player'
import Plans from './pages/Plans'
import Coins from './pages/Coins'
import Account from './pages/Account'
import Search from './pages/Search'
import Browse from './pages/Browse'
import Admin from './admin/Admin'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route element={<Shell />}>
          <Route index element={<Home />} />
          <Route path="show/:id" element={<ShowPage />} />
          <Route path="watch/:id/:ep" element={<Player />} />
          <Route path="plans" element={<Plans />} />
          <Route path="coins" element={<Coins />} />
          <Route path="account" element={<Account />} />
          <Route path="search" element={<Search />} />
          <Route path="browse/:kind" element={<Browse />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
