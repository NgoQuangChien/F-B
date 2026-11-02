import { useEffect, useState } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';

import { FaHeart } from 'react-icons/fa6';
import { FaMapMarkerAlt } from 'react-icons/fa';

import businessApi from '../../../api/businessApi';
import DinnerSet from '../../businesses-service/dinner-set/DinnerSet';

import './businessesDetailLayout.css';

function BusinessesDetailLayout() {
    const { businessId } = useParams();

    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDinnerSet, setShowDinnerSet] = useState(false);

    // Lấy thông tin quán
    useEffect(() => {
        const fetchBusinessDetail = async () => {
            try {
                setLoading(true);

                const response = await businessApi.getBusinessDetail(businessId);

                setBusiness(response.data.data);
            } catch (error) {
                console.error("Lỗi lấy thông tin quán:", error);
            } finally {
                setLoading(false);
            }
        };

        if (businessId) {
            fetchBusinessDetail();
        }
    }, [businessId]);

    if (loading) {
        return <div>Đang tải thông tin quán...</div>;
    }

    if (!business) {
        return <div>Không tìm thấy thông tin quán.</div>;
    }

    const handleGetDirections = () => {
        if (business.addressLink) {
            window.open(business.addressLink, "_blank", "noopener,noreferrer");
        } else if (business.address) {
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                business.address
            )}`;

            window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
        } else {
            alert("Quán chưa cập nhật địa chỉ.");
        }
    };

    return (
        <div className='businesses-detail-header'>
            
            <div className="businesses-detail-banner">
                {business.latitude != null &&
                business.longitude != null &&
                business.latitude !== "" &&
                business.longitude !== "" &&
                Number.isFinite(Number(business.latitude)) &&
                Number.isFinite(Number(business.longitude)) &&
                !(Number(business.latitude) === 0 && Number(business.longitude) === 0) ? (
                    <iframe
                        title={`Bản đồ ${business.businessName}`}
                        src={`https://www.google.com/maps?q=${business.latitude},${business.longitude}&z=16&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                ) : (
                    <div className="businesses-detail-map-empty">
                        <FaMapMarkerAlt />
                        <span>Quán chưa cập nhật vị trí</span>
                    </div>
                )}
            </div>
        

            <div className='businesses-detail-header-top'>
                <div className='businesses-detail-info'>
                    <div className='businesses-detail-title'>
                        {business.businessName}
                    </div>

                    <div className='businesses-detail-rating'>
                        5 sao
                    </div>
                </div>

                <div className='businesses-detail-actions'>
                    <button className='businesses-detail-actions-btn icon-heart'>
                        <FaHeart />
                    </button>

                    <button
                        className='businesses-detail-actions-btn booking-btn'
                        onClick={() => setShowDinnerSet(true)}
                    >
                        Đặt bàn
                    </button>

                    <button className='businesses-detail-actions-btn booking-btn'>
                        Đặt đồ
                    </button>

                    <button
                        type="button"
                        className="businesses-detail-actions-btn icon-map"
                        onClick={handleGetDirections}
                    >
                        <FaMapMarkerAlt /> Chỉ đường
                    </button>
                </div>

                {showDinnerSet && (
                    <DinnerSet
                        businessId={business.businessId}
                        onClose={() => setShowDinnerSet(false)}
                    />
                )}
            </div>

            <div className='businesses-detail-header-bottom'>
                <NavLink to="" end className='bottom-tabs'>
                    Giới thiệu
                </NavLink>

                <NavLink to="thuc-don" className='bottom-tabs'>
                    Menu
                </NavLink>

                <NavLink to="danh-gia" className='bottom-tabs'>
                    Đánh giá
                </NavLink>
            </div>

            <Outlet />
        </div>
    );
}

export default BusinessesDetailLayout;