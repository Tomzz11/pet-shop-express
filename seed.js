import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';

dotenv.config();

// Sample Products Data
const products = [
  // Dog Products
  {
    name: 'อาหารสุนัข Royal Canin Adult',
    description: 'อาหารสุนัขโตพันธุ์กลาง สูตรครบถ้วน มีสารอาหารที่จำเป็นสำหรับสุนัขโตอายุ 1-7 ปี',
    price: 890,
    category: 'dog',
    stock: 50,
    image: '/images/products/dog-food.png'
  },
  {
    name: 'ของเล่นลูกบอลยาง สำหรับสุนัข',
    description: 'ลูกบอลยางคุณภาพสูง ทนทาน เหมาะสำหรับการเล่นและฝึกสุนัข',
    price: 150,
    category: 'dog',
    stock: 100,
    image: 'no pic'
  },
  {
    name: 'ปลอกคอสุนัข LED เรืองแสง',
    description: 'ปลอกคอ LED สำหรับสุนัข มองเห็นได้ในที่มืด ชาร์จ USB ได้',
    price: 350,
    category: 'dog',
    stock: 30,
    image: 'no pic'
  },
  {
    name: 'แชมพูสุนัข สูตรอ่อนโยน',
    description: 'แชมพูสุนัขสูตรอ่อนโยน ไม่ระคายเคืองผิว กลิ่นหอมติดทนนาน',
    price: 280,
    category: 'dog',
    stock: 45,
    image: 'no pic'
  },
  // Cat Products
  {
    name: 'อาหารแมว Whiskas รสปลาทู',
    description: 'อาหารแมวโตรสปลาทู อุดมไปด้วยโปรตีนและวิตามิน',
    price: 250,
    category: 'cat',
    stock: 80,
    image: '/images/products/cat-food.png'
  },
  {
    name: 'ทรายแมว Premium ไร้ฝุ่น',
    description: 'ทรายแมวเกรดพรีเมียม ไร้ฝุ่น จับตัวเป็นก้อนดี ดับกลิ่นได้ดีเยี่ยม',
    price: 320,
    category: 'cat',
    stock: 60,
    image: 'no pic'
  },
  {
    name: 'คอนโดแมว 3 ชั้น',
    description: 'คอนโดแมว 3 ชั้น มีที่ลับเล็บ ที่นอน และของเล่น',
    price: 1890,
    category: 'cat',
    stock: 15,
    image: 'no pic'
  },
  {
    name: 'ของเล่นแมว ไม้ตกแมว',
    description: 'ไม้ตกแมวพร้อมขนนก กระตุ้นสัญชาตญาณการล่าของแมว',
    price: 120,
    category: 'cat',
    stock: 150,
    image: '/images/products/cat-toy.png'
  },
  // Bird Products
  {
    name: 'อาหารนกแก้ว สูตรผลไม้รวม',
    description: 'อาหารนกแก้วผสมผลไม้รวม มีวิตามินและแร่ธาตุครบถ้วน',
    price: 180,
    category: 'bird',
    stock: 40,
    image: 'no pic'
  },
  {
    name: 'กรงนก ขนาดกลาง',
    description: 'กรงนกขนาดกลาง ทำจากเหล็กชุบ มีถาดรองด้านล่าง',
    price: 750,
    category: 'bird',
    stock: 20,
    image: '/images/products/bird-cage.png'
  },
  // Fish Products
  {
    name: 'อาหารปลาสวยงาม',
    description: 'อาหารปลาสวยงามชนิดเกล็ด เพิ่มสีสันให้ปลาสดใส',
    price: 85,
    category: 'fish',
    stock: 100,
    image: 'no pic'
  },
  {
    name: 'ตู้ปลา กระจก 24 นิ้ว',
    description: 'ตู้ปลากระจกใส ขนาด 24 นิ้ว พร้อมฝาปิดและไฟ LED',
    price: 1200,
    category: 'fish',
    stock: 10,
    image: 'no pic'
  },
  // Other Products
  {
    name: 'กระเป๋าใส่สัตว์เลี้ยง',
    description: 'กระเป๋าใส่สัตว์เลี้ยงพกพา ระบายอากาศดี น้ำหนักเบา',
    price: 590,
    category: 'other',
    stock: 25,
    image: '/images/products/pet-bag.png'
  },
  {
    name: 'แผ่นรองซับ สำหรับสัตว์เลี้ยง',
    description: 'แผ่นรองซับสำหรับสัตว์เลี้ยง ซึมซับดี ไม่รั่วซึม แพ็ค 50 แผ่น',
    price: 299,
    category: 'other',
    stock: 70,
    image: 'no pic'
  },
  {
    name: 'วิตามินรวม สำหรับสัตว์เลี้ยง',
    description: 'วิตามินรวมสำหรับสัตว์เลี้ยง เสริมสร้างภูมิคุ้มกัน บำรุงขนเงางาม',
    price: 450,
    category: 'other',
    stock: 35,
    image: 'no pic'
  }
];

// Admin User Data
const adminUser = {
  name: 'Admin',
  lastName: 'User',
  email: 'admin@maipaws.com',
  password: '123456',
  role: 'admin',
  phone: '0812345678',
  birthday: '1990-01-01',
  avatarUrl: 'no pic',
};

// Test User Data
const testUser = {
  name: 'Test User',
  lastName: 'User',
  email: 'user@petshop.com',
  password: 'user123',
  role: 'user',
  phone: '0812345678',
  birthday: '2020-01-01',
  avatarUrl: 'no pic',
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    console.log('🗑️ Cleared existing data');

    // Create admin user
    const admin = await User.create(adminUser);
    console.log(`👤 Admin created: ${admin.email}`);

    // Create test user
    const user = await User.create(testUser);
    console.log(`👤 Test user created: ${user.email}`);

    // Create products
    await Product.insertMany(products);
    console.log(`📦 ${products.length} products created`);

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }

};

seedDatabase();
