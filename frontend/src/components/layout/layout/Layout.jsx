
import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../header/Header'
import Footer from '../footer/Footer'

import './layout.css'
function Layout() {
  return (
    <div className='layout-container'>   
        <Header />
        <main className='main-content'>
            <div>
              <Outlet/> 
            </div>      
        </main>
        <Footer />
    </div>
  )
}

export default Layout