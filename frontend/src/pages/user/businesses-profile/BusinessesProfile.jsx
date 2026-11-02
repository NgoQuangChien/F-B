
import { useState } from "react";
import { toast } from "react-toastify";

import businessApi from "../../../api/businessApi";
import "./businessesProfile.css";

function BusinessesProfile() {
    const [businessName, setBusinessName] = useState("");

    const [address, setAddress] = useState("");
    const [addressLink, setAddressLink] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");

    const [citizenId, setCitizenId] = useState("");

    // Ảnh đại diện quán
    const [imageBusiness, setImageBusiness] = useState(null);

    // Ảnh CCCD
    const [imageCitizenBefore, setImageCitizenBefore] = useState(null);
    const [imageCitizenAfter, setImageCitizenAfter] = useState(null);

    const [introduce, setIntroduce] = useState("");

    const [loading, setLoading] = useState(false);

    // Xóa dữ liệu form
    const resetForm = () => {
        setBusinessName("");

        setAddress("");
        setAddressLink("");
        setLatitude("");
        setLongitude("");

        setPhoneNumber("");
        setEmail("");

        setCitizenId("");

        setImageBusiness(null);
        setImageCitizenBefore(null);
        setImageCitizenAfter(null);

        setIntroduce("");

        // Xóa nội dung các input file
        document.getElementById("imageBusiness").value = "";
        document.getElementById("imageCitizenBefore").value = "";
        document.getElementById("imageCitizenAfter").value = "";
    };

    // Xử lý gửi form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra ảnh
        if (!imageBusiness) {
            toast.error("Vui lòng chọn ảnh đại diện quán!");
            return;
        }

        if (!imageCitizenBefore || !imageCitizenAfter) {
            toast.error("Vui lòng tải đủ ảnh CCCD mặt trước và mặt sau!");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();

            // Thông tin hồ sơ quán
            formData.append("businessName", businessName);
            formData.append("address", address);
            formData.append("addressLink", addressLink);
            formData.append("phone", phoneNumber);
            formData.append("email", email);
            formData.append("citizenId", citizenId);
            formData.append("introduce", introduce);
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);

            // Ảnh đại diện quán
            formData.append("imageBusiness", imageBusiness);

            // Ảnh CCCD
            formData.append("imageCitizenBefore", imageCitizenBefore);
            formData.append("imageCitizenAfter", imageCitizenAfter);

            // Gọi API
            const resultBusiness = await businessApi.createBusiness(formData);

            toast.success(
                resultBusiness.data.message ||
                "Đăng ký hồ sơ thành công, đang chờ duyệt!"
            );

            resetForm();

        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Đăng ký không thành công. Vui lòng thử lại!";

            toast.error(message);

            console.error("Lỗi đăng ký hồ sơ:", error);

        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            className="bus-profile-container"
            onSubmit={handleSubmit}
        >
            <div className="bus-profile-form">

                <p className="bus-title">
                    Thông tin cơ sở kinh doanh
                </p>

                {/* Tên quán */}
                <div className="bus-group-input">
                    <label htmlFor="businessName">
                        Tên cơ sở kinh doanh
                    </label>

                    <input
                        className="bus-input-item"
                        type="text"
                        id="businessName"
                        name="businessName"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                    />
                </div>

                {/* Ảnh đại diện quán */}
                <div className="bus-group-input">
                    <label htmlFor="imageBusiness">
                        Ảnh đại diện quán
                    </label>

                    <input
                        className="bus-input-item"
                        type="file"
                        id="imageBusiness"
                        name="imageBusiness"
                        accept="image/*"
                        onChange={(e) =>
                            setImageBusiness(e.target.files[0] || null)
                        }
                        required
                    />

                </div>

                {/* Số điện thoại */}
                <div className="bus-group-input">
                    <label htmlFor="phoneNumber">
                        Số điện thoại
                    </label>

                    <input
                        className="bus-input-item"
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                </div>

                {/* Email */}
                <div className="bus-group-input">
                    <label htmlFor="email">
                        Email
                    </label>

                    <input
                        className="bus-input-item"
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Địa chỉ */}
                <div className="bus-group-input">
                    <label htmlFor="address">
                        Địa chỉ
                    </label>

                    <input
                        className="bus-input-item"
                        type="text"
                        id="address"
                        name="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                </div>

                {/* Google Maps */}
                <div className="bus-group-input">
                    <label htmlFor="addressLink">
                        Đường dẫn địa chỉ Google Maps
                    </label>

                    <input
                        className="bus-input-item"
                        type="text"
                        id="addressLink"
                        name="addressLink"
                        value={addressLink}
                        onChange={(e) => setAddressLink(e.target.value)}
                    />
                </div>

                {/* Tọa độ */}
                <div className="coordinates">

                    <div className="bus-group-input">
                        <label htmlFor="longitude">
                            Kinh độ
                        </label>

                        <input
                            className="bus-input-item"
                            type="text"
                            id="longitude"
                            name="longitude"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                        />
                    </div>

                    <div className="bus-group-input">
                        <label htmlFor="latitude">
                            Vĩ độ
                        </label>

                        <input
                            className="bus-input-item"
                            type="text"
                            id="latitude"
                            name="latitude"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                        />
                    </div>

                </div>

                {/* Giới thiệu */}
                <div className="bus-group-input">
                    <label htmlFor="introduce">
                        Giới thiệu cơ sở kinh doanh
                    </label>

                    <textarea
                        className="bus-input-item"
                        id="introduce"
                        name="introduce"
                        value={introduce}
                        onChange={(e) => setIntroduce(e.target.value)}
                        rows="4"
                    />
                </div>

                {/* CCCD */}
                <div className="bus-group-input">
                    <label htmlFor="citizenId">
                        Số căn cước công dân
                    </label>

                    <input
                        className="bus-input-item"
                        type="text"
                        id="citizenId"
                        name="citizenId"
                        value={citizenId}
                        onChange={(e) => setCitizenId(e.target.value)}
                        required
                    />
                </div>

                {/* CCCD mặt trước */}
                <div className="bus-group-input">
                    <label htmlFor="imageCitizenBefore">
                        Ảnh CCCD (mặt trước)
                    </label>

                    <input
                        className="bus-input-item"
                        type="file"
                        id="imageCitizenBefore"
                        name="imageCitizenBefore"
                        accept="image/*"
                        onChange={(e) =>
                            setImageCitizenBefore(e.target.files[0] || null)
                        }
                        required
                    />


                </div>

                {/* CCCD mặt sau */}
                <div className="bus-group-input">
                    <label htmlFor="imageCitizenAfter">
                        Ảnh CCCD (mặt sau)
                    </label>

                    <input
                        className="bus-input-item"
                        type="file"
                        id="imageCitizenAfter"
                        name="imageCitizenAfter"
                        accept="image/*"
                        onChange={(e) =>
                            setImageCitizenAfter(e.target.files[0] || null)
                        }
                        required
                    />

        
                </div>

                {/* Nút đăng ký */}
                <div className="bus-group-input">
                    <button
                        className="btn-dk bus-input-item"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Đang đăng ký..." : "Đăng ký"}
                    </button>
                </div>

            </div>
        </form>
    );
}

export default BusinessesProfile;
