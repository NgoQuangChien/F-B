
import { useState } from "react";

import { toast } from "react-toastify";
import shipperApi from "../../../api/shipperApi";
import "./shipperProfile.css";

function ShipperProfile() {
    const [shipperName, setShipperName] = useState("");
    const [phone, setPhone] = useState("");
    const [citizenId, setCitizenId] = useState("");
    const [licensePlate, setLicensePlate] = useState("");
    const [vehicleType, setVehicleType] = useState("");

    // State lưu ảnh
    const [imageCitizenIdBefore, setImageCitizenIdBefore] = useState(null);
    const [imageCitizenIdAfter, setImageCitizenIdAfter] = useState(null);
    const [imageDrivingLicense, setImageDrivingLicense] = useState(null);

    // Reset form
    const resetForm = () => {
        setShipperName("");
        setPhone("");
        setCitizenId("");
        setLicensePlate("");
        setVehicleType("");

        setImageCitizenIdBefore(null);
        setImageCitizenIdAfter(null);
        setImageDrivingLicense(null);

        document.getElementById("imageCitizenIdBefore").value = "";
        document.getElementById("imageCitizenIdAfter").value = "";
        document.getElementById("imageDrivingLicense").value = "";
    };

    

    // Xử lý gửi form
    const handleSubmit = async(e) => {
        e.preventDefault();

        if (
            !imageCitizenIdBefore ||
            !imageCitizenIdAfter ||
            !imageDrivingLicense
        ) {
            toast.warning("Vui lòng tải lên tất cả các ảnh yêu cầu!");
            return;
        }

        try {
            const formData = new FormData();

            formData.append("shipperName", shipperName);
            formData.append("phone", phone);
            formData.append("citizenId", citizenId);
            formData.append("licensePlate", licensePlate);
            formData.append("vehicleType", vehicleType);

            formData.append("imageCitizenIdBefore", imageCitizenIdBefore);
            formData.append("imageCitizenIdAfter", imageCitizenIdAfter);
            formData.append("imageDrivingLicense", imageDrivingLicense);


            const resultShipper = await shipperApi.createShipper(formData);

            toast.success(
                resultShipper.data.message ||
                "Đăng ký hồ sơ thành công, đang chờ duyệt!"
            );
            
            resetForm();

        } catch (error) {
            const message =
                error.response?.data?.message ||  "Đăng ký không thành công. Vui lòng thử lại!";
            
            toast.error(message);
            console.error("Lỗi đăng ký hồ sơ:", error);
        }
    };

    return (
        <form className="shipper-form" onSubmit={handleSubmit}>
            <h2>Đăng ký hồ sơ giao hàng</h2>

            <div className="shipper-form-group">
                <label htmlFor="shipperName">Tên shipper</label>
                <input
                    id="shipperName"
                    type="text"
                    className={shipperName ? "has-value" : ""}
                    value={shipperName}
                    onChange={(e) => setShipperName(e.target.value)}
                    placeholder="Nhập tên shipper"
                    required
                />
            </div>

            <div className="shipper-form-group">
                <label htmlFor="phone">Số điện thoại</label>
                <input
                    id="phone"
                    type="tel"
                    className={phone ? "has-value" : ""}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    required
                />
            </div>

            <div className="shipper-form-group">
                <label htmlFor="citizenId">Số căn cước công dân</label>
                <input
                    id="citizenId"
                    type="text"
                    className={citizenId ? "has-value" : ""}
                    value={citizenId}
                    onChange={(e) => setCitizenId(e.target.value)}
                    placeholder="Nhập số CCCD gồm 12 chữ số"
                    required
                />
            </div>

            <div className="shipper-form-group">
                <label htmlFor="imageCitizenIdBefore">
                    Ảnh CCCD mặt trước
                </label>
                <input
                    id="imageCitizenIdBefore"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setImageCitizenIdBefore(e.target.files[0])
                    }
                    required
                />
            </div>

            <div className="shipper-form-group">
                <label htmlFor="imageCitizenIdAfter">
                    Ảnh CCCD mặt sau
                </label>
                <input
                    id="imageCitizenIdAfter"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setImageCitizenIdAfter(e.target.files[0])
                    }
                    required
                />
            </div>

            <div className="shipper-form-group">
                <label htmlFor="imageDrivingLicense">Ảnh bằng lái xe</label>
                <input
                    id="imageDrivingLicense"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setImageDrivingLicense(e.target.files[0])
                    }
                    required
                />
            </div>

            <div className="shipper-form-group">
                <label htmlFor="licensePlate">Biển số xe</label>
                <input
                    id="licensePlate"
                    type="text"
                    className={licensePlate ? "has-value" : ""}
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    placeholder="Nhập biển số xe"
                    required
                />
            </div>

            <div className="shipper-form-group">
                <label htmlFor="vehicleType">Loại phương tiện</label>
                <select
                    id="vehicleType"
                    className={vehicleType ? "has-value" : ""}
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    required
                >
                    <option value="">-- Chọn loại phương tiện --</option>
                    <option value="motorbike">Xe máy</option>
                    <option value="electric_bike">Xe đạp điện</option>
                    <option value="bicycle">Xe đạp</option>
                    <option value="car">Ô tô</option>
                </select>
            </div>

            <button type="submit" className="shipper-submit-btn">
                Đăng ký
            </button>
        </form>
    );
}

export default ShipperProfile;
