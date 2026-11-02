import { Link } from "react-router-dom";
import "./cardInfoBranch.css";

const DEFAULT_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVJ3AZvyzhpitO0XaL98eWZNvV6_jp7N5kqsW_J2quMZuKOMkuKC_dD7o&s=10";

function CardInfoBranch({ business }) {
    if (!business) return null;

    return (
        <div className="card-info-branch-link-container">
            <Link
                to={`/thong-tin-chi-tiet-quan/${business.businessId}`}
                className="card-info-branch-link"
            >
                <div className="card-info-branch-container">
                    <img
                        src={business.imageBusiness || DEFAULT_IMAGE}
                        alt={business.businessName}
                        className="img-card-info-branch"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_IMAGE;
                        }}
                    />

                    <div className="card-info-branch">
                        <span className="name-card-branch">
                            {business.businessName}
                        </span>

                        <span>Địa chỉ: {business.address}</span>

                        <span>
                            Khoảng cách: {business.distance || "Chưa xác định"}
                        </span>

                        <span>
                            Loại hình: {business.type || "Chưa cập nhật"}
                        </span>

                        <span>
                            Đánh giá: {business.rating || "Chưa có đánh giá"}
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default CardInfoBranch;