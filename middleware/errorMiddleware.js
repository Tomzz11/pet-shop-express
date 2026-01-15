// Middleware จัดการ 404 Not Found
export const notFound = (req, res, next) => {
  const error = new Error(`ไม่พบ - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware จัดการ Error ทั่วไป
export const errorHandler = (err, req, res, next) => {
  // ถ้า status code ยังเป็น 200 ให้เปลี่ยนเป็น 500
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // จัดการ Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'ไม่พบข้อมูลที่ต้องการ';
  }

  // จัดการ Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // จัดการ Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} นี้มีอยู่ในระบบแล้ว`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
