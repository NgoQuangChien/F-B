
import React from 'react';
import './home.css'

function Home () {
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
        </div>
    )
}

export default Home;