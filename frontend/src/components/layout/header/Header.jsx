
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
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

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

  const hasRole = (roleName) => {
    return user?.roles?.some(
      (role) => role.roleName === roleName
    ) ?? false;
  };

  
  const handleLogout = () => {
   
    const isConfirmed = window.confirm(
      "Bạn có chắc chắn muốn đăng xuất không?"
    );

    if (!isConfirmed) {
      return;
    }

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
   
    setUser(null);
    setOpenUserDropdown(false);
    setOpenAuth(null);

    toast.success("Đăng xuất thành công!");
  };

  return (
    <header className='header'>
      
      <img src={Logo} alt="Logo" className="logo" />
      
      <div className="nav-links">
        <NavLink to="/" className="nav-item">Trang chủ</NavLink>
        <div className="explore-menu">
            <NavLink to='tim-kiem' className="explore-tittle nav-item">Khám phá</NavLink>
        </div>
        <NavLink to='/food&drink' className="nav-item">Food & Drink</NavLink>
        <NavLink className="nav-item">Yêu thích</NavLink>
      </div>

      <div className="header-right">
        <div className="nav-item">< FaBell className="bell-icon" /></div>
        { user? (
          <div className="user-info" ref={userInfoRef}>
            <img src={Avatar} alt="Avatar" className="avatar" onClick={() => setOpenUserDropdown(!openUserDropdown)} />
            {openUserDropdown && (
              <div className="user-dropdown">
                <div>
                  <NavLink to="/" className="user-dropdown-item">Trang chủ</NavLink>
                </div>

                {hasRole("owner") && (
                  <div>
                    <NavLink to="/quan-cua-toi" className="user-dropdown-item">Quán của tôi</NavLink>
                  </div>
                )}


                {hasRole("shipper") && (
                  <div>
                    <NavLink to="/giao-hang" className="user-dropdown-item">Giao hàng</NavLink>
                  </div>
                )}

                {hasRole("user") && (
                  <div>
                    <NavLink to="/don-hang-cua-toi" className="user-dropdown-item">Đơn hàng của tôi</NavLink>
                  </div>
                )}

                {hasRole("user") && (
                  <div>
                    <NavLink to="/dang-ky-ho-so-quan" className="user-dropdown-item">Đăng ký hồ sơ quán</NavLink>
                  </div>
                )}

                {!hasRole("owner") && !hasRole("manager") && !hasRole("admin") &&(
                  <div>
                    <NavLink to="/dang-ky-ho-so-giao-hang" className="user-dropdown-item">Đăng ký hồ sơ giao hàng</NavLink>
                  </div>
                )}

                {hasRole("admin") && (
                  <div>
                    <NavLink to="/quan-tri-he-thong" className="user-dropdown-item">Quản trị hệ thống</NavLink>
                  </div>
                )}

                <hr className="user-dropdown-line" />
                <div className='logout-btn' onClick={handleLogout}><FaRightFromBracket className='logout-icon'/> Đăng xuất</div>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-btn">
            <button className="login-btn" onClick={() => setOpenAuth('login')}>Đăng nhập</button>
            <button className="signup-btn" onClick={() => setOpenAuth('register')}>Đăng ký</button>
          </div>
        )}   
      </div>

      {openAuth === 'login' && (
        <Login
          onClose={() => setOpenAuth(null)}
          onSwitchToRegister={() =>
            setOpenAuth("register")
          }

          onLoginSuccess={(userData) => {
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            setOpenAuth(null);
        }}
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