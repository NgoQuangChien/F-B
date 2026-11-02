
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";

import businessApi from "../../../api/businessApi";
import "./myBusinesses.css";

function MyBusinesses() {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Lấy danh sách quán của tài khoản đang đăng nhập
    const fetchMyBusinesses = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem("user"));
            const result = await businessApi.getBusinessByUserId(user.userId);
            console.log("Dữ liệu API trả về:", result.data);

            setBusinesses(result.data.data || []);

        } catch (error) {
            console.error("Lỗi lấy danh sách quán:", error);

            toast.error(
                error.response?.data?.message ||
                "Không thể tải danh sách quán!"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyBusinesses();
    }, []);

    // Hiển thị trạng thái hồ sơ
    const getStatus = (status) => {
        switch (status) {
            case "approved":
                return "Đã duyệt";
            case "pending":
                return "Chờ duyệt";
            case "rejected":
                return "Từ chối";
            default:
                return "Chưa xác định";
        }
    };

    return (
        <div className="mybus-container">
            <div className="mybus-header">
                <h2 className="mybus-title">Quán của tôi</h2>

                <NavLink
                    to="/dang-ky-ho-so-quan"
                    className="mybus-btn-add"
                >
                    <FaPlus /> Đăng ký quán mới
                </NavLink>
            </div>

            <div className="mybus-content">
                <div className="mybus-table-wrapper">
                    <table className="mybus-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Tên quán</th>
                                <th>Loại hình</th>
                                <th>Chi nhánh</th>
                                <th>Đánh giá</th>
                                <th>Trạng thái hồ sơ</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : businesses.length > 0 ? (
                                businesses.map((business, index) => (
                                    <tr key={business.businessId}>
                                        <td>{index + 1}</td>

                                        <td>
                                            {business.businessName}
                                        </td>

                                        <td>
                                            {business.businessType || "Chưa cập nhật"}
                                        </td>

                                        <td>
                                            {business.branchCount ?? 0}
                                        </td>

                                        <td>
                                            {business.averageRating
                                                ? `${business.averageRating} ★`
                                                : "Chưa có đánh giá"}
                                        </td>

                                        <td>
                                            {getStatus(business.status)}
                                        </td>

                                        <td>
                                            <NavLink
                                                to={`/thong-tin-quan/${business.businessId}`}
                                            >
                                                Xem chi tiết
                                            </NavLink>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7">
                                        Bạn chưa đăng ký quán nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default MyBusinesses;
