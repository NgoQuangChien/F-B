
import { useEffect, useMemo, useState } from "react";

import shipperApi from "../../../api/shipperApi";
import businessApi from "../../../api/businessApi";

import {
    FaStore,
    FaIdCard,
    FaSearch,
    FaEye,
    FaTimes,
    FaCheck,
    FaBan,
    FaMapMarkerAlt,
    FaSyncAlt,
    FaExternalLinkAlt,
    FaMotorcycle
} from "react-icons/fa";

import "./profileModeration.css";

// Lấy dữ liệu từ response API
const getResponseData = (response) => {
    const data = response?.data?.data ?? response?.data;

    return Array.isArray(data) ? data : [];
};

// Hiển thị ngày tháng
const formatDate = (date) => {
    if (!date) return "Chưa cập nhật";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Chưa cập nhật";
    }

    return parsedDate.toLocaleDateString("vi-VN");
};

// Hiển thị giá trị không bị trống
const displayValue = (value) => {
    return value !== undefined && value !== null && value !== ""
        ? value
        : "Chưa cập nhật";
};

// Lấy tên hồ sơ quán
const getBusinessName = (business) => {
    return business.businessName || "Chưa có tên quán";
};

// Lấy tên shipper
const getShipperName = (shipper) => {
    return shipper.shipperName || "Chưa có tên";
};

