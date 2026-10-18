

import CardInfoBranch from '../../components/card-info-branch/CardInfoBranch';
import './cardList.css'

function CardList({ branches }) {
    return (
        <div className="card-list">
            {branches.map((branch) => (
                <CardInfoBranch
                    key={branch.id}
                    branch={branch}
                />
            ))}
        </div>
    );
}

export default CardList;