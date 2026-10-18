
import { useState } from "react"

import './menu.css'
function Menu () {

    const[search, setSearch] = useState('')

    return (
        <div>
            <h1>Thực đơn</h1>
        
            <div>
                <div>
                    <input 
                        type="search"
                        placeholder="Nhập tên món ăn hoặc đồ uống"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div>
                    
                </div>
            </div>
        </div>
    )
}

export default Menu