


import './branchGallery.css';

function BranchGallery({ images = [] }) {

    

    if (images.length === 0) {
        return <p>Chi nhánh chưa có hình ảnh.</p>;
    }

    return (
        <section className="branch-gallery">
            <div className="branch-gallery-list">
                {images.slice(0, 5).map((image) => (
                    <img
                        key={image.id}
                        src={image.imageUrl}
                        alt="Hình ảnh chi nhánh"
                    />
                ))}
            </div>
        </section>
    );
}

export default BranchGallery;