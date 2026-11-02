
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import BranchGallery from "../../../../components/branch-gallery/BranchGallery";
import BranchImageModal from "../../../../components/branch-img-modal/BranchImgModal";
import DinnerSet from "../../../../components/businesses-service/dinner-set/DinnerSet";

import businessApi from "../../../../api/businessApi";

import {
    FaMapMarkerAlt,
    FaRegClock,
    FaPhone,
    FaEnvelope,
    FaExternalLinkAlt
} from "react-icons/fa";

import "./introduce.css";

function Introduce() {
    const { businessId } = useParams();

    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showAllImages, setShowAllImages] = useState(false);
    const [showDinnerSet, setShowDinnerSet] = useState(false);

    // Lấy thông tin quán từ database
    useEffect(() => {
        let isMounted = true;

        const fetchBusiness = async () => {
            if (!businessId) {
                setError("Không tìm thấy ID quán.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response =
                    await businessApi.getBusinessDetail(businessId);

                console.log("Thông tin quán:", response.data);

                const result = response.data?.data;

                const businessData = Array.isArray(result)
                    ? result[0]
                    : result?.business || result;

                if (!isMounted) return;

                setBusiness(businessData || null);

            } catch (err) {
                console.error("Lỗi lấy thông tin quán:", err);

                if (isMounted) {
                    setError(
                        err.response?.data?.message ||
                        "Không thể tải thông tin quán."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchBusiness();

        return () => {
            isMounted = false;
        };
    }, [businessId]);

    // Trạng thái tải
    if (loading) {
        return (
            <div className="introduce-container">
                Đang tải thông tin quán...
            </div>
        );
    }

    // Trạng thái lỗi
    if (error || !business) {
        return (
            <div className="introduce-container">
                {error || "Không tìm thấy thông tin quán."}
            </div>
        );
    }

    // ==============================
    // THÔNG TIN QUÁN
    // ==============================

    const businessName =
        business.businessName || "Chưa cập nhật";

    const address =
        business.address || "Chưa cập nhật địa chỉ";

    const phone =
        business.phone || "Chưa cập nhật số điện thoại";

    const email =
        business.email || "Chưa cập nhật email";

    const introduce =
        business.introduce || "Quán chưa có nội dung giới thiệu.";

    const openStatus =
        business.openStatus || "Chưa cập nhật";

    // Chuyển tọa độ từ string sang number
    const latitude = Number(business.latitude);
    const longitude = Number(business.longitude);

    // Kiểm tra tọa độ hợp lệ
    const hasCoordinates =
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180 &&
        !(latitude === 0 && longitude === 0);

    // Chuẩn hóa addressLink
    // Hỗ trợ cả URL thuần và URL bị lưu dưới dạng Markdown
    const rawAddressLink = business.addressLink || "";

    const addressLink = rawAddressLink.match(
        /https?:\/\/[^\s\])]+/
    )?.[0] || "";

    // ==============================
    // HÌNH ẢNH QUÁN
    // ==============================

    const images = Array.isArray(business.images)
        ? business.images
            .map((image, index) => ({
                id: image.imageId || image.id || index,
                imageUrl: image.imageUrl || image.image
            }))
            .filter((image) => image.imageUrl)
        : [];

    // ==============================
    // MỞ GOOGLE MAPS
    // ==============================

    const handleGetDirections = () => {
        if (addressLink) {
            window.open(
                addressLink,
                "_blank",
                "noopener,noreferrer"
            );
            return;
        }

        if (hasCoordinates) {
            const mapUrl =
                `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

            window.open(
                mapUrl,
                "_blank",
                "noopener,noreferrer"
            );
            return;
        }

        if (address && address !== "Chưa cập nhật địa chỉ") {
            const mapUrl =
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

            window.open(
                mapUrl,
                "_blank",
                "noopener,noreferrer"
            );
            return;
        }

        alert("Quán chưa cập nhật vị trí.");
    };

    return (
        <div className="introduce-container">

            <div className="introduce-info-branch">

                <h2 className="introduce-title">
                    Thông tin quán
                </h2>

                {/* Địa chỉ */}
                <span className="introduce-title-item">
                    <FaMapMarkerAlt className="introduce-icon" />
                    Địa chỉ
                </span>

                <span className="introduce-item">
                    {address}
                </span>

                {/* Số điện thoại */}
                <span className="introduce-title-item">
                    <FaPhone className="introduce-icon" />
                    Số điện thoại
                </span>

                <span className="introduce-item">
                    {phone}
                </span>

                {/* Email */}
                <span className="introduce-title-item">
                    <FaEnvelope className="introduce-icon" />
                    Email
                </span>

                <span className="introduce-item">
                    {email}
                </span>

                {/* Trạng thái hoạt động */}
                <span className="introduce-title-item">
                    <FaRegClock className="introduce-icon" />
                    Trạng thái hoạt động
                </span>

                <span className="introduce-item">
                    {openStatus}
                </span>

                {/* Giới thiệu */}
                <h2 className="introduce-title">
                    Giới thiệu
                </h2>

                <span className="introduce-item">
                    {introduce}
                </span>

                {/* Hình ảnh quán */}
                <div className="introduce-img-container">

                    <h2 className="introduce-title">
                        Một số hình ảnh
                    </h2>

                    {images.length > 5 && (
                        <button
                            type="button"
                            className="show-more-images"
                            onClick={() => setShowAllImages(true)}
                        >
                            Xem thêm
                        </button>
                    )}

                </div>

                {images.length > 0 ? (
                    <BranchGallery images={images} />
                ) : (
                    <span className="introduce-item">
                        Quán chưa cập nhật hình ảnh.
                    </span>
                )}

                {/* Modal xem tất cả ảnh */}
                {showAllImages && (
                    <BranchImageModal
                        images={images}
                        onClose={() => setShowAllImages(false)}
                    />
                )}

            </div>

            

            <div className="introduce-info-branch">

                {/* Đánh giá */}
                <div>

                    <h2 className="introduce-title">
                        Điểm đánh giá
                    </h2>

                    <div className="introduce-rating-container">

                        <h1>
                            {Number(
                                business.averageRating || 0
                            ).toFixed(1)}
                        </h1>

                        <div className="introduce-info-rating">

                            <span>sao</span>

                            <span>
                                {business.totalReviews || 0} lượt đánh giá
                            </span>

                        </div>

                    </div>

                </div>

            </div>

            {/* =================================
                MODAL ĐẶT CHỖ
            ================================== */}

            {showDinnerSet && (
                <DinnerSet
                    businessId={businessId}
                    onClose={() => setShowDinnerSet(false)}
                />
            )}

        </div>
    );
}

export default Introduce;
