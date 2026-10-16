import React from 'react'
import {useState} from 'react'
import {FaRegEyeSlash, FaRegEye} from "react-icons/fa6";

import './login.css'
import '../../auth/auth.css'

function Login ({ onClose, onSwitchToRegister }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        // Handle login logic here
    }

    return (
        <div className="login auth-overlay" onClick={onClose}>
            <div className='form-container' onClick={(e) => e.stopPropagation()}>
                <h1 className='form-title'>Đăng nhập</h1>
                <form onSubmit={handleSubmit} className='form-auth'>
                    <div className = 'form-group'>
                        <label className = 'form-label' htmlFor="email">Email</label>
                        <input 
                            className = 'form-input'
                            type="email" 
                            id="email" 
                            name="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className = 'form-group'>
                        <label className = 'form-label' htmlFor="password">Mật khẩu</label>
                        <div className='pw-container'>
                            <input 
                            className = 'form-input'
                            type={showPassword ? "text" : "password"} 
                            id="password" 
                            name="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            />
                            <button type='button' className='tongle-pw' onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ?   <FaRegEyeSlash className='icon-eye'/> : <FaRegEye className='icon-eye'/> }
                            </button>
                        </div>
                    </div>
                    <div className = 'form-group'>
                        <button className = 'form-btn'  type="submit">Đăng nhập</button>
                    </div>
                    <div className='form-text'>Bạn chưa có tài khoản? <span className='change-form' onClick={onSwitchToRegister}>Đăng ký ngay</span></div>
                </form>
            </div>
        </div>
    )
}

export default Login