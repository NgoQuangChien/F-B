import "./promotionList.css";

function formatDate(date) {
    if (!date) return "Chưa thiết lập";

    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
}

function getPromotionStatus(promotion) {
    const today = new Date();
    const localToday = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");

    if (!promotion.active) {
        return { label: "Đã tắt", className: "disabled" };
    }

    if (localToday < promotion.startDate) {
        return { label: "Sắp diễn ra", className: "upcoming" };
    }

    if (localToday > promotion.endDate) {
        return { label: "Đã kết thúc", className: "ended" };
    }

    return { label: "Đang diễn ra", className: "running" };
}

function PromotionList({
    promotions,
    dishes,
    onEdit,
    onDelete,
    onToggleActive,
}) {
    if (promotions.length === 0) {
        return (
            <div className="promotion-list-empty">
                <div className="promotion-list-empty-icon">%</div>
                <h3>Chưa có chương trình khuyến mãi</h3>
                <p>Tạo chương trình đầu tiên để áp dụng ưu đãi cho thực đơn.</p>
            </div>
        );
    }

    return (
        <div className="promotion-list">
            {promotions.map((promotion) => {
                const status = getPromotionStatus(promotion);

                const appliedDishes =
                    promotion.scope === "all"
                        ? dishes.length
                        : promotion.dishIds.filter((id) =>
                              dishes.some((dish) => dish.id === id)
                          ).length;

                return (
                    <article
                        className="promotion-card"
                        key={promotion.id}
                    >
                        <div className="promotion-card-main">
                            <div className="promotion-card-icon">%</div>

                            <div className="promotion-card-info">
                                <div className="promotion-card-title-row">
                                    <h3>{promotion.name}</h3>
                                    <span className={`promotion-status ${status.className}`}>
                                        {status.label}
                                    </span>
                                </div>

                                <p className="promotion-card-description">
                                    {promotion.description || "Không có mô tả."}
                                </p>

                                <div className="promotion-card-discount">
                                    {promotion.type === "percent"
                                        ? `Giảm ${promotion.value}%`
                                        : `Giảm ${Number(promotion.value).toLocaleString("vi-VN")}đ`}
                                </div>

                                <div className="promotion-card-meta">
                                    <span>
                                        <strong>Áp dụng:</strong>{" "}
                                        {promotion.scope === "all"
                                            ? "Toàn bộ thực đơn"
                                            : `${appliedDishes} món`}
                                    </span>

                                    <span>
                                        <strong>Thời gian:</strong>{" "}
                                        {formatDate(promotion.startDate)} –{" "}
                                        {formatDate(promotion.endDate)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="promotion-card-actions">
                            <button
                                type="button"
                                className="promotion-action-edit"
                                onClick={() => onEdit(promotion)}
                            >
                                Sửa
                            </button>

                            <button
                                type="button"
                                className="promotion-action-toggle"
                                onClick={() => onToggleActive(promotion.id)}
                            >
                                {promotion.active ? "Tắt" : "Bật"}
                            </button>

                            <button
                                type="button"
                                className="promotion-action-delete"
                                onClick={() => onDelete(promotion.id)}
                            >
                                Xóa
                            </button>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}

export default PromotionList;