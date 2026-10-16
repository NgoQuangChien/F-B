
import { use, useState } from 'react'

import './businessesProfile.css'

function BusinessesProfile () {

    const[businessesName, setBusinessesName] = useState('')
    const[ownerName, setOwnerName] = useState('')

    const[address, setAddress] = useState('')
    const[latitude, setLatitude] = useState('')
    const[longitude, setLongitude] = useState('')

    const[phoneNumber, setPhoneNumber] = useState('')
    const[citizenId, setCitizenId] = useState('')
    const[imageCitizenId, setImageCitizenId] = useState('')

    return(
        <div className="bus-profile-container">
            <table className="bus-profile-table">
                <tbody>
                    <td>
                        <tr>
                            <label htmlFor="businessesName">Tên cơ sở kinh doanh</label>
                        </tr>
                        <tr>
                            <input 
                                type="text"
                                id='businessesName'
                                name='businessesName'
                                value={businessesName}
                                onChange={(e) => setBusinessesName(e.target.value)}
                            />
                        </tr>

                        <tr>
                            <label htmlFor="ownerName">Tên chủ cơ sở kinh doanh</label>
                        </tr>
                        <tr>
                            <input 
                                type="text"
                                id='ownerName'
                                name='ownerName'
                                value={ownerName}
                                onChange={(e) => setOwnerName(e.target.value)}
                            />
                        </tr>

                        <tr>
                            <label htmlFor="address">Địa chỉ cơ sở kinh doanh</label>
                        </tr>
                        <tr>
                            <input 
                                type="text"
                                id='address'
                                name='address'
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </tr>

                        
                    </td>
                        
                    <td>
                        <tr>
                            <label htmlFor="phoneNumber">Số điện thoại</label>
                        </tr>
                        <tr>
                            <input 
                                type="text"
                                id='phoneNumber'
                                name='phoneNumber'
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </tr>

                        <tr>
                            <label htmlFor="citizenId">Số căn cước công dân</label>
                        </tr>
                        <tr>
                            <input 
                                type="text"
                                id='citizenId'
                                name='citizenId'
                                value={citizenId}
                                onChange={(e) => setCitizenId(e.target.value)}
                            />
                        </tr>

                        <tr>
                            <label htmlFor="imageCitizenId">Hình ảnh căn cước công dân</label>
                        </tr>
                        <tr>
                            <input 
                                type="file"
                                id='imageCitizenId'
                                name='imageCitizenId'
                                value={imageCitizenId}
                                onChange={(e) => setImageCitizenId(e.target.value)}
                            />
                        </tr>
                    </td>

                    <td>

                    </td>
                </tbody>
            </table>
        </div>
    )
}

export default BusinessesProfile