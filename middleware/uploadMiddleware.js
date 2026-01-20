import multer from "multer";
 const storage = multer.memoryStorage();
 const fileFilter = (req,file,cb)=>{
    const allowedMime = ['image/jpeg','image/png','image/gif']
    if (allowedMime.includes(file.mimetype)) {
        cb(null,true)
    } else {cb(new Error('สามารถรองรับไฟล์ jpeg,png,gif เท่านั้น'),false)}
 }
 const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5*1024*1024,
    }
 })
 export default upload