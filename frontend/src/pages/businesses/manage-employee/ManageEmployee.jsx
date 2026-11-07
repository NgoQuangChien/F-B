
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";

import {
    FaPlus,
    FaSearch,
    FaEye,
    FaTimes,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaCalendarAlt,
    FaIdBadge,
    FaUserSlash,
    FaUserCheck
} from "react-icons/fa";

import employeeApi from "../../../api/employeeApi";
import "./manageEmployee.css";

function ManageEmployee() {
    const { id } = useParams();
    const businessId = id ? Number(id) : null;

    const [employees, setEmployees] = useState([]);

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    // ID nhân viên đang được cập nhật trạng thái
    const [updatingEmployeeId, setUpdatingEmployeeId] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: ""
    });

    // =====================================
    // LẤY DANH SÁCH NHÂN VIÊN
    // =====================================

    const fetchEmployees = useCallback(async () => {
        if (!businessId) {
            setEmployees([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const res = await employeeApi.getEmployees(businessId);

            setEmployees(res.data.data || []);

        } catch (error) {
            console.error("Lỗi lấy danh sách nhân viên:", error);

            alert(
                error.response?.data?.message ||
                "Không thể tải danh sách nhân viên!"
            );
        } finally {
            setLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // =====================================
    // TÌM KIẾM NHÂN VIÊN
    // =====================================

    const filteredEmployees = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return employees.filter((employee) => {
            return (
                employee.fullName?.toLowerCase().includes(keyword) ||
                employee.email?.toLowerCase().includes(keyword) ||
                employee.phone?.includes(keyword)
            );
        });
    }, [employees, searchTerm]);

    // =====================================
    // THAY ĐỔI DỮ LIỆU FORM
    // =====================================

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // =====================================
    // ĐÓNG MODAL TẠO NHÂN VIÊN
    // =====================================

    const closeModal = () => {
        if (creating) return;

        setShowModal(false);

        setFormData({
            fullName: "",
            email: "",
            phone: "",
            password: ""
        });
    };

    // =====================================
    // TẠO TÀI KHOẢN NHÂN VIÊN
    // =====================================

    const handleCreateEmployee = async (event) => {
        event.preventDefault();

        if (!businessId) {
            alert("Không xác định được quán!");
            return;
        }

        try {
            setCreating(true);

            const data = {
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                password: formData.password,
                phone: formData.phone.trim()
            };

            const res = await employeeApi.createEmployee(
                businessId,
                data
            );

            alert(
                res.data.message ||
                "Tạo tài khoản nhân viên thành công!"
            );

            setShowModal(false);

            setFormData({
                fullName: "",
                email: "",
                phone: "",
                password: ""
            });

            await fetchEmployees();

        } catch (error) {
            console.error("Lỗi tạo nhân viên:", error);

            alert(
                error.response?.data?.message ||
                "Không thể tạo tài khoản nhân viên!"
            );
        } finally {
            setCreating(false);
        }
    };

    // =====================================
    // XEM CHI TIẾT NHÂN VIÊN
    // =====================================

    const handleViewDetail = async (employeeId) => {
        try {
            setDetailLoading(true);
            setSelectedEmployee(null);
            setShowDetailModal(true);

            const res = await employeeApi.getEmployeeDetail(
                businessId,
                employeeId
            );

            setSelectedEmployee(res.data.data);

        } catch (error) {
            console.error("Lỗi lấy chi tiết nhân viên:", error);

            alert(
                error.response?.data?.message ||
                "Không thể lấy thông tin nhân viên!"
            );

            setShowDetailModal(false);

        } finally {
            setDetailLoading(false);
        }
    };

    // =====================================
    // CHO NGHỈ VIỆC / KÍCH HOẠT NHÂN VIÊN
    // =====================================

    const handleChangeStatus = async (employee) => {
        if (!businessId) {
            alert("Không xác định được quán!");
            return;
        }

        const isActive = employee.status === "active";

        const newStatus = isActive ? "inactive" : "active";

        const confirmMessage = isActive
            ? `Bạn có chắc chắn muốn cho nhân viên "${employee.fullName}" nghỉ việc không? Tài khoản của nhân viên sẽ bị vô hiệu hóa.`
            : `Bạn có muốn kích hoạt lại tài khoản của nhân viên "${employee.fullName}" không?`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setUpdatingEmployeeId(employee.employeeId);

            const res = await employeeApi.updateEmployeeStatus(
                businessId,
                employee.employeeId,
                newStatus
            );

            alert(
                res.data.message ||
                "Cập nhật trạng thái nhân viên thành công!"
            );

            // Tải lại danh sách sau khi cập nhật
            await fetchEmployees();

            // Nếu đang mở chi tiết nhân viên này thì cập nhật luôn
            if (
                selectedEmployee?.employeeId === employee.employeeId
            ) {
                setSelectedEmployee((previous) => ({
                    ...previous,
                    status: newStatus
                }));
            }

        } catch (error) {
            console.error("Lỗi cập nhật trạng thái nhân viên:", error);

            alert(
                error.response?.data?.message ||
                "Không thể cập nhật trạng thái nhân viên!"
            );

        } finally {
            setUpdatingEmployeeId(null);
        }
    };

    // =====================================
    // ĐỊNH DẠNG NGÀY THÁNG
    // =====================================

    const formatDate = (date) => {
        if (!date) return "Chưa có thông tin";

        return new Date(date).toLocaleDateString("vi-VN");
    };

    // =====================================
    // ĐÓNG MODAL CHI TIẾT
    // =====================================

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedEmployee(null);
    };

    // =====================================
    // GIAO DIỆN
    // =====================================

    return (
        <div className="employees-page">

            {/* Tiêu đề */}
            <div className="employees-header">
                <div>
                    <h1>Quản lý nhân viên</h1>
                    <p>
                        Quản lý tài khoản và thông tin nhân viên của quán.
                    </p>
                </div>

                <button
                    type="button"
                    className="employees-add-btn"
                    onClick={() => setShowModal(true)}
                    disabled={!businessId}
                >
                    <FaPlus />
                    <span>Thêm nhân viên</span>
                </button>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="employees-toolbar">
                <div className="employees-search">
                    <FaSearch />

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                        placeholder="Tìm tên, email, số điện thoại..."
                    />
                </div>
            </div>

            {/* Bảng danh sách nhân viên */}
            <div className="employees-table-card">

                <div className="employees-table-heading">
                    <h2>Danh sách nhân viên</h2>

                    <span>
                        {filteredEmployees.length} nhân viên
                    </span>
                </div>

                <div className="employees-table-wrapper">
                    <table className="employees-table">

                        <thead>
                            <tr>
                                <th>Nhân viên</th>
                                <th>Liên hệ</th>
                                <th>Ngày tạo tài khoản</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="employees-empty">
                                        Đang tải danh sách nhân viên...
                                    </td>
                                </tr>

                            ) : filteredEmployees.length > 0 ? (

                                filteredEmployees.map((employee) => (
                                    <tr key={employee.employeeId}>

                                        {/* Thông tin nhân viên */}
                                        <td>
                                            <div className="employees-person">

                                                <div className="employees-avatar">
                                                    {employee.fullName
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="employees-person-info">
                                                    <strong>
                                                        {employee.fullName}
                                                    </strong>

                                                    <span>
                                                        Mã NV: {employee.employeeId}
                                                    </span>
                                                </div>

                                            </div>
                                        </td>

                                        {/* Liên hệ */}
                                        <td>
                                            <div className="employees-contact">
                                                <span>
                                                    {employee.email}
                                                </span>

                                                <span>
                                                    {employee.phone || "Chưa cập nhật"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Ngày tạo */}
                                        <td>
                                            {formatDate(employee.createdAt)}
                                        </td>

                                        {/* Trạng thái */}
                                        <td>
                                            <span
                                                className={`employees-status ${
                                                    employee.status === "active"
                                                        ? "status-working"
                                                        : "status-resigned"
                                                }`}
                                            >
                                                <span className="employees-status-dot" />

                                                {employee.status === "active"
                                                    ? "Đang hoạt động"
                                                    : "Đã nghỉ việc"}
                                            </span>
                                        </td>

                                        {/* Thao tác */}
                                        <td>
                                            <div className="employees-row-actions">

                                                {/* Xem chi tiết */}
                                                <button
                                                    type="button"
                                                    className="employees-action-btn view"
                                                    title="Xem chi tiết"
                                                    onClick={() =>
                                                        handleViewDetail(
                                                            employee.employeeId
                                                        )
                                                    }
                                                >
                                                    <FaEye />
                                                    <span>Chi tiết</span>
                                                </button>

                                                {/* Cho nghỉ việc */}
                                                {employee.status === "active" ? (
                                                    <button
                                                        type="button"
                                                        className="employees-action-btn resign"
                                                        title="Cho nghỉ việc"
                                                        disabled={
                                                            updatingEmployeeId === employee.employeeId
                                                        }
                                                        onClick={() =>
                                                            handleChangeStatus(employee)
                                                        }
                                                    >
                                                        <FaUserSlash />

                                                        <span>
                                                            {updatingEmployeeId === employee.employeeId
                                                                ? "Đang xử lý..."
                                                                : "Cho nghỉ việc"}
                                                        </span>
                                                    </button>

                                                ) : (

                                                    /* Kích hoạt lại */
                                                    <button
                                                        type="button"
                                                        className="employees-action-btn activate"
                                                        title="Kích hoạt lại"
                                                        disabled={
                                                            updatingEmployeeId === employee.employeeId
                                                        }
                                                        onClick={() =>
                                                            handleChangeStatus(employee)
                                                        }
                                                    >
                                                        <FaUserCheck />

                                                        <span>
                                                            {updatingEmployeeId === employee.employeeId
                                                                ? "Đang xử lý..."
                                                                : "Kích hoạt"}
                                                        </span>
                                                    </button>

                                                )}

                                            </div>
                                        </td>

                                    </tr>
                                ))

                            ) : (

                                <tr>
                                    <td
                                        colSpan="5"
                                        className="employees-empty"
                                    >
                                        {searchTerm
                                            ? "Không tìm thấy nhân viên phù hợp."
                                            : "Quán chưa có nhân viên nào."}
                                    </td>
                                </tr>

                            )}

                        </tbody>
                    </table>
                </div>
            </div>

            {/* =====================================
                MODAL TẠO TÀI KHOẢN NHÂN VIÊN
            ===================================== */}

            {showModal && (
                <div
                    className="employees-modal-backdrop"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !creating
                        ) {
                            closeModal();
                        }
                    }}
                >
                    <div className="employees-modal">

                        <div className="employees-modal-header">
                            <div>
                                <h2>Thêm nhân viên</h2>

                                <p>
                                    Tạo tài khoản đăng nhập cho nhân viên quản lý quán.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={creating}
                                aria-label="Đóng"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleCreateEmployee}>

                            <div className="employees-form-group">
                                <label htmlFor="fullName">
                                    Họ và tên
                                </label>

                                <input
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleFormChange}
                                    placeholder="Nhập họ và tên"
                                    required
                                />
                            </div>

                            <div className="employees-form-group">
                                <label htmlFor="email">
                                    Email đăng nhập
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    placeholder="example@email.com"
                                    required
                                />
                            </div>

                            <div className="employees-form-group">
                                <label htmlFor="phone">
                                    Số điện thoại
                                </label>

                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleFormChange}
                                    placeholder="Nhập số điện thoại"
                                    pattern="0[0-9]{9}"
                                    title="Số điện thoại gồm 10 chữ số và bắt đầu bằng 0"
                                    required
                                />
                            </div>

                            <div className="employees-form-group">
                                <label htmlFor="password">
                                    Mật khẩu ban đầu
                                </label>

                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleFormChange}
                                    placeholder="Nhập mật khẩu ban đầu"
                                    minLength={8}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="employees-form-note">
                                Tài khoản được tạo sẽ có quyền quản lý quán
                                hiện tại. Nhân viên có thể sử dụng email và
                                mật khẩu này để đăng nhập.
                            </div>

                            <div className="employees-modal-actions">

                                <button
                                    type="button"
                                    className="employees-cancel-btn"
                                    onClick={closeModal}
                                    disabled={creating}
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="employees-submit-btn"
                                    disabled={creating}
                                >
                                    {creating
                                        ? "Đang tạo..."
                                        : "Tạo tài khoản"}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =====================================
                MODAL XEM CHI TIẾT NHÂN VIÊN
            ===================================== */}

            {showDetailModal && (
                <div
                    className="employees-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeDetailModal();
                        }
                    }}
                >
                    <div className="employees-detail-modal">

                        <div className="employees-modal-header">
                            <div>
                                <h2>Thông tin nhân viên</h2>

                                <p>
                                    Chi tiết tài khoản nhân viên quản lý.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeDetailModal}
                                aria-label="Đóng"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {detailLoading ? (

                            <div className="employees-detail-loading">
                                Đang tải thông tin nhân viên...
                            </div>

                        ) : selectedEmployee ? (

                            <>
                                <div className="employees-detail-profile">

                                    <div className="employees-detail-avatar">
                                        {selectedEmployee.fullName
                                            ?.charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <h3>
                                        {selectedEmployee.fullName}
                                    </h3>

                                    <span className="employees-position manager-position">
                                        Nhân viên quản lý
                                    </span>

                                    <span
                                        className={`employees-status ${
                                            selectedEmployee.status === "active"
                                                ? "status-working"
                                                : "status-resigned"
                                        }`}
                                    >
                                        <span className="employees-status-dot" />

                                        {selectedEmployee.status === "active"
                                            ? "Đang hoạt động"
                                            : "Đã nghỉ việc"}
                                    </span>
                                </div>

                                <div className="employees-detail-information">

                                    <div className="employees-detail-item">
                                        <div className="employees-detail-icon">
                                            <FaIdBadge />
                                        </div>

                                        <div>
                                            <span>Mã nhân viên</span>
                                            <strong>
                                                NV{selectedEmployee.employeeId}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="employees-detail-item">
                                        <div className="employees-detail-icon">
                                            <FaUser />
                                        </div>

                                        <div>
                                            <span>Họ và tên</span>
                                            <strong>
                                                {selectedEmployee.fullName}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="employees-detail-item">
                                        <div className="employees-detail-icon">
                                            <FaEnvelope />
                                        </div>

                                        <div>
                                            <span>Email đăng nhập</span>
                                            <strong>
                                                {selectedEmployee.email}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="employees-detail-item">
                                        <div className="employees-detail-icon">
                                            <FaPhone />
                                        </div>

                                        <div>
                                            <span>Số điện thoại</span>
                                            <strong>
                                                {selectedEmployee.phone || "Chưa cập nhật"}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="employees-detail-item">
                                        <div className="employees-detail-icon">
                                            <FaCalendarAlt />
                                        </div>

                                        <div>
                                            <span>Ngày tạo tài khoản</span>
                                            <strong>
                                                {formatDate(selectedEmployee.createdAt)}
                                            </strong>
                                        </div>
                                    </div>

                                </div>

                                <div className="employees-modal-actions">

                                    {/* Thay đổi trạng thái ngay trong modal */}
                                    <button
                                        type="button"
                                        className={
                                            selectedEmployee.status === "active"
                                                ? "employees-cancel-btn"
                                                : "employees-submit-btn"
                                        }
                                        disabled={
                                            updatingEmployeeId === selectedEmployee.employeeId
                                        }
                                        onClick={() =>
                                            handleChangeStatus(selectedEmployee)
                                        }
                                    >
                                        {selectedEmployee.status === "active" ? (
                                            <>
                                                <FaUserSlash />
                                                Cho nghỉ việc
                                            </>
                                        ) : (
                                            <>
                                                <FaUserCheck />
                                                Kích hoạt lại
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        className="employees-submit-btn"
                                        onClick={closeDetailModal}
                                    >
                                        Đóng
                                    </button>

                                </div>
                            </>

                        ) : null}

                    </div>
                </div>
            )}

        </div>
    );
}

export default ManageEmployee;
