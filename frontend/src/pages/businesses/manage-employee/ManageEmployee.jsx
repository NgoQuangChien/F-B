
import { useMemo, useState } from "react";
import {
    FaPlus,
    FaSearch,
    FaUserCheck,
    FaUserMinus,
    FaTimes
} from "react-icons/fa";
import "./manageEmployee.css";

const initialBranches = [
    { id: "all", name: "Tất cả chi nhánh" },
    { id: "CN01", name: "Chi nhánh Quận 1" },
    { id: "CN02", name: "Chi nhánh Quận 3" },
    { id: "CN03", name: "Chi nhánh Bình Thạnh" }
];

const initialEmployees = [
    {
        id: 1,
        fullname: "Nguyễn Văn An",
        email: "an@example.com",
        phone: "0901234567",
        branchId: "CN01",
        position: "Quản lý chi nhánh",
        status: "working",
        startDate: "10/05/2026"
    },
    {
        id: 2,
        fullname: "Trần Thị Bình",
        email: "binh@example.com",
        phone: "0912345678",
        branchId: "CN01",
        position: "Nhân viên",
        status: "working",
        startDate: "15/05/2026"
    },
    {
        id: 3,
        fullname: "Lê Minh Cường",
        email: "cuong@example.com",
        phone: "0923456789",
        branchId: "CN02",
        position: "Quản lý chi nhánh",
        status: "working",
        startDate: "01/06/2026"
    },
    {
        id: 4,
        fullname: "Phạm Thu Hà",
        email: "ha@example.com",
        phone: "0934567890",
        branchId: "CN02",
        position: "Nhân viên",
        status: "resigned",
        startDate: "20/04/2026"
    },
    {
        id: 5,
        fullname: "Hoàng Minh Đức",
        email: "duc@example.com",
        phone: "0945678901",
        branchId: "CN03",
        position: "Nhân viên",
        status: "working",
        startDate: "10/07/2026"
    }
];

