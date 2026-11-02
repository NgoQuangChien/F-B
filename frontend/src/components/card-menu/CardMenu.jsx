import "./cardMenu.css";

function CardMenu({
    dish,
    onOrder,
    management = false,
    selected = false,
    selectable = false,
    onSelect,
    onEdit,
    onDelete,
}) {
    const defaultImage = "/images/no-image.png";

    return (
        <div className="card-menu-container">
            {selectable && (
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onSelect?.(dish.id)}
                    aria-label={`Chọn ${dish.name}`}
                />
            )}

            <div className="card-menu-image">
                <img
                    src={dish.image || defaultImage}
                    alt={dish.name}
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = defaultImage;
                    }}
                />
            </div>

            <div className="card-menu-content">
                <h3 className="card-menu-name">
                    {dish.name}
                </h3>

                <p className="card-menu-description">
                    {dish.description}
                </p>

                <div className="card-menu-bottom">
                    <div className="card-menu-price-wrapper">
                        {dish.promotion ? (
                            <>
                                <span className="card-menu-price-old">
                                    {Number(dish.price).toLocaleString("vi-VN")}đ
                                </span>

                                <span className="card-menu-price">
                                    {Number(dish.promotionPrice).toLocaleString("vi-VN")}đ
                                </span>

                                <span className="card-menu-discount">
                                    -{dish.discountPercent}%
                                </span>
                            </>
                        ) : (
                            <span className="card-menu-price">
                                {Number(dish.price).toLocaleString("vi-VN")}đ
                            </span>
                        )}
                    </div>

                    {!management ? (
                        <button
                            className="card-menu-button"
                            onClick={() => onOrder?.(dish)}
                        >
                            + Đặt ngay
                        </button>
                    ) : (
                        <div className="card-menu-management-actions">
                            <button onClick={() => onEdit?.(dish)}>
                                Sửa
                            </button>

                            <button onClick={() => onDelete?.(dish)}>
                                Xóa
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CardMenu;