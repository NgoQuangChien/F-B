import { NavLink } from "react-router-dom";
import { Outlet } from "react-router-dom";

import "./manageLayout.css";

function ManageLayout() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const hasRole = (roleName) => {
    return user?.roles?.some((role) => role.roleName === roleName) ?? false;
  };

  return (
    <div className="manager-layout-container">
      <div className="manager-layout-navbar">
        {hasRole("owner") && (
          <NavLink to="/quan-cua-toi" className="manager-navbar-item">
            Quán của tôi
          </NavLink>
        )}

        {(hasRole("owner") || hasRole("manage"))&& (
          <NavLink to="thong-tin-quan" className="manager-navbar-item">
            Thông tin quán
          </NavLink>
        )}

        {(hasRole("owner") || hasRole("manage")) && (
          <NavLink to="quan-ly-thuc-don" className="manager-navbar-item">
            Quản lý thực đơn
          </NavLink>
        )}

        {(hasRole("owner") || hasRole("manage")) && (
          <NavLink to="quan-ly-dat-cho" className="manager-navbar-item">
            Quản lý đặt chỗ
          </NavLink>
        )}

        {(hasRole("owner") || hasRole("manage")) && (
          <NavLink to="quan-ly-don-hang" className="manager-navbar-item">
            Quản lý đơn hàng
          </NavLink>
        )}

        {hasRole("owner") && (
          <NavLink to="quan-ly-nhan-vien" className="manager-navbar-item">
            Quản lý nhân viên
          </NavLink>
        )}

        {(hasRole("owner") || hasRole("manage")) && (
          <NavLink to="danh-gia-va-phan-hoi" className="manager-navbar-item">
            Đánh giá và phản hồi
          </NavLink>
        )}

        {hasRole("admin") && (
          <NavLink to="" className="manager-navbar-item">
            Kiểm duyệt hồ sơ
          </NavLink>
        )}

      </div>

      <div className="manager-content">
        <Outlet />
      </div>
    </div>
  );
}

export default ManageLayout;
