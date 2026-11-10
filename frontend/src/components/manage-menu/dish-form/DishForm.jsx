
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import dishApi from "../../../api/dishApi";
import categoryApi from "../../../api/categoryApi";
import "./dishForm.css";

const emptyDish = {
    name: "",
    description: "",
    price: "",
    categoryId: "",
    dishType: "food",
    image: ""
};

const emptySize = {
    sizeName: "",
    price: ""
};

function DishForm({ dish, businessId, onClose, onSave }) {
    const [form, setForm] = useState(emptyDish);

    // Danh mục
    const [categories, setCategories] = useState([]);
    const [categoryInput, setCategoryInput] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [creatingCategory, setCreatingCategory] = useState(false);

    // Size đồ uống
    const [sizes, setSizes] = useState([]);

    // Trạng thái
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);

    // Ảnh
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    // =========================
    // LẤY DANH SÁCH DANH MỤC
    // =========================

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);

            const response = await categoryApi.getAllCategories();

            setCategories(response.data.data || []);
        } catch (error) {
            console.error("Lỗi lấy danh mục:", error);

            toast.error(
                error.response?.data?.message ||
                "Không thể tải danh sách danh mục."
            );
        } finally {
            setLoadingCategories(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // =========================
    // KHỞI TẠO DỮ LIỆU
    // =========================

    useEffect(() => {
        if (dish) {
            setForm({
                ...emptyDish,
                name: dish.dishName || "",
                description: dish.description || "",
                price: String(dish.price ?? ""),
                categoryId: String(dish.categoryId || ""),
                dishType: dish.dishType || "food",
                image: dish.image || ""
            });

            setCategoryInput(dish.categoryName || "");

            setSizes(
                (dish.sizes || []).map(size => ({
                    sizeName: size.sizeName || "",
                    price: String(size.price ?? "")
                }))
            );

            setImagePreview(dish.image || "");
        } else {
            setForm(emptyDish);
            setCategoryInput("");
            setSizes([]);
            setImagePreview("");
        }

        setImageFile(null);
        setShowSuggestions(false);
    }, [dish]);

    // Nếu dữ liệu sửa món không có categoryName,
    // lấy tên danh mục từ danh sách đã tải.
    useEffect(() => {
        if (!dish || dish.categoryName || !dish.categoryId) return;

        const category = categories.find(
            item => String(item.categoryId) === String(dish.categoryId)
        );

        if (category) {
            setCategoryInput(category.categoryName);
        }
    }, [categories, dish]);

    // Giải phóng URL ảnh xem trước
    useEffect(() => {
        return () => {
            if (imagePreview?.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // =========================
    // XỬ LÝ DANH MỤC
    // =========================

    const filteredCategories = useMemo(() => {
        const keyword = categoryInput.trim().toLowerCase();

        if (!keyword) return categories;

        return categories.filter(category =>
            category.categoryName.toLowerCase().includes(keyword)
        );
    }, [categories, categoryInput]);

    const matchedCategory = useMemo(() => {
        return categories.find(category =>
            category.categoryName.trim().toLowerCase() ===
            categoryInput.trim().toLowerCase()
        );
    }, [categories, categoryInput]);

    // Nhập thông tin món
    const handleChange = event => {
        const { name, value } = event.target;

        setForm(previous => ({
            ...previous,
            [name]: value
        }));
    };

    // Nhập tên danh mục
    const handleCategoryInput = event => {
        const value = event.target.value;

        setCategoryInput(value);
        setShowSuggestions(true);

        setForm(previous => ({
            ...previous,
            categoryId: ""
        }));
    };

    // Chọn danh mục có sẵn
    const handleSelectCategory = category => {
        setCategoryInput(category.categoryName);

        setForm(previous => ({
            ...previous,
            categoryId: String(category.categoryId)
        }));

        setShowSuggestions(false);
    };

    // Tạo danh mục mới nếu chưa tồn tại
    const handleCreateCategory = async () => {
        const categoryName = categoryInput.trim();

        if (!categoryName) {
            throw new Error("Vui lòng nhập tên danh mục.");
        }

        // Nếu đã chọn danh mục có sẵn
        if (matchedCategory) {
            return matchedCategory.categoryId;
        }

        setCreatingCategory(true);

        try {
            const response = await categoryApi.createCategory({
                categoryName
            });

            const newCategory = response.data.data;

            if (!newCategory?.categoryId) {
                throw new Error("Không nhận được ID danh mục.");
            }

            setCategories(previous => {
                const exists = previous.some(
                    item => item.categoryId === newCategory.categoryId
                );

                return exists ? previous : [...previous, newCategory];
            });

            setCategoryInput(newCategory.categoryName || categoryName);

            setForm(previous => ({
                ...previous,
                categoryId: String(newCategory.categoryId)
            }));

            return newCategory.categoryId;
        } finally {
            setCreatingCategory(false);
        }
    };

    // =========================
    // XỬ LÝ SIZE
    // =========================

    // Thêm một dòng size khi người dùng nhấn nút
    const handleAddSize = () => {
        setSizes(previous => [
            ...previous,
            { ...emptySize }
        ]);
    };

    // Thay đổi tên size hoặc giá
    const handleSizeChange = (index, field, value) => {
        setSizes(previous =>
            previous.map((size, i) =>
                i === index
                    ? { ...size, [field]: value }
                    : size
            )
        );
    };

    // Xóa size
    const handleRemoveSize = index => {
        setSizes(previous =>
            previous.filter((_, i) => i !== index)
        );
    };

    // =========================
    // XỬ LÝ ẢNH
    // =========================

    const handleImageChange = event => {
        const file = event.target.files[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước ảnh không được vượt quá 5MB.");
            event.target.value = "";
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    // =========================
    // KIỂM TRA DỮ LIỆU
    // =========================

    const validateForm = () => {
        if (!form.name.trim()) {
            toast.error("Vui lòng nhập tên món ăn.");
            return false;
        }

        if (!categoryInput.trim()) {
            toast.error("Vui lòng nhập tên danh mục.");
            return false;
        }

        if (!businessId) {
            toast.error("Không tìm thấy thông tin quán.");
            return false;
        }

        if (!dish && !imageFile) {
            toast.error("Vui lòng chọn ảnh món ăn.");
            return false;
        }

        // Kiểm tra size đồ uống
        if (form.dishType === "drink" && sizes.length > 0) {
            for (let i = 0; i < sizes.length; i++) {
                const size = sizes[i];

                if (!size.sizeName.trim()) {
                    toast.error(`Vui lòng nhập tên cho size thứ ${i + 1}.`);
                    return false;
                }

                if (
                    size.price === "" ||
                    !Number.isFinite(Number(size.price)) ||
                    Number(size.price) <= 0
                ) {
                    toast.error(`Giá của size ${size.sizeName} phải lớn hơn 0.`);
                    return false;
                }
            }

            // Kiểm tra tên size trùng nhau
            const sizeNames = sizes.map(size =>
                size.sizeName.trim().toLowerCase()
            );

            if (new Set(sizeNames).size !== sizeNames.length) {
                toast.error("Tên size không được trùng nhau.");
                return false;
            }
        }

        // Nếu không có size thì sử dụng giá cố định
        if (form.dishType !== "drink" || sizes.length === 0) {
            if (
                form.price === "" ||
                !Number.isFinite(Number(form.price)) ||
                Number(form.price) <= 0
            ) {
                toast.error("Giá món ăn phải lớn hơn 0.");
                return false;
            }
        }

        return true;
    };

    // =========================
    // LƯU MÓN ĂN
    // =========================

    const handleSubmit = async event => {
        event.preventDefault();

        if (loading) return;

        if (!validateForm()) return;

        try {
            setLoading(true);

            // Chuyển dữ liệu size về đúng định dạng
            const validSizes =
                form.dishType === "drink"
                    ? sizes.map(size => ({
                        sizeName: size.sizeName.trim(),
                        price: Number(size.price)
                    }))
                    : [];

            // Giá cơ sở: lấy giá thấp nhất của size
            // Nếu không có size thì lấy giá cố định
            const finalPrice =
                validSizes.length > 0
                    ? Math.min(...validSizes.map(size => size.price))
                    : Number(form.price);

            // Lấy categoryId hoặc tạo danh mục mới
            const categoryId = await handleCreateCategory();

            // Tạo FormData
            const formData = new FormData();

            formData.append("businessId", businessId);
            formData.append("categoryId", categoryId);
            formData.append("dishName", form.name.trim());
            formData.append("description", form.description.trim());
            formData.append("price", finalPrice);
            formData.append("dishType", form.dishType);

            // Gửi danh sách size dưới dạng JSON
            formData.append("sizes", JSON.stringify(validSizes));

            if (imageFile) {
                formData.append("image", imageFile);
            }

            // Gọi API thêm hoặc cập nhật
            let response;

            if (dish) {
                response = await dishApi.updateDish(
                    businessId,
                    dish.dishId,
                    formData
                );
            } else {
                response = await dishApi.createDish(formData);
            }

            toast.success(
                response.data.message || "Lưu món ăn thành công!"
            );

            if (onSave) {
                await onSave(response.data.data);
            }

            onClose();

        } catch (error) {
            console.error("Lỗi lưu món ăn:", error);

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Không thể lưu món ăn. Vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // GIAO DIỆN
    // =========================

    return (
        <div
            className="dish-form-overlay"
            onMouseDown={onClose}
        >
            <section
                className="dish-form-modal"
                onMouseDown={event => event.stopPropagation()}
            >
                {/* Header */}
                <div className="dish-form-header">
                    <div>
                        <h2>
                            {dish ? "Cập nhật món ăn" : "Thêm món ăn"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="dish-form-close"
                        onClick={onClose}
                        disabled={loading}
                    >
                        ×
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="dish-form"
                >
                    {/* Tên món */}
                    <div className="dish-form-field">
                        <label>Tên món ăn *</label>

                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Ví dụ: Trà sữa truyền thống"
                        />
                    </div>

                    {/* Mô tả */}
                    <div className="dish-form-field">
                        <label>Mô tả</label>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Mô tả thành phần hoặc hương vị món ăn..."
                        />
                    </div>

                    {/* Loại món */}
                    <div className="dish-form-field">
                        <label>Loại món *</label>

                        <select
                            name="dishType"
                            value={form.dishType}
                            onChange={event => {
                                const value = event.target.value;

                                setForm(previous => ({
                                    ...previous,
                                    dishType: value
                                }));

                                if (value !== "drink") {
                                    setSizes([]);
                                }
                            }}
                        >
                            <option value="food">Đồ ăn</option>
                            <option value="drink">Đồ uống</option>
                        </select>
                    </div>

                    {/* Size dành cho đồ uống */}
                    {form.dishType === "drink" && (
                        <div className="dish-size-section">
                            <div className="dish-size-header">
                                <button
                                    type="button"
                                    className="dish-add-size"
                                    onClick={handleAddSize}
                                    disabled={loading}
                                >
                                    + Thêm size
                                </button>
                            </div>

                            {/* Chỉ hiển thị khi đã nhấn Thêm size */}
                            {sizes.length > 0 && (
                                <>
                                    <div className="dish-size-labels">
                                        <span>Tên size</span>
                                        <span>Giá bán (VNĐ)</span>
                                        <span></span>
                                    </div>

                                    {sizes.map((size, index) => (
                                        <div
                                            className="dish-size-row"
                                            key={index}
                                        >
                                            <input
                                                value={size.sizeName}
                                                onChange={event =>
                                                    handleSizeChange(
                                                        index,
                                                        "sizeName",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Ví dụ: S"
                                                disabled={loading}
                                            />

                                            <input
                                                type="number"
                                                min="1"
                                                value={size.price}
                                                onChange={event =>
                                                    handleSizeChange(
                                                        index,
                                                        "price",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Ví dụ: 25000"
                                                disabled={loading}
                                            />

                                            <button
                                                type="button"
                                                className="dish-remove-size"
                                                onClick={() =>
                                                    handleRemoveSize(index)
                                                }
                                                title="Xóa size"
                                                disabled={loading}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}

                    {/* Giá cố định khi không có size */}
                    {(form.dishType !== "drink" || sizes.length === 0) && (
                        <div className="dish-form-field">
                            <label>Giá bán (VNĐ) *</label>

                            <input
                                name="price"
                                type="number"
                                min="1"
                                value={form.price}
                                onChange={handleChange}
                                placeholder="Ví dụ: 65000"
                            />
                        </div>
                    )}

                    {/* Danh mục tìm kiếm */}
                    <div className="dish-form-field dish-category-field">
                        <label>Danh mục *</label>

                        <div className="dish-category-search">
                            <input
                                value={categoryInput}
                                onChange={handleCategoryInput}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => {
                                    setTimeout(() => {
                                        setShowSuggestions(false);
                                    }, 150);
                                }}
                                placeholder="Nhập tên danh mục..."
                                autoComplete="off"
                                disabled={loading}
                            />

                            {showSuggestions &&
                                filteredCategories.length > 0 && (
                                    <div className="dish-category-suggestions">
                                        {filteredCategories.map(category => (
                                            <button
                                                type="button"
                                                key={category.categoryId}
                                                onMouseDown={event =>
                                                    event.preventDefault()
                                                }
                                                onClick={() =>
                                                    handleSelectCategory(category)
                                                }
                                                className={
                                                    String(category.categoryId) ===
                                                    form.categoryId
                                                        ? "active"
                                                        : ""
                                                }
                                            >
                                                {category.categoryName}
                                            </button>
                                        ))}
                                    </div>
                                )}
                        </div>

                        {loadingCategories && (
                            <small>Đang tải danh mục...</small>
                        )}
                    </div>

                    {/* Ảnh món */}
                    <div className="dish-form-field">
                        <label>Ảnh món ăn *</label>

                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                            disabled={loading}
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

                    {/* Nút */}
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
                            disabled={loading || creatingCategory}
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
