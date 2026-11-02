

import CardInfoBranch from '../../components/card-info-branch/CardInfoBranch';
import './cardList.css'

function CardList({ business = [] }) {
    return (
        <div className="card-list">
            {business.map((business) => (
                <CardInfoBranch
                    key={business.id}
                    business={business}
                />
            ))}
        </div>
    );
}

export default CardList;