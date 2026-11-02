import PostList from "../../../../components/post/post-list/PostList";

const samplePosts = [
    {
        postId: 1,
        businessId: 1,
        shopName: "Highlands Coffee - Hoàn Kiếm",
        author: "Nguyễn Văn A",
        avatar: "",
        time: "2 giờ trước",
        content: "Quán vừa cập nhật thực đơn mới với nhiều món hấp dẫn!",
        likeCount: 12,
        isLiked: false,
        images: [
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900",
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900",
            "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=900"
        ],
        comments: [
            {
                commentId: 1,
                fullname: "Trần Thị B",
                content: "Không gian quán đẹp quá!",
                time: "10 phút trước"
            }
        ]
    },
    {
        postId: 2,
        businessId: 2,
        shopName: "Nhà hàng Sao Mai",
        author: "Trần Văn B",
        avatar: "",
        time: "5 giờ trước",
        content: "Cuối tuần này quán có chương trình ưu đãi dành cho khách hàng.",
        likeCount: 25,
        isLiked: false,
        images: [
            "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=900"
        ],
        comments: []
    }
];

function Post() {
    const handleLike = (postId, isLiked) => {
        console.log("Bài đăng:", postId);
        console.log("Trạng thái thích:", isLiked);

        // Gọi API thích / bỏ thích tại đây
    };

    const handleAddComment = (postId, content) => {
        console.log("Bài đăng:", postId);
        console.log("Nội dung bình luận:", content);

        // Gọi API thêm bình luận tại đây
    };

    return (
        <div className="posts-page">
            <h2>Bài đăng mới nhất</h2>

            <PostList
                posts={samplePosts}
                onLike={handleLike}
                onAddComment={handleAddComment}
            />
        </div>
    );
}

export default Post;