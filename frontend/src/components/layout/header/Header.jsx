
import React from 'react'
import {useState, useEffect, useRef} from 'react'
import {NavLink} from 'react-router-dom'
import { FaBell, FaRightFromBracket} from "react-icons/fa6";

import Login from '../../auth/login/Login'
import Register from '../../auth/register/Register'

import Logo from '../../../assets/image/logo-1.png'
import Avatar from '../../../assets/image/avatar.png'
import './header.css'

function Header() {

  const [openUserDropdown, setOpenUserDropdown] = useState(false);
  const [openAuth, setOpenAuth] = useState(null);

  // Tham chiếu đến toàn bộ vùng avatar và dropdown
  const userInfoRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Nếu vị trí click nằm ngoài vùng user-info
      if (
        userInfoRef.current &&
        !userInfoRef.current.contains(event.target)
      ) {
        setOpenUserDropdown(false);
      }
    };

    // Lắng nghe sự kiện click trên toàn bộ tài liệu
    document.addEventListener("mousedown", handleClickOutside);

    // Gỡ sự kiện khi component bị hủy
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className='header'>
      
      <img src={Logo} alt="Logo" className="logo" />
      
      <div className="nav-links">
        <NavLink to="/" className="nav-item">Trang chủ</NavLink>
        <div className="explore-menu">
            <div className="explore-tittle nav-item">Khám phá</div>
            <div className="explore-dropdown">
                <div className="explore-dropdown-item">Khám phá 1</div>
                <div className="explore-dropdown-item">Khám phá 2</div>
                <div className="explore-dropdown-item">Khám phá 3</div>
                <div className="explore-dropdown-item">Khám phá 4</div>
                <div className="explore-dropdown-item">Khám phá 5</div>
                <div className="explore-dropdown-item">Khám phá 6</div>
            </div>
        </div>
        <NavLink className="nav-item">Đang khuyến mãi</NavLink>
        <NavLink className="nav-item">Yêu thích</NavLink>
      </div>

      <div className="header-right">
        <div className="nav-item">< FaBell className="bell-icon" /></div>
        {/* <div className="auth-btn">
          <button className="login-btn" onClick={() => setOpenAuth('login')}>Đăng nhập</button>
          <button className="signup-btn" onClick={() => setOpenAuth('register')}>Đăng ký</button>
        </div> */}
        <div className="user-info" ref={userInfoRef}>
          <img src={Avatar} alt="Avatar" className="avatar" onClick={() => setOpenUserDropdown(!openUserDropdown)} />
          {openUserDropdown && (
            <div className="user-dropdown">
              <div>
                <NavLink to="/" className="user-dropdown-item">Trang chủ</NavLink>
              </div>

              <div>
                <NavLink to="/quan-cua-toi" className="user-dropdown-item">Quán của tôi</NavLink>
              </div>

              <div>
                <NavLink to="/chi-nhanh-cua-toi" className="user-dropdown-item">Chi nhánh của tôi</NavLink>
              </div>

              <div>
                <NavLink to="/don-giao-hang" className="user-dropdown-item">Đơn giao hàng</NavLink>
              </div>

              <div>
                <NavLink to="/don-hang-cua-toi" className="user-dropdown-item">Đơn hàng của tôi</NavLink>
              </div>

              <div>
                <NavLink to="/dang-ky-ho-so-quan" className="user-dropdown-item">Đăng ký hồ sơ quán</NavLink>
              </div>

              <div>
                <NavLink to="/dang-ky-ho-so-giao-hang" className="user-dropdown-item">Đăng ký hồ sơ giao hàng</NavLink>
              </div>

              <div>
                <NavLink to="/quan-tri-he-thong" className="user-dropdown-item">Quản trị hệ thống</NavLink>
              </div>
              
              <hr className="user-dropdown-line" />
              <div className='logout-btn'><FaRightFromBracket className='logout-icon'/> Đăng xuất</div>
            </div>
          )}
        </div>
      </div>

      {openAuth === 'login' && (
        <Login
          onClose={() => setOpenAuth(null)}
          onSwitchToRegister={() =>
            setOpenAuth("register")
          }
        />
      )}

      {openAuth === 'register' && (
        <Register
          onClose={() => setOpenAuth(null)}
          onSwitchToLogin={() =>
            setOpenAuth("login")
          }
        />
      )}

    </header>
  )
}

export default Header