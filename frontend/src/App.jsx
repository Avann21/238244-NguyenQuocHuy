import React, { useState, useEffect } from 'react';

// Cấu hình URL Backend từ biến môi trường Vite hoặc fallback localhost
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const initialFormState = {
  employeeId: '',
  fullName: '',
  gender: 'Nam',
  dateOfBirth: '',
  department: '',
  position: '',
  email: '',
  phone: '',
  hireDate: '',
  status: 'Đang làm việc'
};

function App() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
  const [formData, setFormData] = useState(initialFormState);
  const [currentId, setCurrentId] = useState(null);

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Hiển thị thông báo tự tắt sau 5s
  const showNotification = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 5000);
  };

  // Fetch danh sách nhân viên từ Backend
  const fetchEmployees = async (keyword = '') => {
    setIsLoading(true);
    try {
      let url = `${API_BASE_URL}/api/employees`;
      if (keyword.trim()) {
        url += `?search=${encodeURIComponent(keyword.trim())}`;
      }
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.success) {
        setEmployees(data.data || []);
      } else {
        showNotification('error', data.message || 'Không thể tải danh sách nhân viên');
      }
    } catch (error) {
      showNotification('error', 'Lỗi kết nối tới Backend API: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Tải danh sách khi load trang
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees(searchTerm);
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    fetchEmployees('');
  };

  // Mở modal thêm mới
  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setModalMode('create');
    setIsModalOpen(true);
  };

  // Mở modal xem thông tin
  const handleOpenView = (emp) => {
    setFormData(emp);
    setModalMode('view');
    setIsModalOpen(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEdit = (emp) => {
    setFormData(emp);
    setCurrentId(emp._id || emp.employeeId);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setCurrentId(null);
  };

  // Xử lý thay đổi form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form thêm hoặc sửa
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    // Validate dữ liệu bắt buộc
    if (!formData.employeeId.trim()) {
      showNotification('error', 'Vui lòng nhập Mã nhân viên!');
      return;
    }
    if (!formData.fullName.trim()) {
      showNotification('error', 'Vui lòng nhập Họ và tên!');
      return;
    }
    if (!formData.email.trim()) {
      showNotification('error', 'Vui lòng nhập Email!');
      return;
    }

    setIsLoading(true);
    try {
      let url = `${API_BASE_URL}/api/employees`;
      let method = 'POST';

      if (modalMode === 'edit') {
        url = `${API_BASE_URL}/api/employees/${currentId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification(
          'success',
          modalMode === 'edit'
            ? 'Cập nhật nhân viên thành công!'
            : 'Thêm nhân viên mới thành công!'
        );
        handleCloseModal();
        fetchEmployees(searchTerm);
      } else {
        showNotification('error', result.message || 'Thao tác không thành công');
      }
    } catch (error) {
      showNotification('error', 'Lỗi khi gửi dữ liệu: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Mở hộp thoại xác nhận xóa
  const handlePromptDelete = (emp) => {
    setDeleteTarget(emp);
  };

  // Thực hiện xóa nhân viên
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsLoading(true);
    try {
      const id = deleteTarget._id || deleteTarget.employeeId;
      const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (response.ok && result.success) {
        showNotification('success', `Đã xóa nhân viên ${deleteTarget.fullName}!`);
        setDeleteTarget(null);
        fetchEmployees(searchTerm);
      } else {
        showNotification('error', result.message || 'Không thể xóa nhân viên');
      }
    } catch (error) {
      showNotification('error', 'Lỗi xóa nhân viên: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-title">
          <h1>Hệ Thống Quản Lý Nhân Sự</h1>
          <p>Ứng dụng thực hành fullstack React - Node.js - MongoDB Atlas</p>
        </div>
        <div className="badge-info">
          Sinh viên: Nguyễn Quốc Huy | MSSV: 238244
        </div>
      </header>

      {/* Thông báo Alert */}
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          <span>{message.text}</span>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setMessage({ type: '', text: '' })}
          >
            ✕
          </button>
        </div>
      )}

      {/* Thanh công cụ Tìm kiếm & Thêm mới */}
      <div className="controls-bar">
        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Tìm theo mã nhân viên hoặc họ tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            🔍 Tìm
          </button>
          {searchTerm && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetSearch}
            >
              Đặt lại
            </button>
          )}
        </form>

        <button className="btn btn-primary" onClick={handleOpenCreate}>
          + Thêm nhân viên
        </button>
      </div>

      {/* Trạng thái tải */}
      {isLoading && (
        <div className="alert alert-info">
          <span>⏳ Đang xử lý dữ liệu... Vui lòng chờ...</span>
        </div>
      )}

      {/* Bảng danh sách nhân viên */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Họ và Tên</th>
              <th>Giới tính</th>
              <th>Phòng ban</th>
              <th>Chức vụ</th>
              <th>Email</th>
              <th>Số ĐT</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-state">
                  {isLoading
                    ? 'Đang tải dữ liệu nhân viên...'
                    : 'Không tìm thấy hồ sơ nhân viên nào.'}
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp._id || emp.employeeId}>
                  <td><strong>{emp.employeeId}</strong></td>
                  <td>{emp.fullName}</td>
                  <td>{emp.gender || '—'}</td>
                  <td>{emp.department || '—'}</td>
                  <td>{emp.position || '—'}</td>
                  <td>{emp.email}</td>
                  <td>{emp.phone || '—'}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        emp.status === 'Đang làm việc'
                          ? 'status-active'
                          : 'status-inactive'
                      }`}
                    >
                      {emp.status || 'Đang làm việc'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleOpenView(emp)}
                        title="Xem chi tiết"
                      >
                        👁 Xem
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleOpenEdit(emp)}
                        title="Chỉnh sửa"
                      >
                        ✏ Sửa
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handlePromptDelete(emp)}
                        title="Xóa hồ sơ"
                      >
                        🗑 Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm / Chỉnh Sửa / Xem chi tiết */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {modalMode === 'create' && 'Thêm Nhân Viên Mới'}
                {modalMode === 'edit' && 'Cập Nhật Hồ Sơ Nhân Viên'}
                {modalMode === 'view' && 'Chi Tiết Hồ Sơ Nhân Viên'}
              </h2>
              <button className="close-btn" onClick={handleCloseModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Mã nhân viên <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      placeholder="VD: NV001"
                      disabled={modalMode === 'view'}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Họ và tên <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="VD: Nguyễn Văn An"
                      disabled={modalMode === 'view'}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Giới tính</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Ngày sinh</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phòng ban</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="VD: Kỹ thuật, Kế toán..."
                      disabled={modalMode === 'view'}
                    />
                  </div>

                  <div className="form-group">
                    <label>Chức vụ</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="VD: Lập trình viên, Trưởng phòng..."
                      disabled={modalMode === 'view'}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="VD: an.nguyen@example.com"
                      disabled={modalMode === 'view'}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="VD: 0901234567"
                      disabled={modalMode === 'view'}
                    />
                  </div>

                  <div className="form-group">
                    <label>Ngày vào làm</label>
                    <input
                      type="date"
                      name="hireDate"
                      value={formData.hireDate}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                    />
                  </div>

                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                    >
                      <option value="Đang làm việc">Đang làm việc</option>
                      <option value="Nghỉ phép">Nghỉ phép</option>
                      <option value="Đã nghỉ việc">Đã nghỉ việc</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  {modalMode === 'view' ? 'Đóng' : 'Hủy bỏ'}
                </button>
                {modalMode !== 'view' && (
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'Đang lưu...' : 'Lưu hồ sơ'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h2>Xác Nhận Xóa Nhân Viên</h2>
              <button
                className="close-btn"
                onClick={() => setDeleteTarget(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa nhân viên{' '}
                <strong>{deleteTarget.fullName}</strong> (Mã:{' '}
                <code>{deleteTarget.employeeId}</code>) không?
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Hủy bỏ
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

