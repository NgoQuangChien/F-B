
import React from 'react';

import CardList from '../../components/card-list/CardList';

import './home.css'

function Home () {

    const branches = [
        {
            id: 1,
            businessesName: 'Highlands Coffee',
            branchName: 'Chi nhánh Cầu Giấy',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzT1nWe9uy2ENHMrlaBpyrktPo5Jkjp223j2rba1lETg&s=10',
            address: 'Cầu Giấy, Hà Nội',
            distance: '500 m',
            type: 'Quán cà phê',
            rating: 4.5
        },
        {
            id: 2,
            businessesName: 'Nhà hàng A',
            branchName: 'Chi nhánh Hà Nội',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzT1nWe9uy2ENHMrlaBpyrktPo5Jkjp223j2rba1lETg&s=10',
            address: 'Đống Đa, Hà Nội',
            distance: '1.2 km',
            type: 'Nhà hàng',
            rating: 4.2
        },

        {
            id: 3,
            businessesName: 'Highlands Coffee',
            branchName: 'Chi nhánh Cầu Giấy',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzT1nWe9uy2ENHMrlaBpyrktPo5Jkjp223j2rba1lETg&s=10',
            address: 'Cầu Giấy, Hà Nội',
            distance: '500 m',
            type: 'Quán cà phê',
            rating: 4.5
        },

        {
            id: 4,
            businessesName: 'Highlands Coffee',
            branchName: 'Chi nhánh Cầu Giấy',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzT1nWe9uy2ENHMrlaBpyrktPo5Jkjp223j2rba1lETg&s=10',
            address: 'Cầu Giấy, Hà Nội',
            distance: '500 m',
            type: 'Quán cà phê',
            rating: 4.5
        },

        {
            id: 5,
            businessesName: 'Highlands Coffee',
            branchName: 'Chi nhánh Cầu Giấy',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzT1nWe9uy2ENHMrlaBpyrktPo5Jkjp223j2rba1lETg&s=10',
            address: 'Cầu Giấy, Hà Nội',
            distance: '500 m',
            type: 'Quán cà phê',
            rating: 4.5
        },

        {
            id: 6,
            businessesName: 'Highlands Coffee',
            branchName: 'Chi nhánh Cầu Giấy',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzT1nWe9uy2ENHMrlaBpyrktPo5Jkjp223j2rba1lETg&s=10',
            address: 'Cầu Giấy, Hà Nội',
            distance: '500 m',
            type: 'Quán cà phê',
            rating: 4.5
        },
    ];

    return (
        <div className='home'>
            <div className="slogan">
                <h1>Hôm nay đi đâu, ăn gì?</h1>
                {/* <p>Khám phá và lựa chọn địa điểm ăn uống, giải trí phù hợp với sở thích của bạn</p> */}
            </div>

            <div className="search">
                <input type="text" placeholder='Tìm kiếm địa điểm ăn uống và giải trí...' />
                <button>Tìm kiếm</button>
            </div>

            <div className="business-promotion">
                <div className="business-promotion-text">
                    <h3>Bạn đăng kinh doanh?</h3>
                    <p>Bạn muốn đưa doanh nghiệp của mình đến với nhiều khách hàng hơn? Hãy đăng ký hồ sơ ngay hôm nay!</p>
                </div>

                <div className="business-promotion-button">
                    <button>Đăng ký hồ sơ ngay!</button>
                </div>
            </div>

            <div>
                <div className='category'>
                    <p className='title-category'>Đang khuyến mãi</p>
                    <p className='more'>Xem thêm</p>
                </div>

                <CardList branches={branches} />
            </div>

            <div>
                <div className='category'>
                    <p className='title-category'>Gần đây</p>
                    <p className='more'>Xem thêm</p>
                </div>

                <CardList branches={branches} />
            </div>
        </div>
    )
}

export default Home;