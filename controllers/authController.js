import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// =====================
// REGISTER (รองรับหลายที่อยู่)
// =====================
export const register = async (req, res) => {
  try {
    const {
      name,
      lastName,
      email,
      password,
      phone,
      birthday,
      avatarUrl,

      // optional: ส่งแบบเดิมมาก็ได้
      address,
      city,
      postalCode,

      // optional: ส่ง addresses มาเลยก็ได้
      addresses,
    } = req.body;

    if (!name || !email || !password || !phone || !lastName) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "อีเมลนี้ถูกใช้งานแล้ว",
      });
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "เบอร์โทรนี้ถูกใช้งานแล้ว",
      });
    }

    // ✅ สร้าง list ที่อยู่เริ่มต้น
    let initialAddresses = Array.isArray(addresses) ? addresses : [];

    // ถ้าไม่ได้ส่ง addresses มา แต่ส่ง address/city/postalCode มา → แปลงเป็น addresses[0]
    if (initialAddresses.length === 0 && (address || city || postalCode)) {
      initialAddresses = [
        {
          label: "Home",
          address: address || "",
          city: city || "",
          postalCode: postalCode || "",
          phone: phone || "",
          isDefault: true,
        },
      ];
    }

    const user = await User.create({
      name,
      lastName,
      email,
      password,
      phone,
      birthday,
      avatarUrl,
      addresses: initialAddresses,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ",
      data: {
        _id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        birthday: user.birthday,
        avatarUrl: user.avatarUrl,
        addresses: user.addresses,
        token,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก",
    });
  }
};

// =====================
// LOGIN (ถ้าจะให้ครบ ใส่ addresses ด้วยได้)
// =====================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "กรุณากรอกอีเมลและรหัสผ่าน",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      data: {
        _id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        token,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
    });
  }
};

// =====================
// GET ME (ส่ง addresses กลับไป)
// =====================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        birthday: user.birthday,
        avatarUrl: user.avatarUrl,
        addresses: user.addresses, // ✅ หลายที่อยู่
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้",
    });
  }
};

// =====================
// UPDATE PROFILE (ไม่ยุ่ง addresses)
// =====================
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบผู้ใช้",
      });
    }

    user.name = req.body.name ?? user.name;
    user.lastName = req.body.lastName ?? user.lastName;
    user.phone = req.body.phone ?? user.phone;
    user.birthday = req.body.birthday ?? user.birthday;
    user.avatarUrl = req.body.avatarUrl ?? user.avatarUrl;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "อัปเดตข้อมูลสำเร็จ",
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        birthday: updatedUser.birthday,
        avatarUrl: updatedUser.avatarUrl,
        addresses: updatedUser.addresses,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
    });
  }
};

// ==================================================
// ✅ Address APIs (หลายที่อยู่)
// ==================================================

// GET /api/auth/addresses
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user.addresses || [] });
  } catch (error) {
    console.error("Get Addresses Error:", error);
    res.status(500).json({ success: false, message: "โหลดที่อยู่ไม่สำเร็จ" });
  }
};

// POST /api/auth/addresses
export const addAddress = async (req, res) => {
  try {
    const { label, address, city, postalCode, phone } = req.body;

    if (!address) {
      return res.status(400).json({ success: false, message: "กรุณากรอกที่อยู่" });
    }

    const user = await User.findById(req.user._id);

    const isFirst = user.addresses.length === 0;
    user.addresses.push({
      label: label || "Home",
      address,
      city: city || "",
      postalCode: postalCode || "",
      phone: phone || user.phone || "",
      isDefault: isFirst, // ถ้าเป็นอันแรกให้เป็น default
    });

    await user.save();
    res.status(201).json({ success: true, message: "เพิ่มที่อยู่สำเร็จ", data: user.addresses });
  } catch (error) {
    console.error("Add Address Error:", error);
    res.status(500).json({ success: false, message: "เพิ่มที่อยู่ไม่สำเร็จ" });
  }
};

// PUT /api/auth/addresses/:addressId
export const updateAddress = async (req, res) => {
  try {
    const { label, address, city, postalCode, phone } = req.body;

    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);

    if (!addr) {
      return res.status(404).json({ success: false, message: "ไม่พบที่อยู่" });
    }

    addr.label = label ?? addr.label;
    addr.address = address ?? addr.address;
    addr.city = city ?? addr.city;
    addr.postalCode = postalCode ?? addr.postalCode;
    addr.phone = phone ?? addr.phone;

    await user.save();
    res.json({ success: true, message: "แก้ไขที่อยู่สำเร็จ", data: user.addresses });
  } catch (error) {
    console.error("Update Address Error:", error);
    res.status(500).json({ success: false, message: "แก้ไขที่อยู่ไม่สำเร็จ" });
  }
};

// DELETE /api/auth/addresses/:addressId
export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);

    if (!addr) {
      return res.status(404).json({ success: false, message: "ไม่พบที่อยู่" });
    }

    const wasDefault = addr.isDefault;
    addr.deleteOne();

    // ถ้าลบ default แล้วเหลือที่อยู่อื่น ให้ตั้งอันแรกเป็น default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses.forEach((a) => (a.isDefault = false));
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ success: true, message: "ลบที่อยู่สำเร็จ", data: user.addresses });
  } catch (error) {
    console.error("Delete Address Error:", error);
    res.status(500).json({ success: false, message: "ลบที่อยู่ไม่สำเร็จ" });
  }
};

// PUT /api/auth/addresses/:addressId/default
export const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addressId);

    if (!addr) {
      return res.status(404).json({ success: false, message: "ไม่พบที่อยู่" });
    }

    user.addresses.forEach((a) => (a.isDefault = false));
    addr.isDefault = true;

    await user.save();
    res.json({ success: true, message: "ตั้งค่าเริ่มต้นสำเร็จ", data: user.addresses });
  } catch (error) {
    console.error("Set Default Address Error:", error);
    res.status(500).json({ success: false, message: "ตั้งค่าเริ่มต้นไม่สำเร็จ" });
  }
};
