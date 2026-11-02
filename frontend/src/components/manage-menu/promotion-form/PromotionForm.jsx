import { useEffect, useState } from "react";
import "./promotionForm.css";

const emptyPromotion = {
    name: "",
    type: "percent",
    value: "",
    scope: "all",
    dishIds: [],
    startDate: "",
    endDate: "",
    description: "",
    active: true,
};

function PromotionForm({promotion, dishes, initialSelectedDishIds = [], onClose, onSave,}) {

    const [form, setForm] = useState(emptyPromotion);
    const [error, setError] = useState("");

    useEffect(() => {
        if (promotion) {
            setForm({
                ...emptyPromotion,
                ...promotion,
                dishIds: [...(promotion.dishIds || [])],
                value: String(promotion.value ?? ""),
            });
        } else {
            setForm({
                ...emptyPromotion,
                scope: initialSelectedDishIds.length > 0 ? "selected" : "all",
                dishIds: [...initialSelectedDishIds],
            });
        }

        setError("");
    }, [promotion, initialSelectedDishIds]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const toggleDish = (dishId) => {
        setForm((previous) => {
            const exists = previous.dishIds.includes(dishId);

            return {
                ...previous,
                dishIds: exists
                    ? previous.dishIds.filter((id) => id !== dishId)
                    : [...previous.dishIds, dishId],
            };
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!form.name.trim()) {
            setError("Vui lòng nhập tên chương trình khuyến mãi.");
            return;
        }

        const value = Number(form.value);

        if (!Number.isFinite(value) || value <= 0) {
            setError("Giá trị giảm phải lớn hơn 0.");
            return;
        }

        if (form.type === "percent" && value > 100) {
            setError("Mức giảm phần trăm không được vượt quá 100%.");
            return;
        }

        if (!form.startDate || !form.endDate) {
            setError("Vui lòng chọn ngày bắt đầu và ngày kết thúc.");
            return;
        }

        if (form.endDate < form.startDate) {
            setError("Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.");
            return;
        }

        if (form.scope === "selected" && form.dishIds.length === 0) {
            setError("Vui lòng chọn ít nhất một món áp dụng.");
            return;
        }

        onSave({
            ...form,
            name: form.name.trim(),
            description: form.description.trim(),
            value,
            dishIds: form.scope === "all" ? [] : form.dishIds,
        });
    };

    return (
        <div className="promotion-form-overlay" onMouseDown={onClose}>
            <section
                className="promotion-form-modal"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="promotion-form-header">
                    <div>
                        <h2>
                            {promotion ? "Sửa khuyến mãi" : "Tạo khuyến mãi"}
                        </h2>
                        <p>Thiết lập ưu đãi áp dụng cho thực đơn.</p>
                    </div>

                    <button
                        type="button"
                        className="promotion-form-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <form className="promotion-form" onSubmit={handleSubmit}>
                    <div className="promotion-form-field">
                        <label htmlFor="promotion-name">
                            Tên chương trình *
                        </label>
                        <input
                            id="promotion-name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Ví dụ: Ưu đãi cuối tuần"
                        />
                    </div>

                    <div className="promotion-form-row">
                        <div className="promotion-form-field">
                            <label htmlFor="promotion-type">
                                Hình thức giảm
                            </label>
                            <select
                                id="promotion-type"
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                            >
                                <option value="percent">Giảm theo %</option>
                                <option value="amount">Giảm số tiền</option>
                            </select>
                        </div>

                        <div className="promotion-form-field">
                            <label htmlFor="promotion-value">
                                {form.type === "percent"
                                    ? "Phần trăm giảm (%)"
                                    : "Số tiền giảm (VNĐ)"}
                            </label>
                            <input
                                id="promotion-value"
                                name="value"
                                type="number"
                                min="1"
                                max={form.type === "percent" ? 100 : undefined}
                                value={form.value}
                                onChange={handleChange}
                                placeholder={form.type === "percent" ? "10" : "20000"}
                            />
                        </div>
                    </div>

                    <div className="promotion-form-field">
                        <label>Phạm vi áp dụng</label>

                        <div className="promotion-scope-options">
                            <label
                                className={`promotion-scope-option ${
                                    form.scope === "all" ? "selected" : ""
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="scope"
                                    value="all"
                                    checked={form.scope === "all"}
                                    onChange={handleChange}
                                />
                                <span>
                                    <strong>Toàn bộ thực đơn</strong>
                                    <small>Áp dụng cho tất cả món ăn.</small>
                                </span>
                            </label>

                            <label
                                className={`promotion-scope-option ${
                                    form.scope === "selected" ? "selected" : ""
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="scope"
                                    value="selected"
                                    checked={form.scope === "selected"}
                                    onChange={handleChange}
                                />
                                <span>
                                    <strong>Một số món</strong>
                                    <small>Tự chọn các món được giảm giá.</small>
                                </span>
                            </label>
                        </div>
                    </div>

                    {form.scope === "selected" && (
                        <div className="promotion-dish-picker">
                            <div className="promotion-dish-picker-header">
                                <strong>Chọn món áp dụng</strong>
                                <span>{form.dishIds.length} món đã chọn</span>
                            </div>

                            {dishes.length === 0 ? (
                                <p className="promotion-no-dishes">
                                    Chưa có món ăn trong thực đơn.
                                </p>
                            ) : (
                                <div className="promotion-dish-picker-list">
                                    {dishes.map((dish) => (
                                        <label
                                            key={dish.id}
                                            className="promotion-dish-option"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={form.dishIds.includes(dish.id)}
                                                onChange={() => toggleDish(dish.id)}
                                            />

                                            <img
                                                src={
                                                    dish.image ||
                                                    "https://placehold.co/80x80?text=Mon"
                                                }
                                                alt={dish.name}
                                            />

                                            <span className="promotion-dish-option-info">
                                                <strong>{dish.name}</strong>
                                                <small>
                                                    {Number(dish.price).toLocaleString("vi-VN")}đ
                                                </small>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="promotion-form-row">
                        <div className="promotion-form-field">
                            <label htmlFor="promotion-start">
                                Ngày bắt đầu *
                            </label>
                            <input
                                id="promotion-start"
                                name="startDate"
                                type="date"
                                value={form.startDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="promotion-form-field">
                            <label htmlFor="promotion-end">
                                Ngày kết thúc *
                            </label>
                            <input
                                id="promotion-end"
                                name="endDate"
                                type="date"
                                min={form.startDate || undefined}
                                value={form.endDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="promotion-form-field">
                        <label htmlFor="promotion-description">Mô tả</label>
                        <textarea
                            id="promotion-description"
                            name="description"
                            rows={3}
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Thông tin chi tiết về chương trình..."
                        />
                    </div>

                    {error && <p className="promotion-form-error">{error}</p>}

                    <div className="promotion-form-actions">
                        <button
                            type="button"
                            className="promotion-form-cancel"
                            onClick={onClose}
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            className="promotion-form-submit"
                        >
                            {promotion ? "Lưu thay đổi" : "Tạo khuyến mãi"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default PromotionForm;