
import { useEffect, useState } from "react";

import MenuList from "../../../components/menu-list/MenuList";
import dishApi from "../../../api/dishApi";

import "../businesses-detail/menu/menu.css";

function Food() {
    const [search, setSearch] = useState("");

    // Danh sách tất cả món ăn
    const [dishes, setDishes] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Lấy tất cả món ăn từ tất cả các quán
    useEffect(() => {
        let isMounted = true;

        const fetchAllDishes = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await dishApi.getAllDishes();

                console.log("Dữ liệu tất cả món ăn:", response.data);

                if (!isMounted) return;

                const result = response.data;

                let dishList = [];

                if (Array.isArray(result)) {
                    dishList = result;
                } else if (Array.isArray(result?.data)) {
                    dishList = result.data;
                } else if (Array.isArray(result?.dishes)) {
                    dishList = result.dishes;
                }

                setDishes(dishList);
            } catch (err) {
                console.error("Lỗi lấy danh sách món ăn:", err);

                if (isMounted) {
                    setError(
                        err.response?.data?.message ||
                        "Không thể tải danh sách món ăn."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchAllDishes();

        return () => {
            isMounted = false;
        };
    }, []);

    // Tìm kiếm món ăn theo tên
    const filteredDishes = dishes.filter((dish) => {
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
                        <option value="tat-ca">Tất cả</option>
                        <option value="do-an">Đồ ăn</option>
                        <option value="do-uong">Đồ uống</option>
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

                        <label htmlFor="promotion" className="checkbox-title">
                            Đang khuyến mãi
                        </label>
                    </div>

                    <div className="menu-filter-checkbox">
                        <input
                            type="checkbox"
                            id="dishNew"
                            className="checkbox-input"
                        />

                        <label htmlFor="dishNew" className="checkbox-title">
                            Món mới
                        </label>
                    </div>
                </div>
            </div>

            {/* Danh sách tất cả món ăn */}
            <div className="menu-container-right">
                {loading ? (
                    <div className="menu-loading">
                        Đang tải danh sách món ăn...
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

export default Food;
