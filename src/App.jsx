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
import Admin from "./Pages/Admin";
import AdminLogin from "./Pages/Admin/AdminLogin";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AdminModule from "./Pages/Admin/AdminModule";
import AdminProducts from "./Pages/Admin/AdminProducts";
import AdminOrders from "./Pages/Admin/AdminOrders";
import AdminInventory from "./Pages/Admin/AdminInventory";
import AdminCustomers from "./Pages/Admin/AdminCustomers";
import AdminCategories from "./Pages/Admin/AdminCategories";
import MyAccount from "./Pages/Account/MyAccount";
import MyProfile from "./Pages/Account/MyProfile";
import MyOrders from "./Pages/Account/MyOrders";
import SavedAddresses from "./Pages/Account/SavedAddresses";

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
    <Route path="/admin" element={<Admin />} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/admin/:module" element={<AdminModule />} />
    <Route path="/admin/products" element={<AdminProducts />} />
    <Route path="/admin/orders" element={<AdminOrders />} />
    <Route path="/admin/inventory" element={<AdminInventory />} />
    <Route path="/admin/customers" element={<AdminCustomers />} />
    <Route path="/admin/categories" element={<AdminCategories />} />
    <Route path="/my-account" element={<MyAccount />} />
    <Route path="/my-profile" element={<MyProfile />} />
    <Route path="/my-orders" element={<MyOrders />} />
    <Route path="/saved-addresses" element={<SavedAddresses />}/>
  </Routes>
  <Footer />
</BrowserRouter>
  );
}

export default App;
