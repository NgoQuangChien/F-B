
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBell, FaRightFromBracket } from "react-icons/fa6";
import { toast } from 'react-toastify';

import Login from '../../auth/login/Login';
import Register from '../../auth/register/Register';
import employeeApi from '../../../api/employeeApi';

import Logo from '../../../assets/image/logo-1.png';
import Avatar from '../../../assets/image/avatar.png';
import './header.css';

function Header() {
    const navigate = useNavigate();

    const [openUserDropdown, setOpenUserDropdown] = useState(false);
    const [openAuth, setOpenAuth] = useState(null);

    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || null;
        } catch (error) {
            return null;
        }
    });

    const userInfoRef = useRef(null);

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                userInfoRef.current &&
                !userInfoRef.current.contains(event.target)
            ) {
                setOpenUserDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Kiểm tra quyền
    const hasRole = (roleName) => {
        return user?.roles?.some(
            (role) => role.roleName === roleName
        ) ?? false;
    };

    // Xử lý khi click vào các liên kết
    const handleNavigate = () => {
        setOpenUserDropdown(false);
    };

    // Xử lý đăng xuất
    const handleLogout = () => {
        const isConfirmed = window.confirm(
            "Bạn có chắc chắn muốn đăng xuất không?"
        );

        if (!isConfirmed) return;

        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");

        setUser(null);
        setOpenUserDropdown(false);
        setOpenAuth(null);

        navigate("/", { replace: true });

        toast.success("Đăng xuất thành công!");
    };

    // Xử lý sau khi đăng nhập thành công
    const handleLoginSuccess = async (userData) => {
      if (!userData) {
          toast.error("Không nhận được thông tin tài khoản!");
          return;
      }

      let updatedUser = { ...userData };

      const isManager = userData.roles?.some(
          (role) => role.roleName === "manage"
      );

      if (isManager) {
          try {
              // Lấy thông tin quán được phân công
              const result = await employeeApi.getMyBusiness();

              console.log("Thông tin quán API trả về:", result.data);

              const businessId = result.data?.data?.businessId;

              if (!businessId) {
                  toast.error("Tài khoản chưa được phân công quán!");
                  return;
              }

              updatedUser.businessId = businessId;

          } catch (error) {
              console.error("Lỗi lấy thông tin quán:", error);

              toast.error(
                  error.response?.data?.message ||
                  "Không thể lấy thông tin quán!"
              );

              return;
          }
      }

      // Chỉ lưu sau khi đã lấy được businessId
      setUser(updatedUser);

      localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
      );

      setOpenAuth(null);
      setOpenUserDropdown(false);

      if (isManager) {
          navigate(`/thong-tin-quan/${updatedUser.businessId}`, {
              replace: true
          });
      }
  };

    return (
        <header className='header'>

            <img src={Logo} alt="Logo" className="logo" />

            <div className="nav-links">
                <NavLink
                    to="/"
                    className="nav-item"
                >
                    Trang chủ
                </NavLink>

                <div className="explore-menu">
                    <NavLink
                        to="/tim-kiem"
                        className="explore-tittle nav-item"
                    >
                        Khám phá
                    </NavLink>
                </div>

                <NavLink
                    to="/food&drink"
                    className="nav-item"
                >
                    Food & Drink
                </NavLink>

                <NavLink
                    to="/yeu-thich"
                    className="nav-item"
                >
                    Yêu thích
                </NavLink>
            </div>

            <div className="header-right">

                <div className="nav-item">
                    <FaBell className="bell-icon" />
                </div>

                {user ? (
                    <div className="user-info" ref={userInfoRef}>

                        <img
                            src={Avatar}
                            alt="Avatar"
                            className="avatar"
                            onClick={() =>
                                setOpenUserDropdown(!openUserDropdown)
                            }
                        />

                        {openUserDropdown && (
                            <div className="user-dropdown">

                                {!hasRole("manage") && (
                                  <div>
                                    <NavLink
                                        to="/"
                                        className="user-dropdown-item"
                                        onClick={handleNavigate}
                                    >
                                        Trang chủ
                                    </NavLink>
                                </div>
                                )}

                                {/* Chủ quán */}
                                {hasRole("owner") && (
                                    <div>
                                        <NavLink
                                            to="/quan-cua-toi"
                                            className="user-dropdown-item"
                                            onClick={handleNavigate}
                                        >
                                            Quán của tôi
                                        </NavLink>
                                    </div>
                                )}

                                {/* Nhân viên quản lý */}
                                {hasRole("manage") && user?.businessId && (
                                    <div>
                                        <NavLink
                                            to={`/thong-tin-quan/${user.businessId}`}
                                            className="user-dropdown-item"
                                            onClick={handleNavigate}
                                        >
                                            Thông tin quán
                                        </NavLink>
                                    </div>
                                )}

                                {/* Người giao hàng */}
                                {hasRole("shipper") && (
                                    <div>
                                        <NavLink
                                            to="/giao-hang"
                                            className="user-dropdown-item"
                                            onClick={handleNavigate}
                                        >
                                            Giao hàng
                                        </NavLink>
                                    </div>
                                )}

                                {/* Người dùng */}
                                {hasRole("user") && (
                                    <>
                                        <div>
                                            <NavLink
                                                to="/don-hang-cua-toi"
                                                className="user-dropdown-item"
                                                onClick={handleNavigate}
                                            >
                                                Đơn hàng của tôi
                                            </NavLink>
                                        </div>

                                        <div>
                                            <NavLink
                                                to="/dang-ky-ho-so-quan"
                                                className="user-dropdown-item"
                                                onClick={handleNavigate}
                                            >
                                                Đăng ký hồ sơ quán
                                            </NavLink>
                                        </div>
                                    </>
                                )}

                                {/* Đăng ký hồ sơ giao hàng */}
                                {!hasRole("owner") &&
                                 !hasRole("manage") &&
                                 !hasRole("admin") &&
                                 !hasRole("shipper") && (
                                    <div>
                                        <NavLink
                                            to="/dang-ky-ho-so-giao-hang"
                                            className="user-dropdown-item"
                                            onClick={handleNavigate}
                                        >
                                            Đăng ký hồ sơ giao hàng
                                        </NavLink>
                                    </div>
                                )}

                                {/* Quản trị viên */}
                                {hasRole("admin") && (
                                    <div>
                                        <NavLink
                                            to="/quan-tri-he-thong"
                                            className="user-dropdown-item"
                                            onClick={handleNavigate}
                                        >
                                            Quản trị hệ thống
                                        </NavLink>
                                    </div>
                                )}

                                <hr className="user-dropdown-line" />

                                <div
                                    className='logout-btn'
                                    onClick={handleLogout}
                                >
                                    <FaRightFromBracket className='logout-icon' />
                                    Đăng xuất
                                </div>

                            </div>
                        )}
                    </div>
                ) : (
                    <div className="auth-btn">
                        <button
                            className="login-btn"
                            onClick={() => setOpenAuth('login')}
                        >
                            Đăng nhập
                        </button>

                        <button
                            className="signup-btn"
                            onClick={() => setOpenAuth('register')}
                        >
                            Đăng ký
                        </button>
                    </div>
                )}
            </div>

            {/* Modal đăng nhập */}
            {openAuth === 'login' && (
                <Login
                    onClose={() => setOpenAuth(null)}
                    onSwitchToRegister={() => setOpenAuth("register")}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}

            {/* Modal đăng ký */}
            {openAuth === 'register' && (
                <Register
                    onClose={() => setOpenAuth(null)}
                    onSwitchToLogin={() => setOpenAuth("login")}
                />
            )}

        </header>
    );
}

export default Header;
