const authModel = require("../models/authModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const generateAccessToken = (user, roles) => {
    return jwt.sign(
        {
            userId: user.userId,
            email: user.email,
            roles: roles.map((role) => ({
                roleId: role.roleId,
                roleName: role.roleName
            }))
        },
        process.env.JWT,
        { expiresIn: "5d" }
    );
};

const authController = {
    register: async (req, res) => {
        try {
            const {fullname, email, password } = req.body;

            const normalizedFullname = fullname.trim();
            const normalizedEmail = email.trim();
            const normalizedPassword = password.trim();

            if (!normalizedFullname || !normalizedEmail || !normalizedPassword) {
                return res.status(400).json({
                    message: "Vui lòng nhập đầy đủ thông tin!"
                });
            }

            
            if (normalizedFullname.length < 6) {
                return res.status(400).json({
                    message: "Họ và tên phải có ít nhất 6 ký tự!"
                });
            }

            if (normalizedFullname.length > 100) {
                return res.status(400).json({
                    message: "Họ và tên không được vượt quá 100 ký tự!"
                });
            }

            if (normalizedPassword.length < 8) {
                return res.status(400).json({
                    message: "Mật khẩu phải có ít nhất 8 ký tự!"
                });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(normalizedEmail)) {
                return res.status(400).json({
                    message: "Email không đúng định dạng"
                });
            }

            const existingUser = await authModel.getUserByEmail(normalizedEmail);

            if (existingUser) {
                return res.status(409).json({
                    message: "Email đã được sử dụng"
                });
            }

            const hashedPassword = await bcrypt.hash(normalizedPassword, 10);

            const defaultAvatar = process.env.DEFAULT_AVATAR_URL;

            if (!defaultAvatar) {
                console.error("Chưa có avatar");
            }

            const userId = await authModel.createUser({
                fullname: normalizedFullname,
                email: normalizedEmail,
                password: hashedPassword,
                avatar: defaultAvatar,
            });

            const roleAdded = await authModel.addUserRole(userId, "user");

            if (!roleAdded) {
                console.error("Không tìm thấy role user trong database");
            }

            return res.status(201).json({
                message: "Đăng ký tài khoản thành công"
            });

        } catch (error){
            
            console.error("Lỗi đăng ký:", error);

            return res.status(500).json({
                message: "Đã xảy ra lỗi khi đăng ký tài khoản"
            });
        }
    },

    login: async (req, res) => {
        try {
            const {email, password} = req.body;

            const normalizedEmail = email.trim();
            const normalizedPassword = password.trim();

            if (!normalizedEmail || !normalizedPassword) {
                return res.status(400).json({
                    message: "Vui lòng nhập đầy đủ thông tin!"
                });
            }

            const user = await authModel.getUserByEmail(normalizedEmail);

            if(!user) {
                return res.status(401).json({
                    message: "Email hoặc mật khẩu không chính xác!"
                })
            }

            const isPasswordCorrect = await bcrypt.compare(normalizedPassword, user.password);

            if (!isPasswordCorrect) {
                return res.status(401).json({
                    message: "Email hoặc mật khẩu không chính xác!"
                });
            }

            const roles = await authModel.getUserRoles(user.userId);

            const accessToken = generateAccessToken(user, roles);

            const { password: userPassword, ...otherInfo } = user;

            return res.status(200).json({
                message: "Đăng nhập thành công!",
                user: {
                    ...otherInfo,
                    roles
                },
                accessToken: accessToken
            });
            

        } catch(error){
            console.error("Lỗi đăng nhập:", error);

            return res.status(500).json({
                message: "Đã xảy ra lỗi khi đăng nhập"
            });
        }
    }
}

module.exports = authController