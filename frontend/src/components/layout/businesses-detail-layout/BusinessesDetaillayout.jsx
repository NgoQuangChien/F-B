
import { NavLink } from 'react-router-dom';

import { Outlet } from 'react-router-dom';

import { FaHeart} from 'react-icons/fa6'
import { FaMapMarkerAlt } from "react-icons/fa";

import './businessesDetailLayout.css'

function BusinessesDetailLayout () {
    return(
        <div className='businesses-detail-header'>
            <div className='businesses-detail-banner'>
            </div>
            
            <div className='businesses-detail-header-top'>
                <div className='businesses-detail-info'>
                    <div className='businesses-detail-title'>Tên quán - Tên chi nhánh</div>
                    <div className='businesses-detail-rating'>5 sao</div>
                </div>

                <div className='businesses-detail-actions'>
                    <button className='businesses-detail-actions-btn icon-heart'><FaHeart /></button>
                    <button className='businesses-detail-actions-btn booking-btn'>Đặt bàn</button>
                    <button className='businesses-detail-actions-btn booking-btn'>Đặt đồ</button>
                    <button className='businesses-detail-actions-btn icon-map'><FaMapMarkerAlt /> Chỉ đường</button>
                </div>
            </div>

            <div className='businesses-detail-header-bottom'>
                <NavLink to="" className='bottom-tabs'>Giới thiệu</NavLink>
                <NavLink to="" className='bottom-tabs'>Menu</NavLink>
                <NavLink to="" className='bottom-tabs'>Đánh giá</NavLink>
                <NavLink to="" className='bottom-tabs'>Bài đăng</NavLink>
            </div>

            <Outlet/>
        </div>
    )
}

export default BusinessesDetailLayout