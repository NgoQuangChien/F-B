
import { useState } from "react";
import {
    FaCamera,
    FaPlus,
    FaTrash,
    FaEdit,
    FaTimes,
    FaClock,
    FaStore,
    FaImage,
    FaSave,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaCheck
} from "react-icons/fa";

import "./infoBusinesses.css";

const initialHours = [
    { day: "Thứ 2", isClosed: false, openTime: "08:00", closeTime: "22:00" },
    { day: "Thứ 3", isClosed: false, openTime: "08:00", closeTime: "22:00" },
    { day: "Thứ 4", isClosed: false, openTime: "08:00", closeTime: "22:00" },
    { day: "Thứ 5", isClosed: false, openTime: "08:00", closeTime: "22:00" },
    { day: "Thứ 6", isClosed: false, openTime: "08:00", closeTime: "22:00" },
    { day: "Thứ 7", isClosed: false, openTime: "08:00", closeTime: "23:00" },
    { day: "Chủ nhật", isClosed: false, openTime: "08:00", closeTime: "23:00" }
];

const serviceTypes = [
    "Nhà hàng",
    "Quán ăn",
    "Quán cà phê",
    "Trà sữa",
    "Quán bar",
    "Karaoke",
    "Rạp chiếu phim",
    "Khu vui chơi",
    "Sân thể thao",
    "Khác"
];

const initialServices = [
    {
        id: 1,
        name: "Đặt bàn",
        billingType: "slot",
        requiresResource: true,
        resources: [
            { id: 1, name: "Bàn thường", capacity: 4 },
            { id: 2, name: "Bàn VIP", capacity: 8 }
        ]
    }
];

const initialProfile = {
    businessName: "",
    address: "",
    addressLink: "",
    latitude: "",
    longitude: "",
    phoneNumber: "",
    email: "",
    introduce: ""
};

