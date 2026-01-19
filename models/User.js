import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ✅ Address Subschema (หลายที่อยู่)
const userAddressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      maxlength: [30, "Label ต้องไม่เกิน 30 ตัวอักษร"],
      default: "Home",
    },
    address: {
      type: String,
      trim: true,
      required: [true, "กรุณากรอกที่อยู่"],
      maxlength: [200, "ที่อยู่ต้องไม่เกิน 200 ตัวอักษร"],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, "เมืองต้องไม่เกิน 100 ตัวอักษร"],
      default: "",
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: [10, "รหัสไปรษณีย์ต้องไม่เกิน 10 ตัวอักษร"],
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [10, "เบอร์โทรศัพท์ต้องไม่เกิน 10 ตัวอักษร"],
      minlength: [10, "เบอร์โทรศัพท์ต้องมีอย่างน้อย 10 ตัวอักษร"],
      default: "",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "กรุณากรอกชื่อ"],
      trim: true,
      maxlength: [50, "ชื่อต้องไม่เกิน 50 ตัวอักษร"],
    },
    lastName: {
      type: String,
      required: [true, "กรุณากรอกนามสกุล"],
      trim: true,
      maxlength: [50, "นามสกุลต้องไม่เกิน 50 ตัวอักษร"],
    },
    email: {
      type: String,
      required: [true, "กรุณากรอกอีเมล"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "กรุณากรอกอีเมลที่ถูกต้อง",
      ],
    },
    password: {
      type: String,
      required: [true, "กรุณากรอกรหัสผ่าน"],
      minlength: [6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    phone: {
      type: String,
      maxlength: [10, "เบอร์โทรศัพท์ต้องไม่เกิน 10 ตัวอักษร"],
      minlength: [10, "เบอร์โทรศัพท์ต้องมีอย่างน้อย 10 ตัวอักษร"],
      required: [true, "กรุณากรอกเบอร์โทรศัพท์"],
      trim: true,
    },
    birthday: { type: Date },
    avatarUrl: { type: String },

    // ✅ หลายที่อยู่เก็บเป็น array
    addresses: {
      type: [userAddressSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// ✅ ทำให้มี default address ได้แค่ 1 อัน (ไม่ใช้ next)
userSchema.pre("save", function () {
  if (this.isModified("addresses") && Array.isArray(this.addresses)) {
    const defaultCount = this.addresses.filter((a) => a.isDefault).length;

    // ถ้ามีมากกว่า 1 → ให้เหลืออันแรกเป็น default
    if (defaultCount > 1) {
      let found = false;
      this.addresses = this.addresses.map((a) => {
        if (a.isDefault && !found) {
          found = true;
          return a;
        }
        return { ...a.toObject(), isDefault: false };
      });
    }

    // ถ้ามีที่อยู่แต่ไม่มี default เลย → ตั้งอันแรกเป็น default
    if (this.addresses.length > 0 && defaultCount === 0) {
      this.addresses[0].isDefault = true;
    }
  }
});

// ✅ Hash password ก่อน save (ไม่ใช้ next)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ✅ Method เปรียบเทียบ password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
