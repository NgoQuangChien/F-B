import './branchImageModal.css';
import { FaXmark } from 'react-icons/fa6';

function BranchImageModal({ images, onClose }) {
    return (
        <div className="image-modal-overlay" onClick={onClose}>
            <div
                className="image-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="image-modal-header">
                    <h2>Tất cả hình ảnh ({images.length})</h2>

                    <button
                        type="button"
                        className="image-modal-close"
                        onClick={onClose}
                        aria-label="Đóng thư viện ảnh"
                    >
                        <FaXmark />
                    </button>
                </div>

                <div className="image-modal-gallery">
                    {images.map((image) => (
                        <img
                            key={image.id}
                            src={image.imageUrl}
                            alt="Hình ảnh chi nhánh"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default BranchImageModal;