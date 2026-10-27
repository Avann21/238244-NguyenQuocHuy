require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./models/Employee');

const sampleEmployees = [
  {
    employeeId: 'NV001',
    fullName: 'Nguyễn Văn An',
    gender: 'Nam',
    dateOfBirth: '1995-03-15',
    department: 'Kỹ thuật',
    position: 'Lập trình viên Senior',
    email: 'an.nguyen@example.com',
    phone: '0901234567',
    hireDate: '2021-01-10',
    status: 'Đang làm việc'
  },
  {
    employeeId: 'NV002',
    fullName: 'Trần Thị Bích',
    gender: 'Nữ',
    dateOfBirth: '1998-07-22',
    department: 'Kế toán',
    position: 'Chuyên viên kế toán',
    email: 'bich.tran@example.com',
    phone: '0912345678',
    hireDate: '2022-04-01',
    status: 'Đang làm việc'
  },
  {
    employeeId: 'NV003',
    fullName: 'Lê Hoàng Cường',
    gender: 'Nam',
    dateOfBirth: '1992-11-05',
    department: 'Nhân sự',
    position: 'Trưởng phòng nhân sự',
    email: 'cuong.le@example.com',
    phone: '0987654321',
    hireDate: '2019-09-15',
    status: 'Đang làm việc'
  }
];

const seedDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Loi: Vui long cau hinh bien MONGODB_URI trong file .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Ket noi MongoDB thanh cong. Dang them du lieu mau...');

    // Xóa dữ liệu cũ nếu muốn làm mới (hoặc chỉ chèn nếu chưa có)
    for (const emp of sampleEmployees) {
      await Employee.findOneAndUpdate(
        { employeeId: emp.employeeId },
        emp,
        { upsert: true, new: true }
      );
    }

    console.log('Da them thanh cong 3 nhan vien mau vao collection employees:');
    sampleEmployees.forEach(e => console.log(` - [${e.employeeId}] ${e.fullName} (${e.department})`));
    
    await mongoose.disconnect();
    console.log('Hoan tat!');
    process.exit(0);
  } catch (error) {
    console.error('Loi khi seed du lieu:', error.message);
    process.exit(1);
  }
};

seedDB();