function InfoBusinesses() {
    // =========================
    // TRẠNG THÁI CHỈNH SỬA
    // =========================

    const [editing, setEditing] = useState({});
    const [saved, setSaved] = useState({});

    const startEdit = (section) => {
        setEditing(prev => ({ ...prev, [section]: true }));
    };

    const cancelEdit = (section, restoreData) => {
        restoreData?.();
        setEditing(prev => ({ ...prev, [section]: false }));
    };

    // Lưu riêng từng mục.
    // Hiện tại lưu dữ liệu ở frontend; cần kết nối API để lưu vào database.
    const saveSection = (section, data) => {
        console.log(`Dữ liệu mục ${section}:`, data);

        setSaved(prev => ({ ...prev, [section]: true }));
        setEditing(prev => ({ ...prev, [section]: false }));

        alert("Đã lưu thay đổi mục này!");
    };

    const renderSectionActions = (section) => {
        if (editing[section]) return null;

        return (
            <div className="section-header-actions">
                {saved[section] && (
                    <span className="section-saved">
                        <FaCheck /> Đã lưu
                    </span>
                )}

                <button
                    type="button"
                    className="section-edit-btn"
                    onClick={() => startEdit(section)}
                >
                    <FaEdit /> Chỉnh sửa
                </button>
            </div>
        );
    };

    // =========================
    // 1. THÔNG TIN CƠ BẢN
    // =========================

    const [profile, setProfile] = useState(initialProfile);
    const [originalProfile, setOriginalProfile] = useState(initialProfile);

    const updateProfile = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const saveProfile = () => {
        setOriginalProfile({ ...profile });
        saveSection("profile", profile);
    };

    const cancelProfile = () => {
        setProfile({ ...originalProfile });
        cancelEdit("profile");
    };

    // =========================
    // 2. ẢNH ĐẠI DIỆN
    // =========================

    const [avatar, setAvatar] = useState(null);
    const [originalAvatar, setOriginalAvatar] = useState(null);

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Vui lòng chọn file hình ảnh!");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Ảnh không được vượt quá 5MB!");
            e.target.value = "";
            return;
        }

        setAvatar({
            file,
            preview: URL.createObjectURL(file)
        });

        e.target.value = "";
    };

    const removeAvatar = () => {
        setAvatar(null);
    };

    const saveAvatar = () => {
        setOriginalAvatar(avatar);
        saveSection("avatar", avatar?.file || null);
    };

    const cancelAvatar = () => {
        setAvatar(originalAvatar);
        cancelEdit("avatar");
    };

    // =========================
    // 3. THƯ VIỆN ẢNH
    // =========================

    const [gallery, setGallery] = useState([]);
    const [originalGallery, setOriginalGallery] = useState([]);

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files || []);

        const validFiles = files.filter(file =>
            file.type.startsWith("image/") &&
            file.size <= 5 * 1024 * 1024
        );

        if (validFiles.length !== files.length) {
            alert("Một số ảnh không hợp lệ hoặc vượt quá 5MB!");
        }

        const newImages = validFiles.map(file => ({
            id: `${file.name}-${file.lastModified}-${Math.random()}`,
            file,
            preview: URL.createObjectURL(file)
        }));

        setGallery(prev => [...prev, ...newImages]);
        e.target.value = "";
    };

    const removeGalleryImage = (id) => {
        setGallery(prev =>
            prev.filter(item => item.id !== id)
        );
    };

    const saveGallery = () => {
        setOriginalGallery([...gallery]);

        saveSection(
            "gallery",
            gallery.map(item => item.file)
        );
    };

    const cancelGallery = () => {
        setGallery([...originalGallery]);
        cancelEdit("gallery");
    };

    // =========================
    // 4. GIỜ HOẠT ĐỘNG
    // =========================

    const [hours, setHours] = useState(initialHours);
    const [originalHours, setOriginalHours] = useState(initialHours);

    const updateHour = (index, field, value) => {
        setHours(prev =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };

    const saveHours = () => {
        setOriginalHours(hours);
        saveSection("hours", hours);
    };

    const cancelHours = () => {
        setHours(originalHours);
        cancelEdit("hours");
    };

    // =========================
    // 5. LOẠI HÌNH KINH DOANH
    // =========================

    const [selectedTypes, setSelectedTypes] = useState([]);
    const [otherType, setOtherType] = useState("");

    const [originalTypes, setOriginalTypes] = useState([]);
    const [originalOtherType, setOriginalOtherType] = useState("");

    const toggleType = (type) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(item => item !== type)
                : [...prev, type]
        );
    };

    const saveTypes = () => {
        const data = [
            ...selectedTypes.filter(item => item !== "Khác"),
            ...(selectedTypes.includes("Khác") && otherType.trim()
                ? [otherType.trim()]
                : [])
        ];

        setOriginalTypes([...selectedTypes]);
        setOriginalOtherType(otherType);

        saveSection("types", data);
    };

    const cancelTypes = () => {
        setSelectedTypes([...originalTypes]);
        setOtherType(originalOtherType);
        cancelEdit("types");
    };

    // =========================
    // 6. DỊCH VỤ VÀ TÀI NGUYÊN
    // =========================

    const [services, setServices] = useState(initialServices);
    const [originalServices, setOriginalServices] = useState(initialServices);

    const [serviceForm, setServiceForm] = useState({
        name: "",
        billingType: "slot",
        requiresResource: true
    });

    const [resourceForms, setResourceForms] = useState({});
    const [activeServiceId, setActiveServiceId] = useState(null);

    const addService = () => {
        if (!serviceForm.name.trim()) {
            alert("Vui lòng nhập tên dịch vụ!");
            return;
        }

        const newService = {
            id: Date.now(),
            ...serviceForm,
            resources: []
        };

        setServices(prev => [...prev, newService]);

        setServiceForm({
            name: "",
            billingType: "slot",
            requiresResource: true
        });
    };

    const deleteService = (serviceId) => {
        setServices(prev =>
            prev.filter(item => item.id !== serviceId)
        );

        if (activeServiceId === serviceId) {
            setActiveServiceId(null);
        }
    };

    const updateResourceForm = (serviceId, field, value) => {
        setResourceForms(prev => ({
            ...prev,
            [serviceId]: {
                name: "",
                capacity: "",
                ...prev[serviceId],
                [field]: value
            }
        }));
    };

    const addResource = (serviceId) => {
        const form = resourceForms[serviceId] || {};

        if (!form.name?.trim()) {
            alert("Vui lòng nhập tên bàn, phòng hoặc sân!");
            return;
        }

        setServices(prev =>
            prev.map(service => {
                if (service.id !== serviceId) return service;

                return {
                    ...service,
                    resources: [
                        ...service.resources,
                        {
                            id: Date.now(),
                            name: form.name.trim(),
                            capacity: Number(form.capacity) || null
                        }
                    ]
                };
            })
        );

        setResourceForms(prev => ({
            ...prev,
            [serviceId]: { name: "", capacity: "" }
        }));
    };

    const deleteResource = (serviceId, resourceId) => {
        setServices(prev =>
            prev.map(service => {
                if (service.id !== serviceId) return service;

                return {
                    ...service,
                    resources: service.resources.filter(
                        item => item.id !== resourceId
                    )
                };
            })
        );
    };

    const saveServices = () => {
        setOriginalServices(
            services.map(service => ({
                ...service,
                resources: [...service.resources]
            }))
        );

        saveSection("services", services);
    };

    const cancelServices = () => {
        setServices(
            originalServices.map(service => ({
                ...service,
                resources: [...service.resources]
            }))
        );

        setServiceForm({
            name: "",
            billingType: "slot",
            requiresResource: true
        });

        setActiveServiceId(null);
        cancelEdit("services");
    };


    return (
        <div className="info-businesses">

            {/* HEADER */}
            <div className="info-businesses-header">
                <div>
                    <h1>Thông tin quán</h1>
                    <p>
                        Quản lý và cập nhật thông tin hoạt động của quán.
                    </p>
                </div>
            </div>

            <div className="info-businesses-content">

                {/* 1. THÔNG TIN CƠ BẢN */}
                <section className="info-section">
                    <div className="info-section-title">
                        <FaStore />
                        <div>
                            <h3>Thông tin cơ bản</h3>
                            <p>Thông tin liên hệ và giới thiệu về quán.</p>
                        </div>

                        {renderSectionActions("profile")}
                    </div>

                    <div className="profile-fields">
                        <div className="form-group">
                            <label>Tên quán</label>
                            {editing.profile ? (
                                <input
                                    value={profile.businessName}
                                    onChange={e =>
                                        updateProfile("businessName", e.target.value)
                                    }
                                    placeholder="Nhập tên quán..."
                                />
                            ) : (
                                <p>{profile.businessName || "Chưa cập nhật"}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Số điện thoại</label>
                            {editing.profile ? (
                                <input
                                    value={profile.phoneNumber}
                                    onChange={e =>
                                        updateProfile("phoneNumber", e.target.value)
                                    }
                                    placeholder="Nhập số điện thoại..."
                                />
                            ) : (
                                <p>{profile.phoneNumber || "Chưa cập nhật"}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            {editing.profile ? (
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={e =>
                                        updateProfile("email", e.target.value)
                                    }
                                    placeholder="Nhập email..."
                                />
                            ) : (
                                <p>{profile.email || "Chưa cập nhật"}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Địa chỉ</label>
                            {editing.profile ? (
                                <input
                                    value={profile.address}
                                    onChange={e =>
                                        updateProfile("address", e.target.value)
                                    }
                                    placeholder="Nhập địa chỉ..."
                                />
                            ) : (
                                <p>{profile.address || "Chưa cập nhật"}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Đường dẫn Google Maps</label>
                            {editing.profile ? (
                                <input
                                    value={profile.addressLink}
                                    onChange={e =>
                                        updateProfile("addressLink", e.target.value)
                                    }
                                    placeholder="Dán đường dẫn Google Maps..."
                                />
                            ) : (
                                <p>{profile.addressLink || "Chưa cập nhật"}</p>
                            )}
                        </div>

                        <div className="profile-coordinates">
                            <div className="form-group">
                                <label>Vĩ độ</label>
                                {editing.profile ? (
                                    <input
                                        value={profile.latitude}
                                        onChange={e =>
                                            updateProfile("latitude", e.target.value)
                                        }
                                        placeholder="Vĩ độ"
                                    />
                                ) : (
                                    <p>{profile.latitude || "Chưa cập nhật"}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Kinh độ</label>
                                {editing.profile ? (
                                    <input
                                        value={profile.longitude}
                                        onChange={e =>
                                            updateProfile("longitude", e.target.value)
                                        }
                                        placeholder="Kinh độ"
                                    />
                                ) : (
                                    <p>{profile.longitude || "Chưa cập nhật"}</p>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Giới thiệu về quán</label>
                            {editing.profile ? (
                                <textarea
                                    rows={4}
                                    value={profile.introduce}
                                    onChange={e =>
                                        updateProfile("introduce", e.target.value)
                                    }
                                    placeholder="Giới thiệu về quán..."
                                />
                            ) : (
                                <p>{profile.introduce || "Chưa cập nhật"}</p>
                            )}
                        </div>
                    </div>

                    {editing.profile && (
                        <div className="section-actions">
                            <button
                                type="button"
                                className="section-cancel-btn"
                                onClick={cancelProfile}
                            >
                                <FaTimes /> Hủy
                            </button>
                            <button
                                type="button"
                                className="section-save-btn"
                                onClick={saveProfile}
                            >
                                <FaSave /> Lưu thông tin
                            </button>
                        </div>
                    )}
                </section>

                {/* 2. ẢNH ĐẠI DIỆN */}
                <section className="info-section">
                    <div className="info-section-title">
                        <FaCamera />
                        <div>
                            <h3>Ảnh đại diện quán</h3>
                            <p>Ảnh hiển thị trên thẻ quán và trang chi tiết.</p>
                        </div>

                        {renderSectionActions("avatar")}
                    </div>

                    <div className="business-avatar-upload">
                        <div className="business-avatar-preview">
                            {avatar ? (
                                <img src={avatar.preview} alt="Ảnh đại diện" />
                            ) : (
                                <FaStore />
                            )}
                        </div>

                        {editing.avatar && (
                            <div className="avatar-upload-content">
                                <label className="upload-btn">
                                    <FaCamera /> Chọn ảnh đại diện
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={handleAvatarChange}
                                    />
                                </label>

                                {avatar && (
                                    <button
                                        type="button"
                                        className="remove-avatar-btn"
                                        onClick={removeAvatar}
                                    >
                                        <FaTrash /> Xóa ảnh
                                    </button>
                                )}

                                <p>Ảnh vuông, tối đa 5MB.</p>
                            </div>
                        )}
                    </div>

                    <div className="business-card-preview">
                        <span>Xem trước thẻ quán</span>
                        <div className="business-card-image">
                            {avatar ? (
                                <img src={avatar.preview} alt="Thẻ quán" />
                            ) : (
                                <FaStore />
                            )}
                        </div>
                        <strong>{profile.businessName || "Tên quán của bạn"}</strong>
                        <small>Ảnh đại diện hiển thị trên thẻ quán</small>
                    </div>

                    {editing.avatar && (
                        <div className="section-actions">
                            <button
                                type="button"
                                className="section-cancel-btn"
                                onClick={cancelAvatar}
                            >
                                <FaTimes /> Hủy
                            </button>
                            <button
                                type="button"
                                className="section-save-btn"
                                onClick={saveAvatar}
                            >
                                <FaSave /> Lưu ảnh đại diện
                            </button>
                        </div>
                    )}
                </section>

                {/* 3. THƯ VIỆN ẢNH */}
                <section className="info-section">
                    <div className="info-section-title">
                        <FaImage />
                        <div>
                            <h3>Hình ảnh về quán</h3>
                        </div>

                        {renderSectionActions("gallery")}
                    </div>

                    <div className="business-gallery">
                        {gallery.map(image => (
                            <div className="gallery-item" key={image.id}>
                                <img src={image.preview} alt="Ảnh quán" />

                                {editing.gallery && (
                                    <button
                                        type="button"
                                        onClick={() => removeGalleryImage(image.id)}
                                        title="Xóa ảnh"
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        ))}

                        {editing.gallery && (
                            <label className="gallery-add">
                                <FaPlus />
                                <span>Thêm ảnh</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    hidden
                                    onChange={handleGalleryChange}
                                />
                            </label>
                        )}

                        {gallery.length === 0 && !editing.gallery && (
                            <p>Chưa có hình ảnh về quán.</p>
                        )}
                    </div>

                    {editing.gallery && (
                        <div className="section-actions">
                            <button
                                type="button"
                                className="section-cancel-btn"
                                onClick={cancelGallery}
                            >
                                <FaTimes /> Hủy
                            </button>
                            <button
                                type="button"
                                className="section-save-btn"
                                onClick={saveGallery}
                            >
                                <FaSave /> Lưu thư viện ảnh
                            </button>
                        </div>
                    )}
                </section>

                {/* 4. GIỜ HOẠT ĐỘNG */}
                <section className="info-section">
                    <div className="info-section-title">
                        <FaClock />
                        <div>
                            <h3>Giờ hoạt động</h3>
                            <p>Thiết lập giờ mở cửa và đóng cửa theo từng ngày.</p>
                        </div>

                        {renderSectionActions("hours")}
                    </div>

                    <div className="business-hours">
                        {hours.map((item, index) => (
                            <div className="business-hour-row" key={item.day}>
                                <strong className="business-day">
                                    {item.day}
                                </strong>

                                {editing.hours ? (
                                    <>
                                        <label className="business-open-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={!item.isClosed}
                                                onChange={e =>
                                                    updateHour(
                                                        index,
                                                        "isClosed",
                                                        !e.target.checked
                                                    )
                                                }
                                            />
                                            Mở cửa
                                        </label>

                                        {item.isClosed ? (
                                            <span className="closed-label">
                                                Đóng cửa cả ngày
                                            </span>
                                        ) : (
                                            <div className="business-time-inputs">
                                                <input
                                                    type="time"
                                                    value={item.openTime}
                                                    onChange={e =>
                                                        updateHour(
                                                            index,
                                                            "openTime",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <span>đến</span>
                                                <input
                                                    type="time"
                                                    value={item.closeTime}
                                                    onChange={e =>
                                                        updateHour(
                                                            index,
                                                            "closeTime",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <span>
                                        {item.isClosed
                                            ? "Đóng cửa cả ngày"
                                            : `${item.openTime} - ${item.closeTime}`}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {editing.hours && (
                        <div className="section-actions">
                            <button
                                type="button"
                                className="section-cancel-btn"
                                onClick={cancelHours}
                            >
                                <FaTimes /> Hủy
                            </button>
                            <button
                                type="button"
                                className="section-save-btn"
                                onClick={saveHours}
                            >
                                <FaSave /> Lưu giờ hoạt động
                            </button>
                        </div>
                    )}
                </section>

                {/* 5. LOẠI HÌNH KINH DOANH */}
                <section className="info-section">
                    <div className="info-section-title">
                        <FaStore />
                        <div>
                            <h3>Loại hình kinh doanh</h3>
                            <p>Chọn loại hình phù hợp với hoạt động của quán.</p>
                        </div>

                        {renderSectionActions("types")}
                    </div>

                    <div className="business-types">
                        {serviceTypes.map(type => (
                            <label className="business-type-item" key={type}>
                                <input
                                    type="checkbox"
                                    checked={selectedTypes.includes(type)}
                                    disabled={!editing.types}
                                    onChange={() => toggleType(type)}
                                />
                                {type}
                            </label>
                        ))}
                    </div>

                    {editing.types && selectedTypes.includes("Khác") && (
                        <div className="other-type-wrapper">
                            <label>Nhập loại hình khác</label>
                            <input
                                className="other-type-input"
                                placeholder="Ví dụ: Tiệm bánh..."
                                value={otherType}
                                onChange={e => setOtherType(e.target.value)}
                            />
                        </div>
                    )}

                    {!editing.types && selectedTypes.includes("Khác") && (
                        <p>Loại hình khác: {otherType || "Chưa nhập"}</p>
                    )}

                    {editing.types && (
                        <div className="section-actions">
                            <button
                                type="button"
                                className="section-cancel-btn"
                                onClick={cancelTypes}
                            >
                                <FaTimes /> Hủy
                            </button>
                            <button
                                type="button"
                                className="section-save-btn"
                                onClick={saveTypes}
                            >
                                <FaSave /> Lưu loại hình
                            </button>
                        </div>
                    )}
                </section>

                {/* 6. DỊCH VỤ VÀ TÀI NGUYÊN */}
                <section className="info-section">
                    <div className="info-section-title">
                        <FaStore />
                        <div>
                            <h3>Dịch vụ và tài nguyên</h3>
                            <p>
                                Quản lý dịch vụ đặt bàn, đặt phòng, đặt sân và
                                tài nguyên đi kèm.
                            </p>
                        </div>

                        {renderSectionActions("services")}
                    </div>

                    {editing.services && (
                        <div className="service-create-form">
                            <div className="service-form-row">
                                <div className="form-group">
                                    <label>Tên dịch vụ</label>
                                    <input
                                        placeholder="Ví dụ: Đặt bàn, Đặt phòng..."
                                        value={serviceForm.name}
                                        onChange={e =>
                                            setServiceForm(prev => ({
                                                ...prev,
                                                name: e.target.value
                                            }))
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Hình thức tính phí</label>
                                    <select
                                        value={serviceForm.billingType}
                                        onChange={e =>
                                            setServiceForm(prev => ({
                                                ...prev,
                                                billingType: e.target.value
                                            }))
                                        }
                                    >
                                        <option value="slot">Theo lượt / khung giờ</option>
                                        <option value="hourly">Theo giờ</option>
                                        <option value="ticket">Vé / không cần tài nguyên</option>
                                    </select>
                                </div>
                            </div>

                            <label className="service-resource-checkbox">
                                <input
                                    type="checkbox"
                                    checked={serviceForm.requiresResource}
                                    onChange={e =>
                                        setServiceForm(prev => ({
                                            ...prev,
                                            requiresResource: e.target.checked
                                        }))
                                    }
                                />
                                Dịch vụ cần bàn, phòng, sân hoặc tài nguyên cụ thể
                            </label>

                            <button
                                type="button"
                                className="service-add-btn"
                                onClick={addService}
                            >
                                <FaPlus /> Thêm dịch vụ
                            </button>
                        </div>
                    )}

                    <div className="business-services-list">
                        {services.length === 0 ? (
                            <div className="empty-services">
                                Chưa có dịch vụ nào.
                            </div>
                        ) : (
                            services.map(service => (
                                <div
                                    className="business-service-card"
                                    key={service.id}
                                >
                                    <div className="business-service-header">
                                        <div className="service-info">
                                            <strong>{service.name}</strong>
                                            <small>
                                                {service.billingType === "hourly"
                                                    ? "Tính theo giờ"
                                                    : service.billingType === "ticket"
                                                        ? "Dịch vụ vé"
                                                        : "Theo lượt / khung giờ"}
                                            </small>
                                        </div>

                                        {editing.services && (
                                            <div className="service-actions">
                                                {service.requiresResource && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setActiveServiceId(
                                                                activeServiceId === service.id
                                                                    ? null
                                                                    : service.id
                                                            )
                                                        }
                                                    >
                                                        <FaEdit /> Quản lý tài nguyên
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        deleteService(service.id)
                                                    }
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {service.requiresResource && (
                                        <div className="service-resources">
                                            <div className="resource-tags">
                                                {service.resources.map(resource => (
                                                    <span
                                                        className="resource-tag"
                                                        key={resource.id}
                                                    >
                                                        {resource.name}
                                                        {resource.capacity
                                                            ? ` (${resource.capacity} người)`
                                                            : ""}

                                                        {editing.services && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deleteResource(
                                                                        service.id,
                                                                        resource.id
                                                                    )
                                                                }
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        )}
                                                    </span>
                                                ))}

                                                {service.resources.length === 0 && (
                                                    <small>
                                                        Chưa có bàn, phòng hoặc tài nguyên.
                                                    </small>
                                                )}
                                            </div>

                                            {editing.services &&
                                                activeServiceId === service.id && (
                                                    <div className="resource-create-form">
                                                        <input
                                                            placeholder="Tên bàn / phòng / sân..."
                                                            value={
                                                                resourceForms[service.id]?.name || ""
                                                            }
                                                            onChange={e =>
                                                                updateResourceForm(
                                                                    service.id,
                                                                    "name",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />

                                                        <input
                                                            type="number"
                                                            min="1"
                                                            placeholder="Sức chứa"
                                                            value={
                                                                resourceForms[service.id]?.capacity || ""
                                                            }
                                                            onChange={e =>
                                                                updateResourceForm(
                                                                    service.id,
                                                                    "capacity",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                addResource(service.id)
                                                            }
                                                        >
                                                            <FaPlus /> Thêm
                                                        </button>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {editing.services && (
                        <div className="section-actions">
                            <button
                                type="button"
                                className="section-cancel-btn"
                                onClick={cancelServices}
                            >
                                <FaTimes /> Hủy
                            </button>
                            <button
                                type="button"
                                className="section-save-btn"
                                onClick={saveServices}
                            >
                                <FaSave /> Lưu dịch vụ và tài nguyên
                            </button>
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}

export default InfoBusinesses;
