import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Shop from './pages/Shop'
import Updates from './pages/Updates'
import Waiver from './pages/Waiver'
import Classes from './pages/Classes'
import OrderSuccess from './pages/OrderSuccess'
import BuildABoard from './pages/BuildABoard'
import WallOfStoke from './pages/WallOfStoke'
import Admin from './pages/Admin'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="shop" element={<Shop />} />
        <Route path="updates" element={<Updates />} />
        <Route path="waiver" element={<Waiver />} />
        <Route path="classes" element={<Classes />} />
        <Route path="order-success" element={<OrderSuccess />} />
        <Route path="build" element={<BuildABoard />} />
        <Route path="wall" element={<WallOfStoke />} />
      </Route>
      <Route path="admin" element={<Admin />} />
    </Routes>
  )
}

export default App