
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import dishApi from "../../../api/dishApi";
import CardMenu from "../../../components/card-menu/CardMenu";
import DishForm from "../../../components/manage-menu/dish-form/DishForm";
import PromotionForm from "../../../components/manage-menu/promotion-form/PromotionForm";
import PromotionList from "../../../components/manage-menu/promotion-list/PromotionList";

import "./manageMenu.css";

const initialPromotions = [
    {
        id: 1,
        name: "Ưu đãi cuối tuần",
        type: "percent",
        value: 10,
        scope: "selected",
        dishIds: [1, 4],
        startDate: "2026-10-01",
        endDate: "2026-12-31",
        description: "Giảm giá 10% cho các món được chọn.",
        active: true,
    },
];

function ManageMenu() {
    // Lấy ID quán từ URL
    const { id: businessId } = useParams();

    // Dữ liệu món ăn
    const [dishes, setDishes] = useState([]);
    const [loadingDishes, setLoadingDishes] = useState(false);
    const [error, setError] = useState("");

    // Dữ liệu khuyến mãi
    const [promotions, setPromotions] = useState(initialPromotions);

    // Bộ lọc và tìm kiếm
    const [activeTab, setActiveTab] = useState("dishes");
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Form món ăn
    const [showDishForm, setShowDishForm] = useState(false);
    const [editingDish, setEditingDish] = useState(null);

    // Form khuyến mãi
    const [showPromotionForm, setShowPromotionForm] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);

    // Chọn món áp dụng khuyến mãi
    const [selectingPromotionDishes, setSelectingPromotionDishes] =
        useState(false);
    const [selectedDishIds, setSelectedDishIds] = useState([]);

    // ========================================
    // LẤY DANH SÁCH MÓN ĂN THEO BUSINESS ID
    // ========================================

    const fetchDishes = async () => {
        if (!businessId) {
            setError("Không tìm thấy thông tin quán.");
            setDishes([]);
            return;
        }

        try {
            setLoadingDishes(true);
            setError("");

            const response = await dishApi.getDishesByBusinessId(businessId);

            const data = response.data.data || [];

            const formattedDishes = data.map((dish) => ({
                ...dish,
                id: dish.dishId,
                name: dish.dishName,
                description: dish.description || "",
                category: dish.categoryName || "Chưa phân loại",
                image: dish.image || "",
                price: Number(dish.price),
                active: dish.status === "available",
                isNew: false,
            }));

            setDishes(formattedDishes);
        } catch (error) {
            console.error("Lỗi lấy danh sách món ăn:", error);

            setError(
                error.response?.data?.message ||
                "Không thể tải danh sách món ăn."
            );
        } finally {
            setLoadingDishes(false);
        }
    };

    // Tự động gọi API khi businessId thay đổi
    useEffect(() => {
        fetchDishes();
    }, [businessId]);

    // ========================================
    // DANH MỤC MÓN ĂN
    // ========================================

    const categories = useMemo(
        () => [...new Set(dishes.map((dish) => dish.category))],
        [dishes]
    );

    // ========================================
    // LỌC VÀ TÌM KIẾM MÓN ĂN
    // ========================================

    const filteredDishes = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return dishes.filter((dish) => {
            const matchesSearch =
                dish.name.toLowerCase().includes(keyword) ||
                dish.description.toLowerCase().includes(keyword);

            const matchesCategory =
                categoryFilter === "all" ||
                dish.category === categoryFilter;

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && dish.active) ||
                (statusFilter === "inactive" && !dish.active);

            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );
        });
    }, [dishes, search, categoryFilter, statusFilter]);

    // ========================================
    // XỬ LÝ KHUYẾN MÃI
    // ========================================

    const getCurrentDate = () => {
        const today = new Date();

        return [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0"),
        ].join("-");
    };

    const getApplicablePromotion = (dish) => {
        const today = getCurrentDate();

        return promotions.find((promotion) => {
            const appliesToDish =
                promotion.scope === "all" ||
                promotion.dishIds.includes(dish.id);

            return (
                promotion.active &&
                promotion.startDate <= today &&
                promotion.endDate >= today &&
                appliesToDish
            );
        });
    };

    const getDiscountPrice = (dish, promotion) => {
        if (!promotion) return undefined;

        const discount =
            promotion.type === "percent"
                ? dish.price * (promotion.value / 100)
                : promotion.value;

        return Math.max(0, Math.round(dish.price - discount));
    };

    // ========================================
    // THÊM VÀ CẬP NHẬT MÓN ĂN
    // ========================================

    const openAddDish = () => {
        setEditingDish(null);
        setShowDishForm(true);
    };

    const openEditDish = (dish) => {
        setEditingDish(dish);
        setShowDishForm(true);
    };

    // Sau khi thêm món thành công, tải lại dữ liệu từ database
    const saveDish = async () => {
        await fetchDishes();
        setShowDishForm(false);
        setEditingDish(null);
    };

    // ========================================
    // XÓA MÓN ĂN
    // ========================================

    const deleteDish = (dishId) => {
        const dish = dishes.find((item) => item.id === dishId);

        if (!dish) return;

        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa món "${dish.name}" không?`
        );

        if (!confirmed) return;

        // Hiện tại chỉ xóa khỏi giao diện.
        // Cần bổ sung API xóa món ở backend để xóa trong database.
        setDishes((previous) =>
            previous.filter((item) => item.id !== dishId)
        );

        setSelectedDishIds((previous) =>
            previous.filter((id) => id !== dishId)
        );

        setPromotions((previous) =>
            previous.map((promotion) => ({
                ...promotion,
                dishIds: promotion.dishIds.filter(
                    (id) => id !== dishId
                ),
            }))
        );
    };

    // ========================================
    // ẨN / HIỆN MÓN ĂN
    // ========================================

    const toggleDishActive = (dishId) => {
        setDishes((previous) =>
            previous.map((dish) =>
                dish.id === dishId
                    ? { ...dish, active: !dish.active }
                    : dish
            )
        );
    };

    // ========================================
    // CHỌN MÓN ÁP DỤNG KHUYẾN MÃI
    // ========================================

    const toggleSelectedDish = (dishId) => {
        setSelectedDishIds((previous) =>
            previous.includes(dishId)
                ? previous.filter((id) => id !== dishId)
                : [...previous, dishId]
        );
    };

    const toggleAllVisibleDishes = () => {
        const visibleIds = filteredDishes.map((dish) => dish.id);

        const allSelected =
            visibleIds.length > 0 &&
            visibleIds.every((id) =>
                selectedDishIds.includes(id)
            );

        setSelectedDishIds((previous) =>
            allSelected
                ? previous.filter(
                      (id) => !visibleIds.includes(id)
                  )
                : [...new Set([...previous, ...visibleIds])]
        );
    };

    // ========================================
    // THÊM VÀ CẬP NHẬT KHUYẾN MÃI
    // ========================================

    const openAddPromotion = () => {
        setEditingPromotion(null);
        setSelectedDishIds([]);
        setShowPromotionForm(true);
    };

    const openEditPromotion = (promotion) => {
        setEditingPromotion(promotion);
        setShowPromotionForm(true);
    };

    const savePromotion = (promotionData) => {
        if (editingPromotion) {
            setPromotions((previous) =>
                previous.map((promotion) =>
                    promotion.id === editingPromotion.id
                        ? {
                              ...promotionData,
                              id: editingPromotion.id,
                          }
                        : promotion
                )
            );
        } else {
            setPromotions((previous) => [
                ...previous,
                {
                    ...promotionData,
                    id: Date.now(),
                },
            ]);
        }

        setShowPromotionForm(false);
        setEditingPromotion(null);
        setSelectedDishIds([]);
    };

    // ========================================
    // XÓA KHUYẾN MÃI
    // ========================================

    const deletePromotion = (promotionId) => {
        const promotion = promotions.find(
            (item) => item.id === promotionId
        );

        if (!promotion) return;

        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa chương trình "${promotion.name}" không?`
        );

        if (!confirmed) return;

        setPromotions((previous) =>
            previous.filter((item) => item.id !== promotionId)
        );
    };

    // ========================================
    // BẬT / TẮT KHUYẾN MÃI
    // ========================================

    const togglePromotionActive = (promotionId) => {
        setPromotions((previous) =>
            previous.map((promotion) =>
                promotion.id === promotionId
                    ? {
                          ...promotion,
                          active: !promotion.active,
                      }
                    : promotion
            )
        );
    };


    // GIAO DIỆN

    return (
        <div className="manage-menu-page">

            {/* Tiêu đề */}
            <div className="manage-menu-header">
                <div>
                    <p className="manage-menu-eyebrow">
                        KHÔNG GIAN CHỦ QUÁN
                    </p>
                    <h1>Quản lý thực đơn</h1>
                </div>

                {activeTab === "dishes" ? (
                    <button
                        type="button"
                        className="manage-menu-primary-btn"
                        onClick={openAddDish}
                        disabled={!businessId}
                    >
                        <span>+</span> Thêm món ăn
                    </button>
                ) : (
                    <button
                        type="button"
                        className="manage-menu-primary-btn"
                        onClick={openAddPromotion}
                    >
                        <span>+</span> Tạo khuyến mãi
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="manage-menu-tabs">
                <button
                    type="button"
                    className={
                        activeTab === "dishes" ? "active" : ""
                    }
                    onClick={() => setActiveTab("dishes")}
                >
                    Thực đơn
                    <span>{dishes.length}</span>
                </button>

                <button
                    type="button"
                    className={
                        activeTab === "promotions" ? "active" : ""
                    }
                    onClick={() => setActiveTab("promotions")}
                >
                    Khuyến mãi
                    <span>{promotions.length}</span>
                </button>
            </div>

            {/* Nội dung thực đơn */}
            {activeTab === "dishes" ? (
                <section className="manage-menu-dishes">

                    {/* Tìm kiếm và bộ lọc */}
                    <div className="manage-menu-toolbar">
                        <div className="manage-menu-search">
                            <span>⌕</span>

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Tìm kiếm tên món ăn..."
                            />
                        </div>

                        <select
                            value={categoryFilter}
                            onChange={(event) =>
                                setCategoryFilter(event.target.value)
                            }
                            aria-label="Lọc danh mục"
                        >
                            <option value="all">
                                Tất cả danh mục
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category}
                                </option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            aria-label="Lọc trạng thái"
                        >
                            <option value="all">
                                Tất cả trạng thái
                            </option>
                            <option value="active">
                                Đang bán
                            </option>
                            <option value="inactive">
                                Đã ẩn
                            </option>
                        </select>
                    </div>

                    {/* Danh sách món ăn */}
                    {loadingDishes ? (
                        <div className="manage-menu-empty">
                            <p>Đang tải danh sách món ăn...</p>
                        </div>
                    ) : error ? (
                        <div className="manage-menu-empty">
                            <h3>Không thể tải thực đơn</h3>
                            <p>{error}</p>

                            <button
                                type="button"
                                onClick={fetchDishes}
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : filteredDishes.length > 0 ? (
                        <div className="manage-menu-grid">
                            {filteredDishes.map((dish) => {
                                const promotion =
                                    getApplicablePromotion(dish);

                                const discountPrice = promotion
                                    ? getDiscountPrice(
                                          dish,
                                          promotion
                                      )
                                    : undefined;

                                return (
                                    <CardMenu
                                        key={dish.id}
                                        dish={dish}
                                        management
                                        selected={selectedDishIds.includes(
                                            dish.id
                                        )}
                                        onSelect={
                                            selectingPromotionDishes
                                                ? toggleSelectedDish
                                                : undefined
                                        }
                                        onEdit={openEditDish}
                                        onDelete={deleteDish}
                                        onToggleActive={toggleDishActive}
                                        discountPrice={discountPrice}
                                        promotionName={promotion?.name}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="manage-menu-empty">
                            <h3>
                                {dishes.length === 0
                                    ? "Chưa có món ăn nào"
                                    : "Không tìm thấy món ăn"}
                            </h3>

                            <p>
                                {dishes.length === 0
                                    ? "Hãy thêm món ăn đầu tiên vào thực đơn của quán."
                                    : "Thử thay đổi từ khóa hoặc bộ lọc của bạn."}
                            </p>
                        </div>
                    )}
                </section>
            ) : (
                /* Nội dung khuyến mãi */
                <section className="manage-menu-promotions">
                    <div className="manage-menu-promotion-heading">
                        <div>
                            <h2>Chương trình khuyến mãi</h2>
                        </div>
                    </div>

                    <PromotionList
                        promotions={promotions}
                        dishes={dishes}
                        onEdit={openEditPromotion}
                        onDelete={deletePromotion}
                        onToggleActive={togglePromotionActive}
                    />
                </section>
            )}

            {/* Form thêm / sửa món ăn */}
            {showDishForm && (
                <DishForm
                    dish={editingDish}
                    businessId={businessId}
                    onClose={() => {
                        setShowDishForm(false);
                        setEditingDish(null);
                    }}
                    onSave={saveDish}
                />
            )}

            {/* Form thêm / sửa khuyến mãi */}
            {showPromotionForm && (
                <PromotionForm
                    promotion={editingPromotion}
                    dishes={dishes}
                    initialSelectedDishIds={selectedDishIds}
                    onClose={() => {
                        setShowPromotionForm(false);
                        setEditingPromotion(null);
                        setSelectedDishIds([]);
                    }}
                    onSave={savePromotion}
                />
            )}
        </div>
    );
}

export default ManageMenu;
