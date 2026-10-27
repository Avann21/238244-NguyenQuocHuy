const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Employee = require('../models/Employee');

// GET /api/employees (hỗ trợ query ?search=...)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      const keyword = search.trim();
      query = {
        $or: [
          { employeeId: { $regex: keyword, $options: 'i' } },
          { fullName: { $regex: keyword, $options: 'i' } }
        ]
      };
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách nhân viên',
      error: error.message
    });
  }
});

// GET /api/employees/:id (tìm theo _id hoặc employeeId)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let employee = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      employee = await Employee.findById(id);
    }
    if (!employee) {
      employee = await Employee.findOne({ employeeId: id });
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên'
      });
    }

    return res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tìm nhân viên',
      error: error.message
    });
  }
});

// POST /api/employees (thêm nhân viên mới)
router.post('/', async (req, res) => {
  try {
    const {
      employeeId,
      fullName,
      gender,
      dateOfBirth,
      department,
      position,
      email,
      phone,
      hireDate,
      status
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!employeeId || !employeeId.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Mã nhân viên là bắt buộc'
      });
    }
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Họ và tên là bắt buộc'
      });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email là bắt buộc'
      });
    }

    // Kiểm tra trùng lặp employeeId
    const existing = await Employee.findOne({ employeeId: employeeId.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Mã nhân viên '${employeeId}' đã tồn tại trong hệ thống`
      });
    }

    const newEmployee = new Employee({
      employeeId: employeeId.trim(),
      fullName: fullName.trim(),
      gender: gender || 'Nam',
      dateOfBirth: dateOfBirth || '',
      department: department || '',
      position: position || '',
      email: email.trim().toLowerCase(),
      phone: phone || '',
      hireDate: hireDate || '',
      status: status || 'Đang làm việc'
    });

    const savedEmployee = await newEmployee.save();

    return res.status(201).json({
      success: true,
      message: 'Thêm nhân viên thành công',
      data: savedEmployee
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi thêm nhân viên',
      error: error.message
    });
  }
});

// PUT /api/employees/:id (cập nhật thông tin nhân viên)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Tìm nhân viên hiện tại
    let employee = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      employee = await Employee.findById(id);
    }
    if (!employee) {
      employee = await Employee.findOne({ employeeId: id });
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên để cập nhật'
      });
    }

    // Nếu đổi employeeId thì kiểm tra trùng với nhân viên khác
    if (updateData.employeeId && updateData.employeeId !== employee.employeeId) {
      const duplicate = await Employee.findOne({
        employeeId: updateData.employeeId.trim(),
        _id: { $ne: employee._id }
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Mã nhân viên '${updateData.employeeId}' đã tồn tại`
        });
      }
      updateData.employeeId = updateData.employeeId.trim();
    }

    if (updateData.fullName) updateData.fullName = updateData.fullName.trim();
    if (updateData.email) updateData.email = updateData.email.trim().toLowerCase();

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employee._id,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Cập nhật nhân viên thành công',
      data: updatedEmployee
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật nhân viên',
      error: error.message
    });
  }
});

// DELETE /api/employees/:id (xóa nhân viên)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let employee = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      employee = await Employee.findById(id);
    }
    if (!employee) {
      employee = await Employee.findOne({ employeeId: id });
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên để xóa'
      });
    }

    await Employee.findByIdAndDelete(employee._id);

    return res.status(200).json({
      success: true,
      message: 'Xóa nhân viên thành công',
      data: employee
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa nhân viên',
      error: error.message
    });
  }
});

module.exports = router;

