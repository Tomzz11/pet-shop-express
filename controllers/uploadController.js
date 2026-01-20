import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "ไม่พบไฟล์ที่อัพโหลด" });
    }

    // มี protect+admin อยู่แล้ว ตรงนี้จะเช็คซ้ำก็ได้ แต่ไม่จำเป็น
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "อัพโหลดได้เฉพาะแอดมินเท่านั้น" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "maipaws/products",
        resource_type: "auto",
        quality: "auto",
        width: 500,
        height: 500,
        crop: "fill",
        gravity: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ",
            error: error.message,
          });
        }

        return res.json({
          success: true,
          message: "อัพโหลดรูปภาพสินค้าสำเร็จ",
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            size: result.bytes,
          },
        });
      }
    );

    Readable.from(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error("Upload Product Image Error:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ",
      error: error.message,
    });
  }
};

export const uploadUserAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "ไม่มีไฟล์ที่อัพโหลด" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "pet-shop/avatars",
        resource_type: "auto",
        quality: "auto",
        width: 200,
        height: 200,
        crop: "fill",
        gravity: "face",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ",
            error: error.message,
          });
        }

        return res.json({
          success: true,
          message: "อัพโหลดรูปโปรไฟล์สำเร็จ",
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            size: result.bytes,
          },
        });
      }
    );

    Readable.from(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error("Upload User Avatar Error:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ",
      error: error.message,
    });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ success: false, message: "ไม่ได้ระบุ Public ID" });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return res.json({ success: true, message: "ลบรูปภาพสำเร็จ" });
    }

    return res.status(400).json({ success: false, message: "ไม่สามารถลบรูปภาพได้" });
  } catch (error) {
    console.error("Delete Image Error:", error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบรูปภาพ",
      error: error.message,
    });
  }
};
