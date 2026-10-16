
import { NavLink } from 'react-router-dom'

import Logo from '../../../assets/image/logo-1.png'
import './footer.css'

function Footer() {
  return (
    <footer className='footer'>
      <div className='footer-container'>
        <div className='footer-section'>
          <img src={Logo} alt="Logo" className='footer-logo'/>
        </div>

        <div className='footer-section'>
          <p className='title-footer-section'>khám phá</p>
          <NavLink to="#" className='footer-section-item'>Tìm kiếm địa điểm</NavLink>
          <NavLink to="#" className='footer-section-item'>Đang khuyến mãi</NavLink>
        </div>

        <div className='footer-section'>
          <p className='title-footer-section'>Dành cho doanh nghiệp</p>
          <NavLink to="#" className='footer-section-item'>Đăng ký hồ sơ quán</NavLink>
          <NavLink to="#" className='footer-section-item'>Trở thành người giao hàng</NavLink>
          <NavLink to="#" className='footer-section-item'>Các câu hỏi thường gặp</NavLink>
        </div>

        <div className='footer-section'>
          <p className='title-footer-section'>Hỗ trợ</p>
          <NavLink to="#" className='footer-section-item'>Trung tâm trợ giúp</NavLink>
          <NavLink to="#" className='footer-section-item'>Báo cáo vi phạm</NavLink>
          <NavLink to="#" className='footer-section-item'>Điều khoản sử dụng</NavLink>
          <NavLink to="#" className='footer-section-item'>Chính sách bảo mật</NavLink>
        </div>
      </div>
    </footer>
  )
}

export default Footer