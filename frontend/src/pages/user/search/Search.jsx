import { useEffect, useState } from "react";
import CardInfoBranch from "../../../components/card-info-branch/CardInfoBranch";
import businessApi from "../../../api/businessApi";
import "./search.css";

function Search() {
  const [business, setBusiness] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy toàn bộ danh sách chi nhánh
  const fetchBusiness = async () => {
      try {
          const result = await businessApi.getAllBusiness();

          console.log("Dữ liệu quán:", result);
          console.log("Danh sách quán:", result.data.data);

          setBusiness(result.data.data || []);
      } catch (error) {
          console.error("Lỗi lấy danh sách quán:", error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchBusiness();
  }, []);

  return (
    <div className="search-page">
      <div className="search-page-layout">
        {/* Bộ lọc */}
        <div className="search-filter">
          <div className="filter-group">
            <label>Tìm kiếm</label>
            <input
              type="text"
              className="search-input"
              placeholder="Nhập tên địa điểm..."
            />
          </div>

          <div className="filter-group">
            <h3>Loại hình dịch vụ</h3>

            {["Nhà hàng", "Quán cà phê", "Quán ăn", "Karaoke", "Khu vui chơi"].map(
              (type) => (
                <label className="filter-option" key={type}>
                  <input type="checkbox" />
                  {type}
                </label>
              )
            )}
          </div>

          <div className="filter-group">
            <h3>Khu vực</h3>

            <select defaultValue="">
              <option value="" disabled>
                Chọn tỉnh/thành phố
              </option>
              <option>Hà Nội</option>
              <option>Hồ Chí Minh</option>
              <option>Cần Thơ</option>
            </select>

            <select defaultValue="">
              <option value="" disabled>
                Chọn quận/huyện
              </option>
              <option>Cầu Giấy</option>
              <option>Đống Đa</option>
              <option>Ba Đình</option>
            </select>
          </div>

          <div className="filter-group">
            <h3>Khoảng cách</h3>

            {["Dưới 1 km", "Dưới 3 km", "Dưới 5 km"].map((distance) => (
              <label className="filter-option" key={distance}>
                <input type="radio" name="distance" />
                {distance}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h3>Đánh giá</h3>

            {["Từ 5 sao", "Từ 4 sao trở lên", "Từ 3 sao trở lên"].map(
              (rating) => (
                <label className="filter-option" key={rating}>
                  <input type="radio" name="rating" />
                  {rating}
                </label>
              )
            )}
          </div>
        </div>

        {/* Danh sách kết quả */}
        <div className="search-results">
          <div className="search-results-heading">
            <div>
              <h2>Địa điểm dành cho bạn</h2>
              <p>
                Có {business.length} kết quả phù hợp
              </p>
            </div>

            <select defaultValue="default">
              <option value="default">Sắp xếp mặc định</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="distance">Gần bạn nhất</option>
            </select>
          </div>

          <div className="search-results-list">
            {loading ? (
                <p>Đang tải danh sách địa điểm...</p>
            ) : business.length > 0 ? (
                business.map((biz) => (
                    <CardInfoBranch
                        key={ biz.businessId}
                        business={biz}
                    />
                ))
            ) : (
                <p>Chưa có địa điểm nào.</p>
            )}
        </div>
        </div>
      </div>
    </div>
  );
}

export default Search;