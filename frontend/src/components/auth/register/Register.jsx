import React from 'react'
import {useState} from 'react'
import {FaRegEyeSlash, FaRegEye} from "react-icons/fa6";
import { toast } from "react-toastify";

import '../../auth/auth.css'
import authApi from '../../../api/authApi';

function Register({ onClose, onSwitchToLogin }) {
    const [fullname, setFullname] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email.trim() || !password.trim() || !fullname) {
            toast.warning("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if(fullname.length < 6) {
            toast.warning("Tên người dùng phải có ít nhất 6 ký tự!")
            return;
        }

        if(fullname.length > 100) {
            toast.warning("Tên người dùng không được vượt quá 100 ký tự!")
            return;
        }

        if(password.length < 8) {
            toast.warning("Mật khẩu phải có nhiều hơn 8 ký tự!")
            return;
        }

        // Kiểm tra định dạng email cơ bản
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.warning("Định dạng email không hợp lệ!");
            return;
        }
        
        try {
            const authData = {
                fullname: fullname,
                email: email,
                password: password
            };

            const resultRegister = await authApi.register(authData);

            toast.success(
                resultRegister.data.message || "Đăng ký thành công"
            )
            
            setTimeout( ()=> {
                onSwitchToLogin();
            }, (1000));


        } catch (error) {
            const message = error.response?.data?.message || "Đăng ký không thất bại. Vui lòng thử lại!";

            toast.error(message);
            console.error("Lỗi đăng ký: ", error);
        }
    }

    return (
        <div className="register auth-overlay" onClick={onClose}>
            <div className="form-container" onClick={(e) => e.stopPropagation()}>
                <h1 className="form-title">Đăng nhập</h1>
                <form onSubmit={handleSubmit} className="form-auth">

                    <div className="form-group">
                        <label className="form-label" htmlFor="fullname">Họ và tên</label>
                        <input
                            className="form-input"
                            type="text" 
                            id="fullname" 
                            name="fullname" 
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            className="form-input"
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Mật khẩu</label>
                        <div className="pw-container">
                            <input
                                className="form-input"
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="tongle-pw"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                <FaRegEyeSlash className="icon-eye" />
                                ) : (
                                <FaRegEye className="icon-eye" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <button className="form-btn" type="submit">Đăng ký</button>
                    </div>
                    <div className="form-text">
                        Bạn đã có tài khoản?{" "}
                        <span className="change-form" onClick={onSwitchToLogin}>
                        Đăng nhập ngay
                        </span>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Register;
