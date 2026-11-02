


import "./evaluate.css";

const reviews = [
    {
        id: 1,
        fullname: "Nguyễn Văn A",
        date: "20/10/2026",
        rating: 5,
        content: "Không gian đẹp, đồ ăn ngon và nhân viên nhiệt tình.",
        images: []
    },
    {
        id: 2,
        fullname: "Trần Thị B",
        date: "19/10/2026",
        rating: 4,
        content: "Đồ uống ngon, giá cả hợp lý.",
        images: []
    },
    {
        id: 3,
        fullname: "Lê Văn C",
        date: "18/10/2026",
        rating: 5,
        content: "Dịch vụ tốt, sẽ quay lại lần sau.",
        images: []
    },
    {
        id: 4,
        fullname: "Phạm Thị D",
        date: "17/10/2026",
        rating: 4,
        content: "Quán sạch sẽ, không gian thoải mái.",
        images: []
    },
    {
        id: 5,
        fullname: "Hoàng Văn E",
        date: "16/10/2026",
        rating: 5,
        content: "Món ăn chất lượng, phục vụ nhanh.",
        images: []
    }
];

function Evaluate() {
    const averageRating = 4.6;
    const totalReviews = 128;

    return (
        <div className="evaluate-layout">
            {/* Danh sách đánh giá bên trái */}
            <div className="evaluate-list">
                {reviews.map((review) => (
                    <div className="evaluate-item" key={review.id}>
                        <div className="evaluate-avatar"></div>

                        <div className="evaluate-info">
                            <div className="evaluate-user">
                                <span className="evaluate-name">
                                    {review.fullname}
                                </span>

                                <span className="evaluate-date">
                                    {review.date}
                                </span>
                            </div>

                            <div className="evaluate-stars">
                                {/* Tính toán để hiện thị sao động thông qua điểm đánh giá */}
                                {"★".repeat(review.rating)}
                                {"☆".repeat(5 - review.rating)}
                            </div>

                            <p className="evaluate-content">
                                {review.content}
                            </p>

                            {review.images.length > 0 && (
                                <div className="evaluate-images">
                                    {review.images.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image}
                                            alt={`Ảnh đánh giá ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}

                            {review.images.length === 0 && (
                                <div className="evaluate-image-placeholder">
                                    Ảnh
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Sidebar bên phải */}
            <aside className="evaluate-sidebar">
                <h3 className="evaluate-sidebar-title">
                    Điểm đánh giá trung bình
                </h3>

                <div className="evaluate-rating-box">
                    <div className="evaluate-average">
                        {/* Định dạng điểm chính xác đến 1 chữ số thập phân sau dấu phẩy */}
                        {averageRating.toFixed(1)} 
                        <span>/ 5</span>
                    </div>

                    <div className="evaluate-rating-stars">
                        {/* Hiển thị 5 ngôi sao thông qua nhân bản chuỗi */}
                        {"★".repeat(5)}
                    </div>

                    <p>{totalReviews} lượt đánh giá</p>
                </div>
            </aside>
        </div>
    );
}

export default Evaluate;