function ManageEmployee() {
    const [employees, setEmployees] = useState(initialEmployees);
    const [branches] = useState(initialBranches);

    const [searchTerm, setSearchTerm] = useState("");
    const [branchFilter, setBranchFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [showModal, setShowModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const [statusAction, setStatusAction] = useState("resigned");

    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        phone: "",
        branchId: "",
        password: ""
    });

    const filteredEmployees = useMemo(() => {
        return employees.filter((employee) => {
            const keyword = searchTerm.trim().toLowerCase();

            const matchesSearch =
                employee.fullname.toLowerCase().includes(keyword) ||
                employee.email.toLowerCase().includes(keyword) ||
                employee.phone.includes(keyword);

            const matchesBranch =
                branchFilter === "all" ||
                employee.branchId === branchFilter;

            const matchesStatus =
                statusFilter === "all" ||
                employee.status === statusFilter;

            return matchesSearch && matchesBranch && matchesStatus;
        });
    }, [employees, searchTerm, branchFilter, statusFilter]);


    const getBranchName = (branchId) => {
        return branches.find((branch) => branch.id === branchId)?.name
            || "Chưa phân chi nhánh";
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Tạo tài khoản quản lý chi nhánh mẫu
    const handleCreateManager = (event) => {
        event.preventDefault();

        const emailExists = employees.some(
            (employee) =>
                employee.email.toLowerCase() ===
                formData.email.trim().toLowerCase()
        );

        if (emailExists) {
            alert("Email này đã tồn tại trong danh sách nhân viên.");
            return;
        }

        const newEmployee = {
            id: Date.now(),
            fullname: formData.fullname.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            branchId: formData.branchId,
            position: "Quản lý chi nhánh",
            status: "working",
            startDate: new Date().toLocaleDateString("vi-VN")
        };

        setEmployees((previous) => [
            newEmployee,
            ...previous
        ]);

        setShowModal(false);

        setFormData({
            fullname: "",
            email: "",
            phone: "",
            branchId: "",
            password: ""
        });
    };

    const openStatusModal = (employee, action) => {
        setSelectedEmployee(employee);
        setStatusAction(action);
        setShowStatusModal(true);
    };

    const confirmStatusChange = () => {
        if (!selectedEmployee) return;

        setEmployees((previous) =>
            previous.map((employee) => {
                if (employee.id !== selectedEmployee.id) {
                    return employee;
                }

                return {
                    ...employee,
                    status: statusAction
                };
            })
        );

        setShowStatusModal(false);
        setSelectedEmployee(null);
    };

    const closeModal = () => {
        setShowModal(false);
        setShowStatusModal(false);
        setSelectedEmployee(null);
    };

    return (
        <div className="employees-page">
            {/* Tiêu đề */}
            <div className="employees-header">
                <div>
                    <h1>Quản lý nhân viên</h1>
                </div>

                <button
                    type="button"
                    className="employees-add-btn"
                    onClick={() => setShowModal(true)}
                >
                    <FaPlus />
                    <span>Thêm quản lý chi nhánh</span>
                </button>
            </div>


            {/* Bộ lọc */}
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

                <select
                    value={branchFilter}
                    onChange={(event) =>
                        setBranchFilter(event.target.value)
                    }
                    aria-label="Lọc theo chi nhánh"
                >
                    {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                            {branch.name}
                        </option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(event.target.value)
                    }
                    aria-label="Lọc theo trạng thái"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="working">Đang làm việc</option>
                    <option value="resigned">Đã nghỉ việc</option>
                </select>
            </div>

            {/* Bảng nhân viên */}
            <div className="employees-table-card">
                <div className="employees-table-heading">
                    <h2>Danh sách nhân viên</h2>
                    <span>{filteredEmployees.length} nhân viên</span>
                </div>

                <div className="employees-table-wrapper">
                    <table className="employees-table">
                        <thead>
                            <tr>
                                <th>Nhân viên</th>
                                <th>Liên hệ</th>
                                <th>Chi nhánh</th>
                                <th>Chức vụ</th>
                                <th>Ngày bắt đầu</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredEmployees.map((employee) => (
                                <tr key={employee.id}>
                                    <td>
                                        <div className="employees-person">
                                            
                                            <div className="employees-person-info">
                                                <strong>
                                                    {employee.fullname}
                                                </strong>
                                                <span>
                                                    Mã NV: {employee.id}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="employees-contact">
                                            <span>{employee.email}</span>
                                            <span>{employee.phone}</span>
                                        </div>
                                    </td>

                                    <td>
                                        {getBranchName(employee.branchId)}
                                    </td>

                                    <td>
                                        <span
                                            className={`employees-position ${
                                                employee.position ===
                                                "Quản lý chi nhánh"
                                                    ? "manager-position"
                                                    : ""
                                            }`}
                                        >
                                            {employee.position}
                                        </span>
                                    </td>

                                    <td>{employee.startDate}</td>

                                    <td>
                                        <span
                                            className={`employees-status ${
                                                employee.status === "working"
                                                    ? "status-working"
                                                    : "status-resigned"
                                            }`}
                                        >
                                            <span className="employees-status-dot" />
                                            {employee.status === "working"
                                                ? "Đang làm việc"
                                                : "Đã nghỉ việc"}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="employees-row-actions">
                                            {employee.status === "working" ? (
                                                <button
                                                    type="button"
                                                    className="employees-action-btn dismiss"
                                                    title="Cho nghỉ việc"
                                                    onClick={() =>
                                                        openStatusModal(
                                                            employee,
                                                            "resigned"
                                                        )
                                                    }
                                                >
                                                    <FaUserMinus />
                                                    <span>Cho nghỉ việc</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="employees-action-btn restore"
                                                    title="Khôi phục làm việc"
                                                    onClick={() =>
                                                        openStatusModal(
                                                            employee,
                                                            "working"
                                                        )
                                                    }
                                                >
                                                    <FaUserCheck />
                                                    <span>Khôi phục</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredEmployees.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="employees-empty"
                                    >
                                        Không tìm thấy nhân viên phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal tạo quản lý */}
            {showModal && (
                <div
                    className="employees-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div className="employees-modal">
                        <div className="employees-modal-header">
                            <div>
                                <h2>Thêm quản lý chi nhánh</h2>
                                <p>
                                    Tạo thông tin và tài khoản cho quản lý mới.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                aria-label="Đóng"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleCreateManager}>
                            <div className="employees-form-group">
                                <label htmlFor="fullname">
                                    Họ và tên
                                </label>
                                <input
                                    id="fullname"
                                    name="fullname"
                                    value={formData.fullname}
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
                                <label htmlFor="branchId">
                                    Chi nhánh phụ trách
                                </label>
                                <select
                                    id="branchId"
                                    name="branchId"
                                    value={formData.branchId}
                                    onChange={handleFormChange}
                                    required
                                >
                                    <option value="">
                                        -- Chọn chi nhánh --
                                    </option>

                                    {branches
                                        .filter(
                                            (branch) => branch.id !== "all"
                                        )
                                        .map((branch) => (
                                            <option
                                                key={branch.id}
                                                value={branch.id}
                                            >
                                                {branch.name}
                                            </option>
                                        ))}
                                </select>
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
                                Quản lý được tạo sẽ có quyền quản lý
                                chi nhánh đã chọn.
                            </div>

                            <div className="employees-modal-actions">
                                <button
                                    type="button"
                                    className="employees-cancel-btn"
                                    onClick={closeModal}
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="employees-submit-btn"
                                >
                                    Tạo tài khoản
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal xác nhận nghỉ việc / khôi phục */}
            {showStatusModal && selectedEmployee && (
                <div
                    className="employees-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div className="employees-confirm-modal">
                        <div className="employees-confirm-icon">
                            {statusAction === "resigned" ? (
                                <FaUserMinus />
                            ) : (
                                <FaUserCheck />
                            )}
                        </div>

                        <h2>
                            {statusAction === "resigned"
                                ? "Xác nhận cho nghỉ việc?"
                                : "Khôi phục làm việc?"}
                        </h2>

                        <p>
                            {statusAction === "resigned"
                                ? `Bạn có chắc muốn chuyển ${selectedEmployee.fullname} sang trạng thái đã nghỉ việc?`
                                : `Bạn có chắc muốn khôi phục trạng thái làm việc cho ${selectedEmployee.fullname}?`}
                        </p>

                        <div className="employees-modal-actions">
                            <button
                                type="button"
                                className="employees-cancel-btn"
                                onClick={closeModal}
                            >
                                Hủy
                            </button>

                            <button
                                type="button"
                                className="employees-submit-btn"
                                onClick={confirmStatusChange}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageEmployee
