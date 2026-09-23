import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import UserRegister from '../pages/auth/UserRegister'
import ChooseRegister from '../pages/auth/ChooseRegister'
import UserLogin from '../pages/auth/UserLogin'
import FoodPartnerRegister from '../pages/auth/FoodPartnerRegister'
import FoodPartnerLogin from '../pages/auth/FoodPartnerLogin'
import Home from '../pages/general/Home'
import Saved from '../pages/general/Saved'
import BottomNav from '../components/BottomNav'
import TopNav from '../components/TopNav'
import CreateFood from '../pages/food-partner/CreateFood'
import Profile from '../pages/food-partner/Profile'
import TasteProfilePage from '../pages/general/TasteProfilePage'
import FoodMap from '../pages/general/FoodMap'
import DishDetail from '../pages/general/DishDetail'

// Layout with top + bottom nav
const AppLayout = ({ children }) => (
  <>
    <TopNav />
    {children}
    <BottomNav />
  </>
)

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Auth pages — no nav */}
        <Route path="/register"              element={<ChooseRegister />} />
        <Route path="/user/register"         element={<UserRegister />} />
        <Route path="/user/login"            element={<UserLogin />} />
        <Route path="/food-partner/register" element={<FoodPartnerRegister />} />
        <Route path="/food-partner/login"    element={<FoodPartnerLogin />} />

        {/* App pages — with nav */}
        <Route path="/"                  element={<AppLayout><Home /></AppLayout>} />
        <Route path="/map"                element={<AppLayout><FoodMap /></AppLayout>} />
        <Route path="/dish/:id"          element={<AppLayout><DishDetail /></AppLayout>} />
        <Route path="/saved"             element={<AppLayout><Saved /></AppLayout>} />
        <Route path="/taste-profile"     element={<AppLayout><TasteProfilePage /></AppLayout>} />
        <Route path="/create-food"       element={<AppLayout><CreateFood /></AppLayout>} />
        <Route path="/food-partner/:id"  element={<AppLayout><Profile /></AppLayout>} />
      </Routes>
    </Router>
  )
}

export default AppRoutes