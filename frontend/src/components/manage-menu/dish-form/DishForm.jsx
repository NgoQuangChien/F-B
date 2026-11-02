import { useEffect, useState } from "react";
import dishApi from "../../../api/dishApi";
import categoryApi from "../../../api/categoryApi";
import "./dishForm.css";

const emptyDish = {
    name: "",
    description: "",
    price: "",
    categoryId: "",
    dishType: "food",
    image: "",
};

function DishForm({ dish, businessId, onClose, onSave }) {
    const [form, setForm] = useState(emptyDish);

    const [categories, setCategories] = useState([]);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    // Lấy danh sách danh mục từ database
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);

                const response = await categoryApi.getAllCategories();

                setCategories(response.data.data || []);
            } catch (error) {
                console.error("Lỗi lấy danh mục:", error);
                setError("Không thể tải danh sách danh mục.");
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // Khởi tạo dữ liệu form
    useEffect(() => {
        if (dish) {
            setForm({
                ...emptyDish,
                name: dish.dishName || "",
                description: dish.description || "",
                price: String(dish.price ?? ""),
                categoryId: String(dish.categoryId || ""),
                dishType: dish.dishType || "food",
                image: dish.image || "",
            });

            setImagePreview(dish.image || "");
        } else {
            setForm(emptyDish);
            setImagePreview("");
        }

        setImageFile(null);
        setError("");
    }, [dish]);

    // Giải phóng URL ảnh xem trước
    useEffect(() => {
        return () => {
            if (imagePreview?.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // Xử lý thay đổi input
    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Chọn ảnh từ máy tính
    const handleImageChange = (event) => {
        const file = event.target.files[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Kích thước ảnh không được vượt quá 5MB.");
            event.target.value = "";
            return;
        }

        setError("");
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    // Gửi dữ liệu lên backend
    const handleSubmit = async (event) => {
        event.preventDefault();

        // 1. Kiểm tra tên món ăn
        if (!form.name.trim()) {
            setError("Vui lòng nhập tên món ăn.");
            return;
        }

        // 2. Kiểm tra giá
        if (!form.price || Number(form.price) <= 0) {
            setError("Giá món ăn phải lớn hơn 0.");
            return;
        }

        // 3. Kiểm tra danh mục
        if (!form.categoryId) {
            setError("Vui lòng chọn danh mục món ăn.");
            return;
        }

        // 4. Kiểm tra ảnh
        // Khi thêm mới phải có ảnh.
        // Khi sửa có thể giữ ảnh cũ.
        if (!dish && !imageFile) {
            setError("Vui lòng chọn ảnh món ăn.");
            return;
        }

        // 5. Kiểm tra businessId
        if (!businessId) {
            setError("Không tìm thấy thông tin quán.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            // 6. Tạo FormData để gửi dữ liệu
            const formData = new FormData();

            formData.append("businessId", businessId);
            formData.append("categoryId", form.categoryId);
            formData.append("dishName", form.name.trim());
            formData.append("description", form.description.trim());
            formData.append("price", Number(form.price));
            formData.append("dishType", form.dishType);

            // Chỉ gửi ảnh khi người dùng chọn ảnh mới
            if (imageFile) {
                formData.append("image", imageFile);
            }

            // 7. Gọi API thêm hoặc sửa món ăn
            let response;

            if (dish) {
                // Nếu có dish thì đang sửa món ăn
                response = await dishApi.updateDish(
                    businessId,
                    dish.dishId,
                    formData
                );
            } else {
                // Nếu không có dish thì đang thêm món ăn
                response = await dishApi.createDish(formData);
            }

            // 8. Thông báo kết quả
            alert(response.data.message || "Lưu món ăn thành công!");

            // 9. Gọi onSave để cập nhật danh sách món ăn
            if (onSave) {
                await onSave(response.data.data);
            }

            // 10. Đóng form
            onClose();

        } catch (error) {
        
            console.error("HTTP Status:", error.response?.status);
            console.error("API Response:", error.response?.data);
            console.error("API URL:", error.config?.url);
            console.error("Lỗi lưu món ăn:", error);

            setError(
                error.response?.data?.message ||
                "Không thể lưu món ăn. Vui lòng thử lại."
            );

        } finally {
            // 11. Kết thúc trạng thái loading
            setLoading(false);
        }
    };

    return (
        <div className="dish-form-overlay" onMouseDown={onClose}>
            <section
                className="dish-form-modal"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="dish-form-header">
                    <div>
                        <h2>{dish ? "Cập nhật món ăn" : "Thêm món ăn"}</h2>
                        <p>Nhập thông tin món trong thực đơn của quán.</p>
                    </div>

                    <button
                        type="button"
                        className="dish-form-close"
                        onClick={onClose}
                        aria-label="Đóng form"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="dish-form">
                    {/* Tên món ăn */}
                    <div className="dish-form-field">
                        <label htmlFor="dish-name">Tên món ăn *</label>

                        <input
                            id="dish-name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Ví dụ: Burger bò phô mai"
                        />
                    </div>

                    {/* Mô tả */}
                    <div className="dish-form-field">
                        <label htmlFor="dish-description">Mô tả</label>

                        <textarea
                            id="dish-description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Mô tả thành phần hoặc hương vị món ăn..."
                        />
                    </div>

                    {/* Giá và danh mục */}
                    <div className="dish-form-row">
                        <div className="dish-form-field">
                            <label htmlFor="dish-price">
                                Giá bán (VNĐ) *
                            </label>

                            <input
                                id="dish-price"
                                name="price"
                                type="number"
                                min="1"
                                value={form.price}
                                onChange={handleChange}
                                placeholder="65000"
                            />
                        </div>

                        <div className="dish-form-field">
                            <label htmlFor="dish-category">
                                Danh mục *
                            </label>

                            <select
                                id="dish-category"
                                name="categoryId"
                                value={form.categoryId}
                                onChange={handleChange}
                                disabled={loadingCategories}
                            >
                                <option value="">
                                    {loadingCategories
                                        ? "Đang tải danh mục..."
                                        : "Chọn danh mục"}
                                </option>

                                {categories.map((category) => (
                                    <option
                                        key={category.categoryId}
                                        value={category.categoryId}
                                    >
                                        {category.categoryName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Loại món */}
                    <div className="dish-form-field">
                        <label htmlFor="dish-type">Loại món *</label>

                        <select
                            id="dish-type"
                            name="dishType"
                            value={form.dishType}
                            onChange={handleChange}
                        >
                            <option value="food">Đồ ăn</option>
                            <option value="drink">Đồ uống</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>

                    {/* Ảnh món ăn */}
                    <div className="dish-form-field">
                        <label htmlFor="dish-image">Ảnh món ăn *</label>

                        <input
                            id="dish-image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                        />

                        {imagePreview && (
                            <div className="dish-form-preview">
                                <img
                                    src={imagePreview}
                                    alt="Xem trước món ăn"
                                />
                            </div>
                        )}
                    </div>

                    {/* Thông báo lỗi */}
                    {error && (
                        <p className="dish-form-error">
                            {error}
                        </p>
                    )}

                    {/* Nút thao tác */}
                    <div className="dish-form-actions">
                        <button
                            type="button"
                            className="dish-form-cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            className="dish-form-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Đang lưu..."
                                : dish
                                    ? "Lưu thay đổi"
                                    : "Thêm món"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default DishForm;