// Hiển thị ảnh giấy tờ
function DocumentItem({ title, image }) {
    return (
        <div className="mb-document-item">
            <h4>{title}</h4>

            {image ? (
                <a
                    href={image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-document-link"
                >
                    <img src={image} alt={title} />
                    <span>
                        Xem ảnh <FaExternalLinkAlt />
                    </span>
                </a>
            ) : (
                <div className="mb-document-empty">
                    <FaIdCard />
                    <span>Chưa cung cấp hình ảnh</span>
                </div>
            )}
        </div>
    );
}

function ProfileModeration() {
    // Tab đang hiển thị
    const [activeTab, setActiveTab] = useState("business");

    // Danh sách hồ sơ
    const [businesses, setBusinesses] = useState([]);
    const [shippers, setShippers] = useState([]);

    // Trạng thái tải dữ liệu
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Tìm kiếm
    const [searchTerm, setSearchTerm] = useState("");

    // Hồ sơ đang xem chi tiết
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [selectedShipper, setSelectedShipper] = useState(null);

    // Từ chối hồ sơ
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    // Thông báo lỗi
    const [error, setError] = useState("");

    // Lấy danh sách hồ sơ đang chờ duyệt
    const fetchPendingProfiles = async () => {
        setLoading(true);
        setError("");

        try {
            const [businessResult, shipperResult] = await Promise.allSettled([
                businessApi.getPendingBusinesses(),
                shipperApi.getPendingShippers()
            ]);

            if (businessResult.status === "fulfilled") {
                setBusinesses(getResponseData(businessResult.value));
            } else {
                console.error(
                    "Lỗi lấy danh sách hồ sơ quán:",
                    businessResult.reason
                );
            }

            if (shipperResult.status === "fulfilled") {
                setShippers(getResponseData(shipperResult.value));
            } else {
                console.error(
                    "Lỗi lấy danh sách hồ sơ shipper:",
                    shipperResult.reason
                );
            }

            if (
                businessResult.status === "rejected" &&
                shipperResult.status === "rejected"
            ) {
                setError("Không thể tải danh sách hồ sơ. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Lỗi tải danh sách hồ sơ:", error);
            setError("Đã xảy ra lỗi khi tải danh sách hồ sơ.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingProfiles();
    }, []);

    // Tìm kiếm hồ sơ quán
    const filteredBusinesses = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) return businesses;

        return businesses.filter((business) => {
            const searchData = [
                business.businessName,
                business.name,
                business.fullname,
                business.phone,
                business.email,
                business.address
            ];

            return searchData.some((value) =>
                String(value || "").toLowerCase().includes(keyword)
            );
        });
    }, [businesses, searchTerm]);

    // Tìm kiếm hồ sơ shipper
    const filteredShippers = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) return shippers;

        return shippers.filter((shipper) => {
            const searchData = [
                shipper.shipperName,
                shipper.fullName,
                shipper.phone,
                shipper.email,
                shipper.citizenId,
                shipper.licensePlate
            ];

            return searchData.some((value) =>
                String(value || "").toLowerCase().includes(keyword)
            );
        });
    }, [shippers, searchTerm]);

    // Mở chi tiết hồ sơ quán
    const openBusinessDetail = (business) => {
        setSelectedShipper(null);
        setSelectedBusiness(business);

        setShowRejectForm(false);
        setRejectionReason("");
    };

    // Mở chi tiết hồ sơ shipper
    const openShipperDetail = (shipper) => {
        setSelectedBusiness(null);
        setSelectedShipper(shipper);

        setShowRejectForm(false);
        setRejectionReason("");
    };

    // Đóng modal
    const closeDetail = () => {
        if (processing) return;

        setSelectedBusiness(null);
        setSelectedShipper(null);

        setShowRejectForm(false);
        setRejectionReason("");
    };

    // Xử lý duyệt hồ sơ quán
    const handleReviewBusiness = async (status) => {
        if (!selectedBusiness) return;

        const businessId = selectedBusiness.businessId;

        if (!businessId) {
            alert("Không tìm thấy mã hồ sơ quán.");
            return;
        }

        if (status === "rejected" && !rejectionReason.trim()) {
            alert("Vui lòng nhập lý do từ chối hồ sơ.");
            return;
        }

        const confirmMessage =
            status === "approved"
                ? "Bạn có chắc chắn muốn duyệt hồ sơ quán này?"
                : "Bạn có chắc chắn muốn từ chối hồ sơ quán này?";

        if (!window.confirm(confirmMessage)) return;

        setProcessing(true);

        try {
            await businessApi.reviewBusiness(businessId, {
                status,
                rejectionReason:
                    status === "rejected"
                        ? rejectionReason.trim()
                        : null
            });

            // Xóa hồ sơ khỏi danh sách đang chờ
            setBusinesses((prev) =>
                prev.filter(
                    (item) => item.businessId !== businessId
                )
            );

            alert(
                status === "approved"
                    ? "Duyệt hồ sơ quán thành công!"
                    : "Đã từ chối hồ sơ quán!"
            );

            setSelectedBusiness(null);
            setSelectedShipper(null);
            setShowRejectForm(false);
            setRejectionReason("");
        } catch (error) {
            console.error("Lỗi duyệt hồ sơ quán:", error);

            alert(
                error.response?.data?.message ||
                "Không thể xử lý hồ sơ quán. Vui lòng thử lại."
            );
        } finally {
            setProcessing(false);
        }
    };

    // Xử lý duyệt hồ sơ shipper
    const handleReviewShipper = async (status) => {
        if (!selectedShipper) return;

        const shipperId = selectedShipper.shipperId;

        if (!shipperId) {
            alert("Không tìm thấy mã hồ sơ shipper.");
            return;
        }

        if (status === "rejected" && !rejectionReason.trim()) {
            alert("Vui lòng nhập lý do từ chối hồ sơ.");
            return;
        }

        const confirmMessage =
            status === "approved"
                ? "Bạn có chắc chắn muốn duyệt hồ sơ shipper này?"
                : "Bạn có chắc chắn muốn từ chối hồ sơ shipper này?";

        if (!window.confirm(confirmMessage)) return;

        setProcessing(true);

        try {
            await shipperApi.reviewShipper(shipperId, {
                status,
                rejectionReason:
                    status === "rejected"
                        ? rejectionReason.trim()
                        : null
            });

            // Xóa hồ sơ khỏi danh sách đang chờ
            setShippers((prev) =>
                prev.filter(
                    (item) => item.shipperId !== shipperId
                )
            );

            alert(
                status === "approved"
                    ? "Duyệt hồ sơ shipper thành công!"
                    : "Đã từ chối hồ sơ shipper!"
            );

            setSelectedBusiness(null);
            setSelectedShipper(null);
            setShowRejectForm(false);
            setRejectionReason("");
        } catch (error) {
            console.error("Lỗi duyệt hồ sơ shipper:", error);

            alert(
                error.response?.data?.message ||
                "Không thể xử lý hồ sơ shipper. Vui lòng thử lại."
            );
        } finally {
            setProcessing(false);
        }
    };

    // Chọn đúng loại hồ sơ để xử lý
    const handleReview = (status) => {
        if (selectedBusiness) {
            handleReviewBusiness(status);
        } else if (selectedShipper) {
            handleReviewShipper(status);
        }
    };

    // Hiển thị modal chi tiết
    const renderDetailModal = () => {
        if (!selectedBusiness && !selectedShipper) return null;

        const isBusiness = Boolean(selectedBusiness);
        const profile = selectedBusiness || selectedShipper;

        return (
            <div
                className="mb-modal-overlay"
                onClick={closeDetail}
            >
                <div
                    className="mb-detail-modal"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="mb-modal-header">
                        <div>
                            <h3>
                                {isBusiness
                                    ? "Chi tiết hồ sơ quán"
                                    : "Chi tiết hồ sơ shipper"}
                            </h3>

                            <p>
                                Kiểm tra thông tin trước khi xét duyệt
                            </p>
                        </div>

                        <button
                            type="button"
                            className="mb-close-btn"
                            onClick={closeDetail}
                            disabled={processing}
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="mb-modal-content">
                        {/* THÔNG TIN CƠ BẢN */}
                        <div className="mb-detail-section">
                            <h4>Thông tin cơ bản</h4>

                            <div className="mb-info-grid">
                                <div className="mb-info-item">
                                    <span>
                                        {isBusiness
                                            ? "Tên quán"
                                            : "Họ và tên"}
                                    </span>

                                    <strong>
                                        {isBusiness
                                            ? getBusinessName(profile)
                                            : getShipperName(profile)}
                                    </strong>
                                </div>

                                <div className="mb-info-item">
                                    <span>Số điện thoại</span>
                                    <strong>
                                        {displayValue(profile.phone)}
                                    </strong>
                                </div>

                                <div className="mb-info-item">
                                    <span>Email</span>
                                    <strong>
                                        {displayValue(
                                            profile.email || profile.accountEmail
                                        )}
                                    </strong>
                                </div>

                                <div className="mb-info-item">
                                    <span>Ngày đăng ký</span>
                                    <strong>
                                        {formatDate(profile.createdAt)}
                                    </strong>
                                </div>

                                {isBusiness ? (
                                    <>
                                        <div className="mb-info-item">
                                            <span>Người đại diện</span>
                                            <strong>
                                                {displayValue(profile.fullname)}
                                            </strong>
                                        </div>

                                        <div className="mb-info-item">
                                            <span>Địa chỉ</span>
                                            <strong>
                                                {displayValue(profile.address)}
                                            </strong>
                                        </div>

                                        <div className="mb-info-item">
                                            <span>Trạng thái kinh doanh</span>
                                            <strong>
                                                {displayValue(profile.openStatus)}
                                            </strong>
                                        </div>

                                        <div className="mb-info-item">
                                            <span>Mã số giấy tờ</span>
                                            <strong>
                                                {displayValue(profile.citizenId)}
                                            </strong>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-info-item">
                                            <span>Số CCCD</span>
                                            <strong>
                                                {displayValue(profile.citizenId)}
                                            </strong>
                                        </div>

                                        <div className="mb-info-item">
                                            <span>Loại phương tiện</span>
                                            <strong>
                                                {displayValue(profile.vehicleType)}
                                            </strong>
                                        </div>

                                        <div className="mb-info-item">
                                            <span>Biển số xe</span>
                                            <strong>
                                                {displayValue(profile.licensePlate)}
                                            </strong>
                                        </div>
                                    </>
                                )}
                            </div>

                            {isBusiness && profile.addressLink && (
                                <a
                                    href={profile.addressLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mb-map-link"
                                >
                                    <FaMapMarkerAlt />
                                    Xem vị trí trên bản đồ
                                    <FaExternalLinkAlt />
                                </a>
                            )}

                            {isBusiness && profile.introduce && (
                                <div className="mb-introduce">
                                    <span>Giới thiệu</span>
                                    <p>{profile.introduce}</p>
                                </div>
                            )}
                        </div>

                        {/* HÌNH ẢNH GIẤY TỜ */}
                        <div className="mb-detail-section">
                            <h4>Hình ảnh giấy tờ xác minh</h4>

                            <div className="mb-document-grid">
                                {isBusiness ? (
                                    <>
                                        <DocumentItem
                                            title="CCCD mặt trước"
                                            image={
                                                profile.imageCitizenBefore ||
                                                profile.imageCitizenIdBefore
                                            }
                                        />

                                        <DocumentItem
                                            title="CCCD mặt sau"
                                            image={
                                                profile.imageCitizenAfter ||
                                                profile.imageCitizenIdAfter
                                            }
                                        />
                                    </>
                                ) : (
                                    <>
                                        <DocumentItem
                                            title="CCCD mặt trước"
                                            image={profile.imageCitizenIdBefore}
                                        />

                                        <DocumentItem
                                            title="CCCD mặt sau"
                                            image={profile.imageCitizenIdAfter}
                                        />

                                        <DocumentItem
                                            title="Giấy phép lái xe"
                                            image={profile.imageDrivingLicense}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* FORM TỪ CHỐI */}
                        {showRejectForm && (
                            <div className="mb-reject-section">
                                <h4>Lý do từ chối hồ sơ</h4>

                                <textarea
                                    value={rejectionReason}
                                    onChange={(event) =>
                                        setRejectionReason(event.target.value)
                                    }
                                    placeholder="Nhập lý do từ chối hồ sơ..."
                                    rows={4}
                                    disabled={processing}
                                />

                                <p>
                                    Vui lòng ghi rõ lý do để người đăng ký
                                    biết và có thể chỉnh sửa hồ sơ.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* NÚT XỬ LÝ */}
                    <div className="mb-modal-footer">
                        <button
                            type="button"
                            className="mb-reject-btn"
                            onClick={() => {
                                if (showRejectForm) {
                                    handleReview("rejected");
                                } else {
                                    setShowRejectForm(true);
                                }
                            }}
                            disabled={processing}
                        >
                            <FaBan />

                            {processing
                                ? "Đang xử lý..."
                                : showRejectForm
                                    ? "Xác nhận từ chối"
                                    : "Từ chối"}
                        </button>

                        <button
                            type="button"
                            className="mb-approve-btn"
                            onClick={() => handleReview("approved")}
                            disabled={processing || showRejectForm}
                        >
                            <FaCheck />
                            {processing ? "Đang xử lý..." : "Duyệt hồ sơ"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="manage-business">
            {/* TIÊU ĐỀ */}
            <div className="mb-page-header">
                <div>
                    <h2>Kiểm duyệt hồ sơ</h2>
                    <p>
                        Quản lý và xét duyệt hồ sơ đăng ký của quán
                        và người giao hàng.
                    </p>
                </div>

                <button
                    type="button"
                    className="mb-refresh-btn"
                    onClick={fetchPendingProfiles}
                    disabled={loading}
                >
                    <FaSyncAlt className={loading ? "mb-spinning" : ""} />
                    Làm mới
                </button>
            </div>


            {/* TAB */}
            <div className="mb-tabs">
                <button
                    type="button"
                    className={activeTab === "business" ? "mb-tab active" : "mb-tab"}
                    onClick={() => {
                        setActiveTab("business");
                        setSearchTerm("");
                    }}
                >
                    <FaStore />
                    Hồ sơ quán
                    <span>{businesses.length}</span>
                </button>

                <button
                    type="button"
                    className={activeTab === "shipper" ? "mb-tab active" : "mb-tab"}
                    onClick={() => {
                        setActiveTab("shipper");
                        setSearchTerm("");
                    }}
                >
                    <FaMotorcycle />
                    Hồ sơ shipper
                    <span>{shippers.length}</span>
                </button>
            </div>

            {/* DANH SÁCH */}
            <div className="mb-list-container">
                <div className="mb-list-header">
                    <div>
                        <h3>
                            {activeTab === "business"
                                ? "Danh sách hồ sơ quán"
                                : "Danh sách hồ sơ shipper"}
                        </h3>

                        <p>
                            {activeTab === "business"
                                ? "Các hồ sơ đăng ký kinh doanh đang chờ xét duyệt."
                                : "Các hồ sơ đăng ký làm người giao hàng đang chờ xét duyệt."}
                        </p>
                    </div>

                    <div className="mb-search-box">
                        <FaSearch />

                        <input
                            type="text"
                            placeholder="Tìm kiếm hồ sơ..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />
                    </div>
                </div>

                {error && (
                    <div className="mb-error-message">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="mb-empty-state">
                        Đang tải danh sách hồ sơ...
                    </div>
                ) : activeTab === "business" ? (
                    <div className="mb-table-wrapper">
                        <table className="mb-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên quán</th>
                                    <th>Người đại diện</th>
                                    <th>Số điện thoại</th>
                                    <th>Địa chỉ</th>
                                    <th>Ngày đăng ký</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredBusinesses.length > 0 ? (
                                    filteredBusinesses.map((business, index) => (
                                        <tr key={business.businessId || index}>
                                            <td>{index + 1}</td>

                                            <td>
                                                <strong>
                                                    {getBusinessName(business)}
                                                </strong>
                                            </td>

                                            <td>
                                                {displayValue(business.fullname)}
                                            </td>

                                            <td>
                                                {displayValue(business.phone)}
                                            </td>

                                            <td className="mb-address-cell">
                                                {displayValue(business.address)}
                                            </td>

                                            <td>
                                                {formatDate(business.createdAt)}
                                            </td>

                                            <td>
                                                <span className="mb-status pending">
                                                    Chờ duyệt
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="mb-view-btn"
                                                    onClick={() =>
                                                        openBusinessDetail(business)
                                                    }
                                                >
                                                    <FaEye />
                                                    Chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8">
                                            <div className="mb-empty-state">
                                                Không tìm thấy hồ sơ quán nào.
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="mb-table-wrapper">
                        <table className="mb-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Họ và tên</th>
                                    <th>Số điện thoại</th>
                                    <th>Số CCCD</th>
                                    <th>Loại xe</th>
                                    <th>Biển số xe</th>
                                    <th>Ngày đăng ký</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredShippers.length > 0 ? (
                                    filteredShippers.map((shipper, index) => (
                                        <tr key={shipper.shipperId || index}>
                                            <td>{index + 1}</td>

                                            <td>
                                                <strong>
                                                    {getShipperName(shipper)}
                                                </strong>
                                            </td>

                                            <td>
                                                {displayValue(shipper.phone)}
                                            </td>

                                            <td>
                                                {displayValue(shipper.citizenId)}
                                            </td>

                                            <td>
                                                {displayValue(shipper.vehicleType)}
                                            </td>

                                            <td>
                                                {displayValue(shipper.licensePlate)}
                                            </td>

                                            <td>
                                                {formatDate(shipper.createdAt)}
                                            </td>

                                            <td>
                                                <span className="mb-status pending">
                                                    Chờ duyệt
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="mb-view-btn"
                                                    onClick={() =>
                                                        openShipperDetail(shipper)
                                                    }
                                                >
                                                    <FaEye />
                                                    Chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9">
                                            <div className="mb-empty-state">
                                                Không tìm thấy hồ sơ shipper nào.
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL CHI TIẾT */}
            {renderDetailModal()}
        </div>
    );
}

export default ProfileModeration;
