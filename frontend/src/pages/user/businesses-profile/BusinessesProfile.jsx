
import { use, useState } from 'react'

import './businessesProfile.css'

function BusinessesProfile () {

    const[businessesName, setBusinessesName] = useState('')
    const[branchName, setBranchName] = useState('')
    const[ownerName, setOwnerName] = useState('')

    const[addressBusinesses, setAddressBusinesses] = useState('')
    const[addressBranch, setAddressBranch] = useState('')
    const[latitudeBranch, setLatitudeBranch] = useState('')
    const[longitudeBranch, setLongitudeBranch] = useState('')

    const[phoneNumberBusinesses, setPhoneNumberBusinesses] = useState('')
    const[phoneNumberBranch, setPhoneNumberBranch] = useState('')
    const[emailBusinesses, setEmailBusinesses] = useState('')
    const[emailBranch, setEmailBranch] = useState('')
    const[imageBranch, setImageBranch] = useState([])

    const[citizenId, setCitizenId] = useState('')
    const[imageCitizenIdBefore, setImageCitizenIdBefore] = useState('')
    const[imageCitizenIdAfter, setImageCitizenIdAfter] = useState('')


    const [openingHours, setOpeningHours] = useState([
        {
            dayOfWeek: 'Thứ 2',
            openTime: '',
            closeTime: '',
            isClosed: false
        },
        {
            dayOfWeek: 'Thứ 3',
            openTime: '',
            closeTime: '',
            isClosed: false
        },
        {
            dayOfWeek: 'Thứ 4',
            openTime: '',
            closeTime: '',
            isClosed: false
        },
        {
            dayOfWeek: 'Thứ 5',
            openTime: '',
            closeTime: '',
            isClosed: false
        },
        {
            dayOfWeek: 'Thứ 6',
            openTime: '',
            closeTime: '',
            isClosed: false
        },
        {
            dayOfWeek: 'Thứ 7',
            openTime: '',
            closeTime: '',
            isClosed: false
        },
        {
            dayOfWeek: 'Chủ nhật',
            openTime: '',
            closeTime: '',
            isClosed: false
        }
    ]);

    return(
        <form className="bus-profile-container">
            <div>
                <p className='bus-title'>Thông tin cơ sở kinh doanh</p>

                <div className='bus-group-input'>
                    <label htmlFor="businessesName">Tên cơ sở kinh doanh</label>
                    <input 
                        className='bus-input-item'
                        id='businessesName'
                        name='businessesName'
                        value={businessesName}
                        onChange={(e) => setBusinessesName(e.target.value)}
                    />
                </div>

                <div className='bus-group-input'>
                    <label htmlFor="ownerName">Tên chủ cơ sở kinh doanh</label>
                    <input 
                        className='bus-input-item'
                        type="text"
                        id='ownerName'
                        name='ownerName'
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                    />
                </div>

                <div className='bus-group-input'>
                    <label htmlFor="phoneNumber">Số điện thoại</label>
                    <input 
                        className='bus-input-item'
                        type="text"
                        id='phoneNumber'
                        name='phoneNumber'
                        value={phoneNumberBusinesses}
                        onChange={(e) => setPhoneNumberBusinesses(e.target.value)}
                    />
                </div>

                <div className='bus-group-input'>
                    <label htmlFor="email">Email</label>
                    <input 
                        className='bus-input-item'
                        type="text"
                        id='email'
                        name='email'
                        value={emailBusinesses}
                        onChange={(e) => setEmailBusinesses(e.target.value)} 
                    />
                </div>

                <div className='bus-group-input'>
                    <label htmlFor="address">Địa chỉ</label>
                    <input 
                        className='bus-input-item'
                        type="text"
                        id='address'
                        name='address'
                        value={addressBusinesses}
                        onChange={(e) => setAddressBusinesses(e.target.value)}
                    /> 
                </div>

                <div className='bus-group-input'>
                    <label htmlFor="citizenId">Số căn cước công dân</label>
                    <input 
                        className='bus-input-item'
                        type="text"
                        id='citizenId'
                        name='citizenId'
                        value={citizenId}
                        onChange={(e) => setCitizenId(e.target.value)}
                    />
                </div>

                <div className='bus-group-input'>
                    <label htmlFor="imageCitizenId">Ảnh CCCD (mặt trước)</label>
                    <input 
                        className='bus-input-item'
                        type="file"
                        id='imageCitizenId'
                        name='imageCitizenId'
                        value={imageCitizenIdBefore}
                        onChange={(e) => setImageCitizenIdBefore(e.target.value)}
                    />
                </div>

                <div className='bus-group-input'>
                    <label htmlFor="imageCitizenId">Ảnh CCCD (mặt sau)</label>
                    <input 
                        className='bus-input-item'
                        type="file"
                        id='imageCitizenId'
                        name='imageCitizenId'
                        value={imageCitizenIdAfter}
                        onChange={(e) => setImageCitizenIdAfter(e.target.value)}
                    />
                </div>
            </div>

            <div className='bus-branch-info'>
                <div>
                    <p className='bus-title'>Thông tin chi nhánh gốc</p>
                    <div className='bus-group-input'>
                        <label htmlFor="branchName">Tên chi nhánh</label>
                        <input 
                            className='bus-input-item'
                            type="text" 
                            id='branchName'
                            name='branchName'
                            value={branchName}
                            onChange={(e) => setBranchName(e.target.value)}
                        />
                    </div>
                    <div className='bus-group-input'>
                        <label htmlFor="phoneNumberBranch">Số điện thoại</label>
                        <input 
                            className='bus-input-item'
                            type="text"
                            id='phoneNumberBranch'
                            name='phoneNumberBranch'
                            value={phoneNumberBranch}
                            onChange={(e) => setPhoneNumberBranch(e.target.value)}
                        />
                    </div>
                    <div className='bus-group-input'>
                        <label htmlFor="emailBranch">Email</label>
                        <input 
                            className='bus-input-item'
                            type="text"
                            id='emailbranch'
                            name='emailBranch'
                            value={emailBranch}
                            onChange={(e) => setEmailBranch(e.target.value)} 
                        />
                    </div>
                    <div className='bus-group-input'>
                        <label htmlFor="addressBranch">Địa chỉ chi nhánh</label>
                        <input 
                            className='bus-input-item'
                            type="text"
                            id='addressBranch'
                            name='addressbranch'
                            value={addressBranch}
                            onChange={(e) => setAddressBranch(e.target.value)}
                        /> 
                    </div>
                    
                    <div className='coordinates'>
                        <div className='bus-group-input'>
                            <label htmlFor="longitude">Kinh độ</label>
                            <input 
                                className='bus-input-item'
                                type="text"
                                id='longitude'
                                name='longitude'
                                value={longitudeBranch}
                                onChange={(e) => setLongitudeBranch(e.target.value)}
                            /> 
                        </div>
                        <div className='bus-group-input'>
                            <label htmlFor="latitude">Vĩ độ</label>
                            <input 
                                className='bus-input-item'
                                type="text"
                                id='latitude'
                                name='latitude'
                                value={latitudeBranch}
                                onChange={(e) => setLatitudeBranch(e.target.value)}
                            /> 
                        </div>
                    </div>
                    <div className='bus-group-input'>
                        <label htmlFor="introduce">Giới thiệu</label>
                    </div>

                    <div className='bus-group-input'>
                        <label htmlFor="imageBranch">Một số hình ảnh về chi nhánh</label>
                        <input
                            className="bus-input-item"
                            type="file"
                            id="imageBranch"
                            name="imageBranch"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                                setImageBranch(Array.from(e.target.files));
                            }}
                        />

                        {/* Hiển thị ảnh xem trước */}
                        <div className="bus-image-preview">
                            {imageBranch.map((image, index) => (
                                <div className="bus-image-item" key={index}>
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt={`Ảnh chi nhánh ${index + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bus-opening-hours">
                    <p className="bus-title">Giờ hoạt động</p>

                    <div className="bus-hours-table">
                        {/* Tiêu đề bảng */}
                        <div className="bus-hours-header">
                            <span>Thứ</span>
                            <span>Giờ mở cửa</span>
                            <span>Giờ đóng cửa</span>
                            <span>Trạng thái</span>
                        </div>

                        {/* Danh sách giờ hoạt động */}
                        {openingHours.map((day, index) => (
                            <div className="bus-hours-row" key={day.dayOfWeek}>
                                {/* Tên thứ */}
                                <span className="bus-day">
                                    {day.dayOfWeek}
                                </span>

                                {/* Giờ mở cửa */}
                                <div className="bus-group-time">
                                    <input
                                        type="time"
                                        id={`openTime-${index}`}
                                        value={day.openTime}
                                        disabled={day.isClosed}
                                        onChange={(e) => {
                                            const newOpeningHours = [...openingHours];

                                            newOpeningHours[index] = {
                                                ...newOpeningHours[index],
                                                openTime: e.target.value
                                            };

                                            setOpeningHours(newOpeningHours);
                                        }}
                                    />
                                </div>

                                {/* Giờ đóng cửa */}
                                <div className="bus-group-time">
                                    <input
                                        type="time"
                                        id={`closeTime-${index}`}
                                        value={day.closeTime}
                                        disabled={day.isClosed}
                                        onChange={(e) => {
                                            const newOpeningHours = [...openingHours];

                                            newOpeningHours[index] = {
                                                ...newOpeningHours[index],
                                                closeTime: e.target.value
                                            };

                                            setOpeningHours(newOpeningHours);
                                        }}
                                    />
                                </div>

                                {/* Checkbox nghỉ */}
                                <label className="bus-closed">
                                    <input
                                        type="checkbox"
                                        checked={day.isClosed}
                                        onChange={(e) => {
                                            const newOpeningHours = [...openingHours];

                                            newOpeningHours[index] = {
                                                ...newOpeningHours[index],
                                                isClosed: e.target.checked
                                            };

                                            setOpeningHours(newOpeningHours);
                                        }}
                                    />
                                    Nghỉ
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </form>
    )
}

export default BusinessesProfile