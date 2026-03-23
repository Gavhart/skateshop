import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home' // Corrected casing
import About from './pages/About'
import Shop from './pages/Shop'
import Gallery from './pages/Gallery'
import Waiver from './pages/Waiver'
import './App.css'
import Classes from './pages/Classes'

// Inside Routes:


function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="shop" element={<Shop />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="waiver" element={<Waiver />}/>
        <Route path="classes" element={<Classes />} />
      </Route>
    </Routes>
  )
}

export default App