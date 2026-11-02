
import { useEffect, useMemo, useState } from "react";
import bookingApi from "../../../api/bookingApi";
import "./dinnerSet.css";

// Các giờ bắt đầu từ 08:00 đến 22:00
const startTimes = Array.from({ length: 15 }, (_, index) =>
    `${String(index + 8).padStart(2, "0")}:00`
);

// Thời lượng
const durations = [
    { value: "1", label: "1 giờ" },
    { value: "2", label: "2 giờ" },
    { value: "3", label: "3 giờ" },
    { value: "4", label: "4 giờ" }
];

// Lấy ngày hiện tại theo múi giờ Việt Nam
function getToday() {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(new Date());

    const values = Object.fromEntries(
        parts.map(part => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}`;
}

// Lấy giờ hiện tại theo múi giờ Việt Nam
function getCurrentTime() {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).formatToParts(new Date());

    const values = Object.fromEntries(
        parts.map(part => [part.type, part.value])
    );

    return `${values.hour}:${values.minute}`;
}

// Lọc giờ bắt đầu hợp lệ
function getAvailableStartTimes(bookingDate) {
    if (!bookingDate) return [];

    const today = getToday();

    // Ngày trong quá khứ
    if (bookingDate < today) {
        return [];
    }

    // Ngày tương lai: hiển thị tất cả giờ
    if (bookingDate > today) {
        return startTimes;
    }

    // Ngày hôm nay: chỉ hiển thị giờ chưa qua
    const currentTime = getCurrentTime();

    return startTimes.filter(time => time > currentTime);
}

// Tính giờ kết thúc
function calculateEndTime(startTime, duration) {
    if (!startTime || !duration) return "";

    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes =
        hours * 60 + minutes + Number(duration) * 60;

    if (totalMinutes >= 1440) return "";

    return (
        `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:` +
        `${String(totalMinutes % 60).padStart(2, "0")}`
    );
}

const initialForm = {
    serviceId: "",
    customerName: "",
    customerPhone: "",
    bookingDate: "",
    startTime: "",
    duration: "1",
    serviceOption: "",
    areaPreference: "",
    numberOfPeople: "2",
    customerNote: ""
};

function DinnerSet({ businessId, onClose }) {
    const [services, setServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState(initialForm);

    console.log("Business ID nhận được:", businessId);

    // Lấy dịch vụ của quán
    useEffect(() => {
        let isMounted = true;

        const fetchServices = async () => {
            if (!businessId || !Number.isInteger(Number(businessId))) {
                setError("Không tìm thấy mã quán hợp lệ.");
                setLoadingServices(false);
                return;
            }

            try {
                setLoadingServices(true);
                setError("");

                const response =
                    await bookingApi.getServicesByBusinessId(businessId);

                const result = response.data;

                if (!result?.success) {
                    throw new Error(
                        result?.message || "Không thể lấy danh sách dịch vụ."
                    );
                }

                const serviceList = Array.isArray(result.data)
                    ? result.data
                    : [];

                if (!isMounted) return;

                setServices(serviceList);

                if (serviceList.length > 0) {
                    setFormData(previous => ({
                        ...previous,
                        serviceId: String(serviceList[0].serviceId)
                    }));
                }
            } catch (err) {
                console.error("Lỗi lấy dịch vụ:", err);

                if (isMounted) {
                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Không thể tải danh sách dịch vụ."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoadingServices(false);
                }
            }
        };

        fetchServices();

        return () => {
            isMounted = false;
        };
    }, [businessId]);

    // Dịch vụ được chọn
    const selectedService = useMemo(() => {
        return services.find(
            service =>
                String(service.serviceId) === String(formData.serviceId)
        );
    }, [services, formData.serviceId]);

    const isHourly = selectedService?.billingType === "hourly";

    const hasStartTime = ["hourly", "slot"].includes(
        selectedService?.billingType
    );

    const supportsPeople =
        Number(selectedService?.supportsPeople) === 1;

    const endTime = isHourly
        ? calculateEndTime(formData.startTime, formData.duration)
        : null;

    // Danh sách giờ hợp lệ theo ngày đã chọn
    const availableStartTimes = useMemo(() => {
        return getAvailableStartTimes(formData.bookingDate);
    }, [formData.bookingDate]);

    // Tự động chọn giờ hợp lệ khi đổi ngày hoặc dịch vụ
    useEffect(() => {
        if (!hasStartTime || !formData.bookingDate) {
            return;
        }

        setFormData(previous => ({
            ...previous,
            startTime: availableStartTimes.includes(previous.startTime)
                ? previous.startTime
                : availableStartTimes[0] || ""
        }));
    }, [hasStartTime, formData.bookingDate, availableStartTimes]);

    // Khóa cuộn và xử lý phím ESC
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const handleKeyDown = event => {
            if (event.key === "Escape" && !submitting) {
                onClose?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, submitting]);

    // Đóng modal
    const handleClose = () => {
        if (!submitting) {
            onClose?.();
        }
    };

    // Cập nhật dữ liệu form
    const handleChange = event => {
        const { name, value } = event.target;

        setFormData(previous => ({
            ...previous,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    // Gửi yêu cầu đặt chỗ
    const handleSubmit = async event => {
        event.preventDefault();

        if (!selectedService) {
            setError("Vui lòng chọn dịch vụ.");
            return;
        }

        if (!formData.customerName.trim()) {
            setError("Vui lòng nhập họ và tên.");
            return;
        }

        if (!/^[0-9+\s.-]{9,15}$/.test(formData.customerPhone.trim())) {
            setError("Số điện thoại không hợp lệ.");
            return;
        }

        if (!formData.bookingDate) {
            setError("Vui lòng chọn ngày đặt.");
            return;
        }

        const today = getToday();

        if (formData.bookingDate < today) {
            setError("Ngày đặt không được ở trong quá khứ.");
            return;
        }

        // Kiểm tra lại giờ tại thời điểm gửi form
        if (hasStartTime) {
            const currentAvailableTimes =
                getAvailableStartTimes(formData.bookingDate);

            if (
                !formData.startTime ||
                !currentAvailableTimes.includes(formData.startTime)
            ) {
                setError(
                    "Giờ bắt đầu đã qua hoặc không hợp lệ. Vui lòng chọn giờ khác."
                );
                return;
            }
        }

        if (isHourly && !endTime) {
            setError("Thời gian kết thúc không hợp lệ.");
            return;
        }

        if (
            supportsPeople &&
            (
                !Number.isInteger(Number(formData.numberOfPeople)) ||
                Number(formData.numberOfPeople) < 1
            )
        ) {
            setError("Số lượng người không hợp lệ.");
            return;
        }

        const bookingData = {
            businessId: Number(businessId),
            serviceId: Number(selectedService.serviceId),

            customerName: formData.customerName.trim(),
            customerPhone: formData.customerPhone.trim(),

            // Giữ nguyên chuỗi YYYY-MM-DD, không chuyển qua Date hoặc UTC
            bookingDate: formData.bookingDate,

            startTime: hasStartTime
                ? formData.startTime
                : null,

            endTime: isHourly ? endTime : null,

            duration: isHourly
                ? Number(formData.duration)
                : null,

            numberOfPeople: supportsPeople
                ? Number(formData.numberOfPeople)
                : 1,

            serviceOption:
                formData.serviceOption.trim() || null,

            areaPreference:
                formData.areaPreference.trim() || null,

            customerNote:
                formData.customerNote.trim() || null
        };

        try {
            setSubmitting(true);
            setError("");

            const response =
                await bookingApi.createBooking(bookingData);

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message || "Đặt dịch vụ thất bại."
                );
            }

            setSuccess("Gửi yêu cầu đặt dịch vụ thành công!");

            setTimeout(() => {
                onClose?.();
            }, 1000);

        } catch (err) {
            console.error("Lỗi tạo yêu cầu đặt chỗ:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Không thể gửi yêu cầu đặt dịch vụ."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="booking-modal-overlay"
            onMouseDown={event => {
                if (event.target === event.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div
                className="booking-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="booking-modal-title"
            >
                <button
                    type="button"
                    className="booking-modal-close"
                    onClick={handleClose}
                    disabled={submitting}
                    aria-label="Đóng"
                >
                    &times;
                </button>

                <div className="booking-modal-header">
                    <h2 id="booking-modal-title">Đặt dịch vụ</h2>
                    <p>
                        Điền thông tin để gửi yêu cầu đặt dịch vụ đến quán.
                    </p>
                </div>

                {loadingServices ? (
                    <div className="booking-message">
                        Đang tải danh sách dịch vụ...
                    </div>
                ) : services.length === 0 ? (
                    <div className="booking-empty">
                        <p>Quán hiện chưa cung cấp dịch vụ đặt chỗ.</p>

                        {error && (
                            <p className="booking-error">{error}</p>
                        )}

                        <button
                            type="button"
                            className="booking-cancel-btn"
                            onClick={handleClose}
                        >
                            Đóng
                        </button>
                    </div>
                ) : (
                    <form
                        className="booking-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="booking-form-grid">

                            <div className="booking-form-group">
                                <label htmlFor="customerName">
                                    Họ và tên <span>*</span>
                                </label>

                                <input
                                    id="customerName"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleChange}
                                    placeholder="Nhập họ và tên"
                                    maxLength={150}
                                    required
                                />
                            </div>

                            <div className="booking-form-group">
                                <label htmlFor="customerPhone">
                                    Số điện thoại <span>*</span>
                                </label>

                                <input
                                    id="customerPhone"
                                    name="customerPhone"
                                    type="tel"
                                    value={formData.customerPhone}
                                    onChange={handleChange}
                                    placeholder="Nhập số điện thoại"
                                    pattern="[0-9+\s.-]{9,15}"
                                    required
                                />
                            </div>

                            <div className="booking-form-group">
                                <label htmlFor="serviceId">
                                    Loại dịch vụ <span>*</span>
                                </label>

                                <select
                                    id="serviceId"
                                    name="serviceId"
                                    value={formData.serviceId}
                                    onChange={handleChange}
                                    disabled={services.length === 1}
                                    required
                                >
                                    {services.map(service => (
                                        <option
                                            key={service.serviceId}
                                            value={String(service.serviceId)}
                                        >
                                            {service.serviceName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="booking-form-group">
                                <label htmlFor="bookingDate">
                                    Ngày đặt <span>*</span>
                                </label>

                                <input
                                    id="bookingDate"
                                    type="date"
                                    name="bookingDate"
                                    value={formData.bookingDate}
                                    onChange={handleChange}
                                    min={getToday()}
                                    required
                                />
                            </div>

                            {hasStartTime && (
                                <div className="booking-form-group">
                                    <label htmlFor="startTime">
                                        Giờ bắt đầu <span>*</span>
                                    </label>

                                    <select
                                        id="startTime"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        required
                                        disabled={!formData.bookingDate || availableStartTimes.length === 0}
                                    >
                                        {availableStartTimes.length === 0 ? (
                                            <option value="">
                                                Không còn giờ phù hợp
                                            </option>
                                        ) : (
                                            <>
                                                <option value="">
                                                    -- Chọn giờ bắt đầu --
                                                </option>

                                                {availableStartTimes.map(time => (
                                                    <option
                                                        key={time}
                                                        value={time}
                                                    >
                                                        {time}
                                                    </option>
                                                ))}
                                            </>
                                        )}
                                    </select>

                                    {formData.bookingDate === getToday() && (
                                        <small>
                                            Chỉ hiển thị các giờ chưa qua.
                                        </small>
                                    )}
                                </div>
                            )}

                            {isHourly && (
                                <>
                                    <div className="booking-form-group">
                                        <label htmlFor="duration">
                                            Thời lượng <span>*</span>
                                        </label>

                                        <select
                                            id="duration"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleChange}
                                            required
                                        >
                                            {durations.map(item => (
                                                <option
                                                    key={item.value}
                                                    value={item.value}
                                                >
                                                    {item.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="booking-form-group">
                                        <label htmlFor="endTime">
                                            Giờ kết thúc dự kiến
                                        </label>

                                        <input
                                            id="endTime"
                                            value={endTime || "Không hợp lệ"}
                                            readOnly
                                        />
                                    </div>
                                </>
                            )}

                            <div className="booking-form-group">
                                <label htmlFor="serviceOption">
                                    Loại bàn / phòng / sân
                                </label>

                                <input
                                    id="serviceOption"
                                    name="serviceOption"
                                    value={formData.serviceOption}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: Bàn VIP, phòng thường..."
                                    maxLength={150}
                                />
                            </div>

                            <div className="booking-form-group">
                                <label htmlFor="areaPreference">
                                    Không gian mong muốn
                                </label>

                                <input
                                    id="areaPreference"
                                    name="areaPreference"
                                    value={formData.areaPreference}
                                    onChange={handleChange}
                                    placeholder="Trong nhà, ngoài trời..."
                                    maxLength={150}
                                />
                            </div>

                            {supportsPeople && (
                                <div className="booking-form-group">
                                    <label htmlFor="numberOfPeople">
                                        Số lượng người <span>*</span>
                                    </label>

                                    <input
                                        id="numberOfPeople"
                                        type="number"
                                        name="numberOfPeople"
                                        value={formData.numberOfPeople}
                                        onChange={handleChange}
                                        min="1"
                                        max="1000"
                                        required
                                    />
                                </div>
                            )}

                            <div className="booking-form-group booking-form-group-full">
                                <label htmlFor="customerNote">
                                    Ghi chú
                                </label>

                                <textarea
                                    id="customerNote"
                                    name="customerNote"
                                    value={formData.customerNote}
                                    onChange={handleChange}
                                    placeholder="Nhập yêu cầu thêm nếu có..."
                                    rows={3}
                                    maxLength={1000}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="booking-error">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="booking-success">
                                {success}
                            </div>
                        )}

                        <div className="booking-form-actions">
                            <button
                                type="button"
                                className="booking-cancel-btn"
                                onClick={handleClose}
                                disabled={submitting}
                            >
                                Hủy
                            </button>

                            <button
                                type="submit"
                                className="booking-submit-btn"
                                disabled={
                                    submitting ||
                                    (
                                        hasStartTime &&
                                        availableStartTimes.length === 0
                                    )
                                }
                            >
                                {submitting
                                    ? "Đang gửi..."
                                    : "Gửi yêu cầu đặt dịch vụ"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default DinnerSet;
