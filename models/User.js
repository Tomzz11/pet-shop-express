import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'กรุณากรอกชื่อ'],
      trim: true,
      maxlength: [50, 'ชื่อต้องไม่เกิน 50 ตัวอักษร']
    },
    email: {
      type: String,
      required: [true, 'กรุณากรอกอีเมล'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'กรุณากรอกอีเมลที่ถูกต้อง'
      ]
    },
    password: {
      type: String,
      required: [true, 'กรุณากรอกรหัสผ่าน'],
      minlength: [6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'],
      select: false // ไม่ดึง password มาเมื่อ query
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true // สร้าง createdAt และ updatedAt อัตโนมัติ
  }
);

// Hash password ก่อน save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method เปรียบเทียบ password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
