
import {Link} from 'react-router-dom'

import './cardInfoBranch.css'

function CardInfoBranch ({branch}) {
    return(
        <div className='card-info-branch-link-container'>
            <Link to={`/thong-tin-chi-tiet-chi-nhanh`} className='card-info-branch-link'>
                <div className='card-info-branch-container'>
                    <img src={branch.image} alt="Hình ảnh" className='img-card-info-branch'/>
                    <div className="card-info-branch">
                        <span className='name-card-branch'>{branch.businessesName} - {branch.branchName}</span>
                        <span>Địa chỉ: {branch.address}</span>
                        <span>Khoảng cách: {branch.distance}</span>
                        <span>Loại hình: {branch.type}</span>
                        <span>sao {branch.rating}</span>
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default CardInfoBranch