
import { useEffect, useRef, useState } from "react";
import {
    FaEllipsisV,
    FaHeart,
    FaStar,
    FaMapMarkerAlt
} from "react-icons/fa";

import favoriteApi from "../../../api/favoriteApi";
import "./favorite.css";

function Favorite() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState(null);

    // Ref theo dõi khu vực menu
    const menuRef = useRef(null);

    // Lấy danh sách quán yêu thích
    const fetchFavorites = async () => {
        try {
            const res = await favoriteApi.getFavorites();
            setFavorites(res.data.data || []);
        } catch (error) {
            console.error("Lỗi lấy danh sách yêu thích:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    // Đóng menu khi click bên ngoài menu đang mở
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    // Mở / đóng menu ba chấm
    const handleToggleMenu = (favoriteId) => {
        setOpenMenuId(prev =>
            prev === favoriteId ? null : favoriteId
        );
    };

    // Bỏ yêu thích
    const handleRemove = async (businessId) => {
        try {
            await favoriteApi.removeFavorite(businessId);

            setFavorites(prev =>
                prev.filter(
                    item =>
                        Number(item.businessId) !== Number(businessId)
                )
            );

            setOpenMenuId(null);
        } catch (error) {
            console.error("Lỗi bỏ yêu thích:", error);
            alert("Không thể bỏ yêu thích. Vui lòng thử lại.");
        }
    };

    if (loading) {
        return (
            <div className="favorite-loading">
                Đang tải danh sách yêu thích...
            </div>
        );
    }

    return (
        <div className="favorite-page">

            <div className="favorite-header">
                <div>
                    <h2>Quán yêu thích của tôi</h2>
                </div>
            </div>

            {favorites.length === 0 ? (
                <div className="favorite-empty">
                    <FaHeart />
                    <h3>Chưa có địa điểm yêu thích</h3>
                    <p>
                        Hãy khám phá và lưu lại những quán ăn,
                        địa điểm giải trí mà bạn yêu thích nhé!
                    </p>
                </div>
            ) : (
                <div className="favorite-list">

                    {favorites.map(item => (
                        <div
                            className="favorite-card"
                            key={item.favoriteId}
                        >
                            {/* Ảnh quán */}
                            <div className="favorite-card-image">
                                <img
                                    src={
                                        item.imageBusiness ||
                                        "/images/default-business.png"
                                    }
                                    alt={item.businessName}
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src =
                                            "/images/default-business.png";
                                    }}
                                />
                            </div>

                            {/* Thông tin quán */}
                            <div className="favorite-card-info">

                                <h3>{item.businessName}</h3>

                                <div className="favorite-card-address">
                                    <FaMapMarkerAlt />
                                    <span>
                                        {item.address ||
                                            "Chưa cập nhật địa chỉ"}
                                    </span>
                                </div>

                                <div className="favorite-card-details">

                                    <span className="favorite-type">
                                        {item.businessType ||
                                            "Chưa cập nhật"}
                                    </span>

                                    <span className="favorite-rating">
                                        <FaStar />
                                        {item.rating ?? "Chưa có đánh giá"}
                                    </span>

                                </div>
                            </div>

                            {/* Menu ba chấm */}
                            <div
                                className="favorite-card-menu"
                                ref={
                                    openMenuId === item.favoriteId
                                        ? menuRef
                                        : null
                                }
                            >

                                <button
                                    type="button"
                                    className="favorite-menu-btn"
                                    onClick={() =>
                                        handleToggleMenu(item.favoriteId)
                                    }
                                    title="Tùy chọn"
                                    aria-label="Tùy chọn quán"
                                    aria-expanded={
                                        openMenuId === item.favoriteId
                                    }
                                >
                                    <FaEllipsisV />
                                </button>

                                {openMenuId === item.favoriteId && (
                                    <div className="favorite-dropdown">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemove(item.businessId)
                                            }
                                        >
                                            <FaHeart />
                                            Bỏ thích
                                        </button>

                                    </div>
                                )}
                            </div>

                        </div>
                    ))}

                </div>
            )}
        </div>
    );
}

export default Favorite;
