import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Updates from './pages/Updates'
import Waiver from './pages/Waiver'
import Classes from './pages/Classes'
import OrderSuccess from './pages/OrderSuccess'
import BuildABoard from './pages/BuildABoard'
import WallOfStoke from './pages/WallOfStoke'
import WaiverSign from './pages/WaiverSign'
import Admin from './pages/Admin'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Shipping from './pages/Shipping'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="shop" element={<Shop />} />
        <Route path="shop/:handle" element={<Product />} />
        <Route path="updates" element={<Updates />} />
        <Route path="waiver" element={<Waiver />} />
        <Route path="classes" element={<Classes />} />
        <Route path="order-success" element={<OrderSuccess />} />
        <Route path="build" element={<BuildABoard />} />
        <Route path="wall" element={<WallOfStoke />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="shipping" element={<Shipping />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="waiver-sign" element={<WaiverSign />} />
      <Route path="admin" element={<Admin />} />
    </Routes>
  )
}

export default App