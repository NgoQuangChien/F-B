
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaSearch,
  FaUtensils,
  FaMusic,
  FaBowlingBall,
  FaTicketAlt,
  FaEye,
  FaCheck,
  FaTimes,
  FaUsers,
  FaPhone,
  FaFilter,
} from "react-icons/fa";

import { useParams } from "react-router-dom";
import bookingApi from "../../../api/bookingApi";
import "./manageBooking.css";

// =====================================================
// CẤU HÌNH TRẠNG THÁI ĐẶT CHỖ
// =====================================================
const statusConfig = {
  pending: { label: "Chờ xác nhận", className: "pending" },
  confirmed: { label: "Đã xác nhận", className: "confirmed" },
  rejected: { label: "Đã từ chối", className: "rejected" },
  cancelled: { label: "Đã hủy", className: "cancelled" },
  completed: { label: "Hoàn thành", className: "completed" },
};

// =====================================================
// CẤU HÌNH TRẠNG THÁI TÀI NGUYÊN
// =====================================================
const resourceStatusConfig = {
  available: {
    label: "Còn trống",
    className: "available",
  },
  pending: {
    label: "Đang chờ",
    className: "pending",
  },
  pending_deposit: {
    label: "Chờ đặt cọc",
    className: "pending",
  },
  confirmed: {
    label: "Đã đặt",
    className: "booked",
  },
  booked: {
    label: "Đã đặt",
    className: "booked",
  },
  inactive: {
    label: "Ngừng hoạt động",
    className: "inactive",
  },
  insufficient_capacity: {
    label: "Không đủ sức chứa",
    className: "insufficient",
  },
};

// =====================================================
// FORMAT NGÀY
// =====================================================
function formatDate(dateString) {
  if (!dateString) return "";

  const date = String(dateString).slice(0, 10);
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) return "";

  return `${day}/${month}/${year}`;
}

// =====================================================
// ICON DỊCH VỤ
// =====================================================
function getServiceIcon(serviceName = "") {
  const name = String(serviceName).toLowerCase();

  if (name.includes("bàn")) return <FaUtensils />;
  if (name.includes("karaoke")) return <FaMusic />;
  if (name.includes("bowling")) return <FaBowlingBall />;

  return <FaTicketAlt />;
}

// =====================================================
// CHUYỂN DỮ LIỆU API
// =====================================================
function mapBookingData(item) {
  return {
    bookingId: item.bookingId,

    bookingCode:
      item.bookingCode ||
      `DC${String(item.bookingId).padStart(4, "0")}`,

    customerName: item.customerName || "",
    phone: item.customerPhone || item.phone || "",

    serviceName: item.serviceName || "",
    resourceName: item.resourceName || "Chưa phân bổ",
    businessName: item.businessName || "",

    bookingDate:
      item.bookingDateFormatted || item.bookingDate
        ? String(
            item.bookingDateFormatted || item.bookingDate
          ).slice(0, 10)
        : "",

    startTime: item.startTime || "",
    endTime: item.endTime || "",

    quantity: Number(item.numberOfPeople ?? item.quantity) || 0,

    note: item.customerNote || item.note || "",

    status: item.status || "pending",

    resourceId: item.resourceId || "",

    requiresResource:
      Number(item.requiresResource) === 1 ||
      item.requiresResource === true,

    rejectionReason: item.rejectionReason || "",
    duration: item.duration || null,
    serviceOption: item.serviceOption || "",
    areaPreference: item.areaPreference || "",
  };
}

