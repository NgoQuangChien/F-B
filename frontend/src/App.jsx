
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'


import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

import AppRouter from './router/Router'
import './App.css'

function App() {

  return (
      <Router>
        <AppRouter/>
        <ToastContainer
          position='top-right'
          autoClose={3000}
        />
      </Router>
  )
}

export default App
