import './App.css';
import Navbar from './Components/Navbar/Navbar';
import Footer from "./Components/Footer/Footer";

import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Change these paths according to your actual folder structure
import Home from './Pages/Home';
import NewArrivals from './Pages/NewArrivals';
import AllProducts from './Pages/AllProducts';
import AboutUs from './Pages/AboutUs';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';
import Checkout from "./Pages/Checkout";
import OrderSuccess from "./Pages/OrderSuccess";
function App() {
  return (
    <BrowserRouter>
  <Navbar />

  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/home" element={<Home />} />
    <Route path="/newArrivals" element={<NewArrivals />} />
    <Route path="/allProducts" element={<AllProducts />} />
    <Route path="/aboutUs" element={<AboutUs />} />
    <Route path="/product" element={<Product />} />
    <Route path="/product/:productId" element={<Product />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/login" element={<LoginSignup />} />
    <Route path="/checkout" element={<Checkout />} />
<Route path="/order-success" element={<OrderSuccess />} />
  </Routes>
  <Footer />
</BrowserRouter>
  );
}

export default App;