// =====================================================
// COMPONENT CHÍNH
// =====================================================
export default function ManageBooking() {
  const { id } = useParams();
  //const businessId = id;

  // Lấy thông tin tài khoản
    const [user] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || null;
        } catch {
            return null;
        }
    });

    // BusinessId từ URL
    const businessId = id ? Number(id) : null;

    console.log("===== KIỂM TRA THÔNG TIN =====");
    console.log("User đăng nhập:", user);
    console.log("BusinessId từ user:", user?.businessId);
    console.log("BusinessId từ URL:", id);
    console.log("BusinessId sử dụng gọi API:", businessId);
    console.log("URL hiện tại:", window.location.pathname);
  console.log("ID từ URL:", id);

  const [bookings, setBookings] = useState([]);

  // Bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // Modal chi tiết
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Modal xác nhận
  const [bookingToConfirm, setBookingToConfirm] = useState(null);

  // Danh sách tài nguyên
  const [resources, setResources] = useState([]);

  // Tài nguyên được chọn
  const [selectedResourceId, setSelectedResourceId] = useState("");

  // Trạng thái tải tài nguyên
  const [loadingResources, setLoadingResources] = useState(false);
  const [resourceError, setResourceError] = useState("");

  // Trạng thái danh sách
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Trạng thái xử lý đơn
  const [processingId, setProcessingId] = useState(null);

  // =====================================================
  // 1. LẤY DANH SÁCH ĐẶT CHỖ
  // =====================================================
  const fetchBookings = useCallback(async () => {
    if (!businessId) {
      setBookings([]);
      setError("Không tìm thấy thông tin quán.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await bookingApi.getBookingsByBusiness(businessId);

      const data = response.data?.data;

      if (!Array.isArray(data)) {
        throw new Error("Dữ liệu danh sách đặt chỗ không hợp lệ.");
      }

      const mappedData = data.map(mapBookingData);

      setBookings(mappedData);

      setSelectedBooking((previous) => {
        if (!previous) return null;

        return (
          mappedData.find(
            (item) =>
              Number(item.bookingId) === Number(previous.bookingId)
          ) || null
        );
      });
    } catch (err) {
      console.error("Lỗi lấy danh sách đặt chỗ:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể tải danh sách đặt chỗ."
      );
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // =====================================================
  // 2. LỌC DANH SÁCH
  // =====================================================
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        String(booking.customerName).toLowerCase().includes(keyword) ||
        String(booking.bookingCode).toLowerCase().includes(keyword) ||
        String(booking.phone).includes(searchTerm.trim());

      const serviceName = String(
        booking.serviceName
      ).toLowerCase();

      const isFoodService =
        serviceName.includes("bàn") ||
        serviceName.includes("ăn") ||
        serviceName.includes("đặt món") ||
        serviceName.includes("nhà hàng");

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "food" && isFoodService) ||
        (typeFilter === "entertainment" && !isFoodService);

      const matchesStatus =
        statusFilter === "all" ||
        booking.status === statusFilter;

      const matchesDate =
        !dateFilter || booking.bookingDate === dateFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    bookings,
    searchTerm,
    typeFilter,
    statusFilter,
    dateFilter,
  ]);

  // =====================================================
  // 3. LẤY DANH SÁCH TÀI NGUYÊN
  // =====================================================
  const fetchResources = async (booking) => {
    if (!businessId || !booking?.bookingId) return;

    try {
      setLoadingResources(true);
      setResourceError("");
      setResources([]);
      setSelectedResourceId("");

      const response = await bookingApi.getResourcesByBooking(
        businessId,
        booking.bookingId
      );

      const data = response.data?.data;

      console.log("API tài nguyên trả về:", response);
      console.log("response.data:", response.data);

      if (!Array.isArray(data)) {
        throw new Error("Dữ liệu tài nguyên không hợp lệ.");
      }

      setResources(data);
    } catch (err) {
      console.error("Lỗi lấy danh sách tài nguyên:", err);

      setResourceError(
        err.response?.data?.message ||
          err.message ||
          "Không thể tải danh sách tài nguyên."
      );
    } finally {
      setLoadingResources(false);
    }
  };

  // =====================================================
  // 4. MỞ MODAL XÁC NHẬN
  // =====================================================
  const handleOpenConfirm = async (booking) => {
    if (!businessId) {
      alert("Không tìm thấy thông tin quán.");
      return;
    }

    if (booking.status !== "pending") {
      alert("Đặt chỗ này không còn ở trạng thái chờ xác nhận.");
      return;
    }

    setBookingToConfirm(booking);
    setResources([]);
    setSelectedResourceId("");
    setResourceError("");

    if (booking.requiresResource) {
      await fetchResources(booking);
    }
  };

  // =====================================================
  // 5. ĐÓNG MODAL XÁC NHẬN
  // =====================================================
  const handleCloseConfirm = () => {
    if (processingId || loadingResources) return;

    setBookingToConfirm(null);
    setSelectedResourceId("");
    setResources([]);
    setResourceError("");
  };

  // =====================================================
  // 6. XÁC NHẬN ĐẶT CHỖ
  // =====================================================
  const handleConfirm = async () => {
    if (!businessId || !bookingToConfirm) return;

    if (bookingToConfirm.status !== "pending") {
      alert("Đặt chỗ này không còn ở trạng thái chờ xác nhận.");
      return;
    }

    let resourceId = null;

    // Kiểm tra tài nguyên được chọn
    if (bookingToConfirm.requiresResource) {
      if (!selectedResourceId) {
        alert("Vui lòng chọn tài nguyên còn trống.");
        return;
      }

      const selectedResource = resources.find(
        (item) =>
          Number(item.resourceId) === Number(selectedResourceId)
      );

      if (!selectedResource) {
        alert("Tài nguyên đã chọn không hợp lệ.");
        return;
      }

      if (
        selectedResource.availabilityStatus !== "available"
      ) {
        alert(
          "Tài nguyên này hiện không còn trống. Vui lòng chọn tài nguyên khác."
        );

        setSelectedResourceId("");
        return;
      }

      resourceId = Number(selectedResource.resourceId);
    }

    try {
      setProcessingId(bookingToConfirm.bookingId);

      const response = await bookingApi.confirmBooking(
        businessId,
        bookingToConfirm.bookingId,
        resourceId
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data?.message ||
            "Không thể xác nhận đặt chỗ."
        );
      }

      alert("Xác nhận đặt chỗ thành công.");

      setBookingToConfirm(null);
      setSelectedResourceId("");
      setResources([]);
      setSelectedBooking(null);

      await fetchBookings();
    } catch (err) {
      console.error("Lỗi xác nhận đặt chỗ:", err);

      alert(
        err.response?.data?.message ||
          err.message ||
          "Không thể xác nhận đặt chỗ."
      );

      // Tải lại tài nguyên vì có thể trạng thái đã thay đổi
      if (bookingToConfirm.requiresResource) {
        await fetchResources(bookingToConfirm);
      }
    } finally {
      setProcessingId(null);
    }
  };

  // =====================================================
  // 7. TỪ CHỐI ĐẶT CHỖ
  // =====================================================
  const handleReject = async (booking) => {
    if (!businessId) {
      alert("Không tìm thấy thông tin quán.");
      return;
    }

    if (booking.status !== "pending") {
      alert("Đặt chỗ này không còn ở trạng thái chờ xác nhận.");
      return;
    }

    const rejectionReason = window.prompt(
      "Nhập lý do từ chối đặt chỗ:"
    );

    if (rejectionReason === null) return;

    if (!rejectionReason.trim()) {
      alert("Vui lòng nhập lý do từ chối.");
      return;
    }

    try {
      setProcessingId(booking.bookingId);

      const response = await bookingApi.rejectBooking(
        businessId,
        booking.bookingId,
        rejectionReason.trim()
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data?.message ||
            "Không thể từ chối đặt chỗ."
        );
      }

      alert("Đã từ chối đặt chỗ.");

      setSelectedBooking(null);

      await fetchBookings();
    } catch (err) {
      console.error("Lỗi từ chối đặt chỗ:", err);

      alert(
        err.response?.data?.message ||
          err.message ||
          "Không thể từ chối đặt chỗ."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =====================================================
  // 8. XÓA BỘ LỌC
  // =====================================================
  const resetFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    setDateFilter("");
  };

  // =====================================================
  // 9. RENDER
  // =====================================================
  return (
    <div className="booking-page">
      {/* DANH SÁCH ĐẶT CHỖ */}
      <section className="booking-panel">
        <div className="booking-panel__header">
          <h2>Danh sách đặt chỗ</h2>
        </div>

        {/* BỘ LỌC */}
        <div className="booking-filters">
          <div className="booking-search">
            <FaSearch />

            <input
              type="text"
              placeholder="Tìm tên khách, mã đặt chỗ, số điện thoại..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <div className="booking-filter-control">
            <FaFilter />

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
            >
              <option value="all">Tất cả dịch vụ</option>
              <option value="food">Ăn uống</option>
              <option value="entertainment">Giải trí</option>
            </select>
          </div>

          <input
            className="booking-date-filter"
            type="date"
            aria-label="Lọc theo ngày sử dụng"
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(event.target.value)
            }
          />

          <button
            className="booking-reset-button"
            type="button"
            onClick={resetFilters}
          >
            Xóa lọc
          </button>
        </div>

        {/* TRẠNG THÁI */}
        <div className="booking-status-tabs">
          {[
            { value: "all", label: "Tất cả" },
            { value: "pending", label: "Chờ xác nhận" },
            { value: "confirmed", label: "Đã xác nhận" },
            { value: "completed", label: "Hoàn thành" },
            { value: "rejected", label: "Đã từ chối" },
            { value: "cancelled", label: "Đã hủy" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              className={
                statusFilter === item.value ? "active" : ""
              }
              onClick={() => setStatusFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* BẢNG ĐẶT CHỖ */}
        <div className="booking-table-wrapper">
          <table className="booking-table">
            <thead>
              <tr>
                <th>Mã đặt chỗ</th>
                <th>Khách hàng</th>
                <th>Dịch vụ</th>
                <th>Thời gian</th>
                <th>Số lượng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">
                    <div className="booking-empty">
                      Đang tải danh sách đặt chỗ...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7">
                    <div className="booking-empty">
                      <strong>{error}</strong>

                      <button
                        type="button"
                        onClick={fetchBookings}
                      >
                        Thử lại
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => {
                  const status = statusConfig[booking.status] || {
                    label: booking.status,
                    className: "default",
                  };

                  const isProcessing =
                    processingId === booking.bookingId;

                  return (
                    <tr key={booking.bookingId}>
                      <td>
                        <strong className="booking-code">
                          {booking.bookingCode}
                        </strong>
                      </td>

                      <td>
                        <div className="booking-customer">
                          <div>
                            <strong>
                              {booking.customerName}
                            </strong>

                            <span>
                              <FaPhone /> {booking.phone}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="booking-service">
                          <div className="booking-service__icon">
                            {getServiceIcon(booking.serviceName)}
                          </div>

                          <div>
                            <strong>
                              {booking.serviceName}
                            </strong>

                            <span>
                              {booking.resourceName}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="booking-time">
                          <strong>
                            {booking.startTime && booking.endTime
                              ? `${booking.startTime} - ${booking.endTime}`
                              : booking.startTime
                                ? `${booking.startTime} - Dự kiến 2 giờ`
                                : "Không cố định"}
                          </strong>

                          <span>
                            {formatDate(booking.bookingDate)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="booking-quantity">
                          <FaUsers />
                          {booking.quantity} người
                        </span>
                      </td>

                      <td>
                        <span
                          className={`booking-status booking-status--${status.className}`}
                        >
                          <span className="booking-status__dot" />
                          {status.label}
                        </span>
                      </td>

                      <td>
                        <div className="booking-actions">
                          <button
                            type="button"
                            className="booking-action-button view"
                            title="Xem chi tiết"
                            onClick={() =>
                              setSelectedBooking(booking)
                            }
                          >
                            <FaEye />
                          </button>

                          {booking.status === "pending" && (
                            <>
                              <button
                                type="button"
                                className="booking-action-button accept"
                                title="Nhận đơn"
                                disabled={isProcessing}
                                onClick={() =>
                                  handleOpenConfirm(booking)
                                }
                              >
                                <FaCheck />
                              </button>

                              <button
                                type="button"
                                className="booking-action-button reject"
                                title="Từ chối"
                                disabled={isProcessing}
                                onClick={() =>
                                  handleReject(booking)
                                }
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="booking-empty">
                      <FaCalendarAlt />

                      <strong>
                        Không tìm thấy lượt đặt chỗ
                      </strong>

                      <span>
                        Hãy thử thay đổi từ khóa hoặc điều kiện lọc.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================================
          MODAL XEM CHI TIẾT
      ===================================================== */}
      {selectedBooking && (
        <div
          className="booking-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedBooking(null);
            }
          }}
        >
          <section
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
          >
            <div className="booking-modal__header">
              <div>
                <span>CHI TIẾT ĐẶT CHỖ</span>

                <h2 id="booking-modal-title">
                  {selectedBooking.bookingCode}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                aria-label="Đóng chi tiết"
              >
                <FaTimes />
              </button>
            </div>

            <div className="booking-modal__body">
              <div className="booking-modal__status">
                <span>Trạng thái hiện tại</span>

                <span
                  className={`booking-status booking-status--${
                    statusConfig[selectedBooking.status]?.className ||
                    "default"
                  }`}
                >
                  <span className="booking-status__dot" />

                  {statusConfig[selectedBooking.status]?.label ||
                    selectedBooking.status}
                </span>
              </div>

              <h3>Thông tin khách hàng</h3>

              <div className="booking-detail-row">
                <span>Họ và tên</span>
                <strong>{selectedBooking.customerName}</strong>
              </div>

              <div className="booking-detail-row">
                <span>Số điện thoại</span>
                <strong>{selectedBooking.phone}</strong>
              </div>

              <h3>Thông tin dịch vụ</h3>

              <div className="booking-detail-row">
                <span>Loại dịch vụ</span>
                <strong>{selectedBooking.serviceName}</strong>
              </div>

              <div className="booking-detail-row">
                <span>Tài nguyên</span>
                <strong>{selectedBooking.resourceName}</strong>
              </div>

              <div className="booking-detail-row">
                <span>Quán</span>
                <strong>
                  {selectedBooking.businessName || "—"}
                </strong>
              </div>

              <div className="booking-detail-row">
                <span>Ngày sử dụng</span>
                <strong>
                  {formatDate(selectedBooking.bookingDate)}
                </strong>
              </div>

              <div className="booking-detail-row">
                <span>Thời gian</span>
                <strong>
                  {selectedBooking.startTime && selectedBooking.endTime
                    ? `${selectedBooking.startTime} - ${selectedBooking.endTime}`
                    : selectedBooking.startTime
                      ? `${selectedBooking.startTime} - Dự kiến 2 giờ`
                      : "Không cố định"}
                </strong>
              </div>

              <div className="booking-detail-row">
                <span>Số lượng khách</span>
                <strong>
                  {selectedBooking.quantity} người
                </strong>
              </div>

              <div className="booking-detail-note">
                <span>Ghi chú của khách</span>
                <p>
                  {selectedBooking.note || "Không có ghi chú."}
                </p>
              </div>

              {selectedBooking.rejectionReason && (
                <div className="booking-detail-note">
                  <span>Lý do từ chối</span>
                  <p>{selectedBooking.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="booking-modal__footer">
              <button
                type="button"
                className="booking-modal__close"
                onClick={() => setSelectedBooking(null)}
              >
                Đóng
              </button>

              {selectedBooking.status === "pending" && (
                <>
                  <button
                    type="button"
                    className="booking-modal__reject"
                    disabled={
                      processingId === selectedBooking.bookingId
                    }
                    onClick={() =>
                      handleReject(selectedBooking)
                    }
                  >
                    <FaTimes /> Từ chối
                  </button>

                  <button
                    type="button"
                    className="booking-modal__accept"
                    disabled={
                      processingId === selectedBooking.bookingId
                    }
                    onClick={() => {
                      const booking = selectedBooking;
                      setSelectedBooking(null);
                      handleOpenConfirm(booking);
                    }}
                  >
                    <FaCheck /> Nhận đơn
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      )}

      {/* =====================================================
          MODAL XÁC NHẬN VÀ CHỌN TÀI NGUYÊN
      ===================================================== */}
      {bookingToConfirm && (
        <div
          className="booking-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseConfirm();
            }
          }}
        >
          <section
            className="booking-modal booking-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-confirm-title"
          >
            <div className="booking-modal__header">
              <div>
                <span>XÁC NHẬN ĐẶT CHỖ</span>

                <h2 id="booking-confirm-title">
                  {bookingToConfirm.bookingCode}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseConfirm}
                aria-label="Đóng form"
                disabled={
                  processingId === bookingToConfirm.bookingId
                }
              >
                <FaTimes />
              </button>
            </div>

            <div className="booking-modal__body">
              <h3>Thông tin khách hàng</h3>

              <div className="booking-detail-row">
                <span>Họ và tên</span>
                <strong>{bookingToConfirm.customerName}</strong>
              </div>

              <div className="booking-detail-row">
                <span>Số điện thoại</span>
                <strong>{bookingToConfirm.phone || "—"}</strong>
              </div>

              <h3>Thông tin đặt chỗ</h3>

              <div className="booking-detail-row">
                <span>Dịch vụ</span>
                <strong>{bookingToConfirm.serviceName}</strong>
              </div>

              <div className="booking-detail-row">
                <span>Ngày sử dụng</span>
                <strong>
                  {formatDate(bookingToConfirm.bookingDate)}
                </strong>
              </div>

              <div className="booking-detail-row">
                <span>Thời gian</span>
                <strong>
                  {bookingToConfirm.startTime && bookingToConfirm.endTime
                    ? `${bookingToConfirm.startTime} - ${bookingToConfirm.endTime}`
                    : bookingToConfirm.startTime
                      ? `${bookingToConfirm.startTime} - Dự kiến 2 giờ`
                      : "Không cố định"}
                </strong>
              </div>

              <div className="booking-detail-row">
                <span>Số lượng khách</span>
                <strong>
                  {bookingToConfirm.quantity} người
                </strong>
              </div>

              {bookingToConfirm.serviceOption && (
                <div className="booking-detail-row">
                  <span>Loại dịch vụ</span>
                  <strong>
                    {bookingToConfirm.serviceOption}
                  </strong>
                </div>
              )}

              {bookingToConfirm.areaPreference && (
                <div className="booking-detail-row">
                  <span>Không gian</span>
                  <strong>
                    {bookingToConfirm.areaPreference}
                  </strong>
                </div>
              )}

              {bookingToConfirm.duration && (
                <div className="booking-detail-row">
                  <span>Thời lượng</span>
                  <strong>{bookingToConfirm.duration}</strong>
                </div>
              )}

              <div className="booking-detail-note">
                <span>Ghi chú của khách</span>

                <p>
                  {bookingToConfirm.note || "Không có ghi chú."}
                </p>
              </div>

              {/* PHÂN BỔ TÀI NGUYÊN */}
              {bookingToConfirm.requiresResource && (
                <div className="booking-resource-section">
                  <h3>Danh sách bàn / phòng / sân</h3>

                  {/* CHÚ THÍCH TRẠNG THÁI */}
                  <div className="booking-resource-legend">
                    {[
                      {
                        key: "available",
                        label: "Còn trống",
                      },
                      {
                        key: "pending",
                        label: "Đang chờ",
                      },
                      {
                        key: "booked",
                        label: "Đã đặt",
                      },
                      {
                        key: "inactive",
                        label: "Ngừng hoạt động",
                      },
                      {
                        key: "insufficient",
                        label: "Không đủ sức chứa",
                      },
                    ].map((item) => (
                      <span
                        key={item.key}
                        className={`booking-resource-legend__item ${item.key}`}
                      >
                        <i />
                        {item.label}
                      </span>
                    ))}
                  </div>

                  {loadingResources ? (
                    <div className="booking-resource-message">
                      Đang tải danh sách tài nguyên...
                    </div>
                  ) : resourceError ? (
                    <div className="booking-resource-error">
                      <p>{resourceError}</p>

                      <button
                        type="button"
                        onClick={() =>
                          fetchResources(bookingToConfirm)
                        }
                      >
                        Tải lại
                      </button>
                    </div>
                  ) : resources.length > 0 ? (
                    <>
                      {/* DANH SÁCH TÀI NGUYÊN */}
                      <div className="booking-resource-list">
                        {resources.map((resource) => {
                          const status =
                            resourceStatusConfig[
                              resource.availabilityStatus
                            ] || {
                              label: "Không xác định",
                              className: "unknown",
                            };

                          const isAvailable =
                            resource.availabilityStatus ===
                            "available";

                          const isSelected =
                            Number(selectedResourceId) ===
                            Number(resource.resourceId);

                          return (
                            <button
                              key={resource.resourceId}
                              type="button"
                              className={`booking-resource-card ${
                                isSelected ? "selected" : ""
                              } ${
                                !isAvailable ? "disabled" : ""
                              }`}
                              disabled={!isAvailable}
                              onClick={() =>
                                setSelectedResourceId(
                                  String(resource.resourceId)
                                )
                              }
                            >
                              <div className="booking-resource-card__header">
                                <strong>
                                  {resource.resourceName}
                                </strong>

                                <span
                                  className={`booking-resource-status ${status.className}`}
                                >
                                  {status.label}
                                </span>
                              </div>

                              <div className="booking-resource-card__info">
                                <span>
                                  Loại:{" "}
                                  {resource.resourceType || "—"}
                                </span>

                                <span>
                                  Khu vực:{" "}
                                  {resource.areaName || "—"}
                                </span>

                                <span>
                                  Sức chứa:{" "}
                                  {resource.capacity ??
                                    "Không giới hạn"}{" "}
                                  người
                                </span>
                              </div>

                              {resource.description && (
                                <p>{resource.description}</p>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* TÀI NGUYÊN ĐƯỢC CHỌN */}
                      {selectedResourceId && (
                        <div className="booking-resource-selected">
                          {(() => {
                            const resource = resources.find(
                              (item) =>
                                Number(item.resourceId) ===
                                Number(selectedResourceId)
                            );

                            if (!resource) return null;

                            return (
                              <>
                                <strong>
                                  Đã chọn: {resource.resourceName}
                                </strong>

                                <span>
                                  Khu vực:{" "}
                                  {resource.areaName || "—"}
                                </span>

                                <span>
                                  Sức chứa:{" "}
                                  {resource.capacity ??
                                    "Không giới hạn"}{" "}
                                  người
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      )}

                      <p className="booking-resource-hint">
                        Chỉ có thể chọn tài nguyên đang còn trống.
                        Tài nguyên đang được sử dụng, ngừng hoạt
                        động hoặc không đủ sức chứa sẽ không thể
                        lựa chọn.
                      </p>
                    </>
                  ) : (
                    <div className="booking-resource-error">
                      Không tìm thấy tài nguyên thuộc dịch vụ này.
                    </div>
                  )}
                </div>
              )}

              {!bookingToConfirm.requiresResource && (
                <div className="booking-confirm-note">
                  Dịch vụ này không yêu cầu phân bổ tài nguyên.
                </div>
              )}
            </div>

            <div className="booking-modal__footer">
              <button
                type="button"
                className="booking-modal__close"
                disabled={
                  processingId === bookingToConfirm.bookingId ||
                  loadingResources
                }
                onClick={handleCloseConfirm}
              >
                Hủy
              </button>

              <button
                type="button"
                className="booking-modal__accept"
                disabled={
                  processingId === bookingToConfirm.bookingId ||
                  loadingResources ||
                  (
                    bookingToConfirm.requiresResource &&
                    !resources.some(
                      (resource) =>
                        Number(resource.resourceId) ===
                          Number(selectedResourceId) &&
                        resource.availabilityStatus === "available"
                    )
                  )
                }
                onClick={handleConfirm}
              >
                <FaCheck />

                {loadingResources
                  ? "Đang tải tài nguyên..."
                  : processingId === bookingToConfirm.bookingId
                    ? "Đang xử lý..."
                    : "Xác nhận nhận đơn"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}