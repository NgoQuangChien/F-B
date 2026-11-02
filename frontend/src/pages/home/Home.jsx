
import React from 'react';
import { useState, useEffect } from 'react';
import branchApi from '../../api/businessApi';
import CardList from '../../components/card-list/CardList';

import './home.css'

function Home () {

    const [business, setBusiness] = useState([]);
    const [loading, setLoading] = useState(true);

    
    const fetchBusiness = async () => {
        try {
            setLoading(true);

            const result = await branchApi.getAllBusiness();

            console.log("Danh sách chi nhánh:", result.data);

            setBusiness(result.data.data || []);

        } catch (error) {
            console.error("Lỗi lấy danh sách chi nhánh:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusiness();
    }, []);

    


    return (
        <div className='home'>
            <div className="slogan">
                <h1>Hôm nay đi đâu, ăn gì?</h1>
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
                    <p className='title-category'>Gần đây</p>
                    <p className='more'>Xem thêm</p>
                </div>

                <CardList business={business} />
            </div>
        </div>
    )
}

export default Home;