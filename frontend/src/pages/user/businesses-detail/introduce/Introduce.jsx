import { useState } from 'react';

import BranchGallery from '../../../../components/branch-gallery/BranchGallery'
import BranchImageModal from '../../../../components/branch-img-modal/BranchImgModal';

import { FaMapMarkerAlt, FaRegClock, FaStore, FaUtensils, FaCircle } from "react-icons/fa";

import './introduce.css'
function Introduce () {

    const [showAllImages, setShowAllImages] = useState(false);

    const images = [
        { id: 1, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtVtMLod7dAjptsq_lPhFEqC8qouIlnob1LzRpQfUATg&s=10' },
        { id: 2, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5KVBb1jbNKdzp45dNMNGcoko66sl1YwcnyquWRsdKptZA6asYWjUbXZms&s=10' },
        { id: 3, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQzKLluZc24wJ_VN1r56Cu2BAjHLMmxEKHsUmJigVTuQJmxXmLx5nT7EY&s=10' },
        { id: 4, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtVtMLod7dAjptsq_lPhFEqC8qouIlnob1LzRpQfUATg&s=10' },
        { id: 5, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5KVBb1jbNKdzp45dNMNGcoko66sl1YwcnyquWRsdKptZA6asYWjUbXZms&s=10' },
        { id: 6, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQzKLluZc24wJ_VN1r56Cu2BAjHLMmxEKHsUmJigVTuQJmxXmLx5nT7EY&s=10' },
        { id: 7, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtVtMLod7dAjptsq_lPhFEqC8qouIlnob1LzRpQfUATg&s=10' },
        { id: 8, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5KVBb1jbNKdzp45dNMNGcoko66sl1YwcnyquWRsdKptZA6asYWjUbXZms&s=10' },
        { id: 9, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQzKLluZc24wJ_VN1r56Cu2BAjHLMmxEKHsUmJigVTuQJmxXmLx5nT7EY&s=10' },
        { id: 10, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtVtMLod7dAjptsq_lPhFEqC8qouIlnob1LzRpQfUATg&s=10' },
        { id: 11, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5KVBb1jbNKdzp45dNMNGcoko66sl1YwcnyquWRsdKptZA6asYWjUbXZms&s=10' },
        { id: 12, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQzKLluZc24wJ_VN1r56Cu2BAjHLMmxEKHsUmJigVTuQJmxXmLx5nT7EY&s=10' },
    ];
    return (
        <div className='introduce-container'>
            <div className='introduce-info-branch'>
                <h2 className='introduce-title'>Thông tin chi nhánh</h2>
                <span className='introduce-title-item'><FaMapMarkerAlt className='introduce-icon'/> Địa chỉ</span>
                <span className='introduce-item'>90 - Cầu giấy - Hà Nội</span>
                <span className='introduce-title-item'><FaRegClock className='introduce-icon'/> Giờ hoạt động</span>
                <span className='introduce-item'>8:00 - 22:00 (Hôm hay) - <FaCircle className='icon-status'/> Đang hoạt động</span>
                <span className='introduce-title-item'><FaStore className='introduce-icon'/> Loại hình kinh doanh</span>
                <span className='introduce-item'>Nhà hàng, Coffee, Đồ ăn uống</span>
                <span className='introduce-title-item'><FaUtensils className='introduce-icon'/> Loại hình dịch vụ</span>
                <span className='introduce-item'>Đặt bàn, đặt món, đặt tiệc</span>

                <h2 className='introduce-title'>Giới thiệu</h2>
                <span className='introduce-item'>
                    Không gian ấm cúng, phục vụ các món ăn Việt Nam với thực đơn đa dạng, phù hợp cho gia đình và nhóm bạn.
                </span>

                <div className='introduce-img-container'>
                    <h2 className='introduce-title'>Một số hình ảnh</h2>
                    {images.length > 5 && (
                        <button
                            type="button"
                            className="show-more-images"
                            onClick={() => setShowAllImages(true)}
                        >
                            Xem thêm
                        </button>
                    )}
                </div>
                <BranchGallery images={images} />

                {showAllImages && (
                    <BranchImageModal
                        images={images}
                        onClose={() => setShowAllImages(false)}
                    />
                )}
            </div>

            <div className='introduce-info-branch'>
                <div>
                    <h2 className='introduce-title'>Điểm đánh giá</h2>
                    <div className='introduce-rating-container'>
                        <h1>4.5</h1>
                        <div className='introduce-info-rating'>
                            <span>sao</span>
                            <span>1200 lượt đánh giá</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className='introduce-title'>Bản đồ</h2>
                    <div className='introduce-map-container'>

                    </div>
                </div>

                <div>
                    <h2 className='introduce-title'>Các chi nhánh khác</h2>
                    <div className='introduce-other-branch'>
                        <img src="https://logo.sibic.vn//upload/image/20251003/6389510520908341953154112.jpg" alt="Avatar branch" className='introduce-avatar-branch'/>
                        <div className='info-other-branch'>
                            <span className='info-other-branch-title'>123 - Đống Đa - Hà Nội</span>
                            <span>sao 4.5</span>
                        </div>
                    </div>

                    <div className='introduce-other-branch'>
                        <img src="https://logo.sibic.vn//upload/image/20251003/6389510520908341953154112.jpg" alt="Avatar branch" className='introduce-avatar-branch'/>
                        <div className='info-other-branch'>
                            <span className='info-other-branch-title'>123 - Đống Đa - Hà Nội</span>
                            <span>sao 4.5</span>
                        </div>
                    </div>

                    <div className='introduce-other-branch'>
                        <img src="https://logo.sibic.vn//upload/image/20251003/6389510520908341953154112.jpg" alt="Avatar branch" className='introduce-avatar-branch'/>
                        <div className='info-other-branch'>
                            <span className='info-other-branch-title'>123 - Đống Đa - Hà Nội</span>
                            <span>sao 4.5</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Introduce