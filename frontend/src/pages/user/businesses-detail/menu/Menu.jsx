
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MenuList from "../../../../components/menu-list/MenuList";
import dishApi from "../../../../api/dishApi";

import "./menu.css";

function Menu() {
    // Lấy businessId từ URL
    const { businessId } = useParams();

    const [search, setSearch] = useState("");

    // Danh sách món ăn lấy từ database
    const [dishes, setDishes] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Lấy danh sách món ăn theo quán
    useEffect(() => {
        let isMounted = true;

        const fetchDishes = async () => {
            if (!businessId) {
                setError("Không tìm thấy ID quán.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");
                setDishes([]);

                console.log("ID quán:", businessId);

                const response =
                    await dishApi.getDishesByBusinessId(businessId);

                console.log("Dữ liệu API trả về:", response.data);

                if (!isMounted) return;

                const result = response.data;

                // Lấy danh sách món ăn từ response
                let dishList = [];

                if (Array.isArray(result)) {
                    dishList = result;
                } else if (Array.isArray(result?.data)) {
                    dishList = result.data;
                } else if (Array.isArray(result?.dishes)) {
                    dishList = result.dishes;
                }

                console.log("Danh sách món ăn:", dishList);

                setDishes(dishList);

            } catch (err) {
                console.error("Lỗi lấy danh sách món ăn:", err);

                if (isMounted) {
                    setError(
                        err.response?.data?.message ||
                        "Không thể tải danh sách thực đơn. Vui lòng thử lại."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchDishes();

        return () => {
            isMounted = false;
        };
    }, [businessId]);

    // Tìm kiếm món ăn theo tên
    const filteredDishes = dishes.filter(dish => {
        const dishName = String(
            dish.dishName || dish.name || ""
        );

        return dishName
            .toLowerCase()
            .includes(search.trim().toLowerCase());
    });

    return (
        <div className="menu-container">
            <div className="menu-container-left">

                {/* Tìm kiếm */}
                <div className="menu-left-item">
                    <span className="menu-left-item-title">
                        Tìm kiếm
                    </span>

                    <input
                        type="search"
                        className="menu-search"
                        name="searchDish"
                        placeholder="Nhập tên món ăn hoặc đồ uống"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Danh mục */}
                <div className="menu-left-item">
                    <span className="menu-left-item-title">
                        Danh mục
                    </span>

                    <select className="menu-category">
                        <option className="menu-category-item" value="tat-ca">
                            Tất cả
                        </option>
                        <option className="menu-category-item" value="do-an">
                            Đồ ăn
                        </option>
                        <option className="menu-category-item" value="do-uong">
                            Đồ uống
                        </option>
                    </select>
                </div>

                {/* Loại món */}
                <div className="menu-left-item">
                    <span className="menu-left-item-title">
                        Loại món
                    </span>

                    <div className="menu-filter">
                        <button type="button" className="menu-filter-btn">Tất cả</button>
                        <button type="button" className="menu-filter-btn">Món chay</button>
                        <button type="button" className="menu-filter-btn">Món xào</button>
                        <button type="button" className="menu-filter-btn">Món luộc</button>
                        <button type="button" className="menu-filter-btn">Món chiên</button>
                        <button type="button" className="menu-filter-btn">Lẩu</button>
                        <button type="button" className="menu-filter-btn">Món xào</button>
                        <button type="button" className="menu-filter-btn">Món luộc</button>
                        <button type="button" className="menu-filter-btn">Món chiên</button>
                        <button type="button" className="menu-filter-btn">Lẩu</button>
                    </div>
                </div>

                {/* Giá tiền */}
                <div className="menu-left-item">
                    <span className="menu-left-item-title">
                        Giá tiền tối đa
                    </span>

                    <input
                        type="range"
                        className="price-max"
                        min="20000"
                        max="300000"
                        step="10000"
                    />
                </div>

                {/* Đánh giá */}
                <div className="menu-left-item">
                    <span className="menu-left-item-title">
                        Đánh giá
                    </span>

                    <div>
                        <button type="button" className="menu-filter-btn">Tất cả</button>
                        <button type="button" className="menu-filter-btn">4.5 sao trở lên</button>
                        <button type="button" className="menu-filter-btn">4.0 sao trở lên</button>
                    </div>
                </div>

                {/* Khác */}
                <div className="menu-left-item">
                    <span className="menu-left-item-title">
                        Khác
                    </span>

                    <div className="menu-filter-checkbox">
                        <input
                            type="checkbox"
                            id="promotion"
                            className="checkbox-input"
                        />

                        <label
                            htmlFor="promotion"
                            className="checkbox-title"
                        >
                            Đang khuyến mãi
                        </label>
                    </div>

                    <div className="menu-filter-checkbox">
                        <input
                            type="checkbox"
                            id="dishNew"
                            className="checkbox-input"
                        />

                        <label
                            htmlFor="dishNew"
                            className="checkbox-title"
                        >
                            Món mới
                        </label>
                    </div>
                </div>
            </div>

            {/* Danh sách món ăn */}
            <div className="menu-container-right">
                {loading ? (
                    <div className="menu-loading">
                        Đang tải thực đơn...
                    </div>
                ) : error ? (
                    <div className="menu-error">
                        {error}
                    </div>
                ) : (
                    <MenuList dishes={filteredDishes} />
                )}
            </div>
        </div>
    );
}

export default Menu;
