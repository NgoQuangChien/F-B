import CardMenu from "../card-menu/CardMenu";
import "./menuList.css";

function MenuList({ dishes = [], onOrder }) {
    if (dishes.length === 0) {
        return (
            <div className="menu-list-empty">
                Không tìm thấy món ăn phù hợp.
            </div>
        );
    }

    return (
        <div className="menu-list">
            <div className="menu-list-content">
                {dishes.map((dish) => (
                    <CardMenu
                        key={dish.dishId}
                        dish={dish}
                        onOrder={onOrder}
                    />
                ))}
            </div>
        </div>
    );
}

export default MenuList;