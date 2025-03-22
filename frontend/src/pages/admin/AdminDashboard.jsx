import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUsers,
  FaBookOpen,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaSignOutAlt,
  FaUserShield,
  FaChartLine,
  FaVideo,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaBars,
} from "react-icons/fa";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalLectures: 0,
    totalEnrollments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [confirmAction, setConfirmAction] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check admin authentication
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const userRole = localStorage.getItem("userRole");

    if (!adminToken && userRole !== "admin") {
      navigate("/admin-login");
    }
  }, [navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch courses
        const coursesResponse = await axios.get(
          "http://localhost:5000/api/courses",
          { headers }
        );
        setCourses(coursesResponse.data);

        // Fetch users
        const usersResponse = await axios.get(
          "http://localhost:5000/api/admin/users",
          { headers }
        );
        setUsers(usersResponse.data);

        // Fetch lectures
        const lecturesResponse = await axios.get(
          "http://localhost:5000/api/lectures",
          { headers }
        );
        setLectures(lecturesResponse.data);

        // Set statistics
        setStats({
          totalCourses: coursesResponse.data.length,
          totalStudents: usersResponse.data.filter(
            (user) => user.role === "student"
          ).length,
          totalTeachers: usersResponse.data.filter(
            (user) => user.role === "teacher"
          ).length,
          totalLectures: lecturesResponse.data.length,
          totalEnrollments: Math.floor(Math.random() * 1000), // Placeholder for actual enrollment data
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle delete course
  const handleDeleteCourse = async (id) => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCourses(courses.filter((course) => course._id !== id));
      setConfirmAction(null);

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalCourses: prev.totalCourses - 1,
      }));
    } catch (error) {
      console.error("Error deleting course:", error);
      setError("Failed to delete course. Please try again.");
    }
  };

  // Handle delete lecture
  const handleDeleteLecture = async (id) => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/admin/delete-lecture/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLectures(lectures.filter((lecture) => lecture._id !== id));
      setConfirmAction(null);

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalLectures: prev.totalLectures - 1,
      }));
    } catch (error) {
      console.error("Error deleting lecture:", error);
      setError("Failed to delete lecture. Please try again.");
    }
  };

  // Handle delete user
  const handleDeleteUser = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const deletedUser = users.find((user) => user._id === id);
      setUsers(users.filter((user) => user._id !== id));
      setConfirmAction(null);

      // Update stats
      if (deletedUser) {
        if (deletedUser.role === "student") {
          setStats((prev) => ({
            ...prev,
            totalStudents: prev.totalStudents - 1,
          }));
        } else if (deletedUser.role === "teacher") {
          setStats((prev) => ({
            ...prev,
            totalTeachers: prev.totalTeachers - 1,
          }));
        }
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user. Please try again.");
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Filter courses based on search and filter
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "free") return matchesSearch && course.price === 0;
    if (filter === "paid") return matchesSearch && course.price > 0;
    return matchesSearch;
  });

  // Filter lectures based on search
  const filteredLectures = lectures.filter((lecture) => {
    return lecture.title?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filter users based on search and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "student") return matchesSearch && user.role === "student";
    if (filter === "teacher") return matchesSearch && user.role === "teacher";
    if (filter === "admin") return matchesSearch && user.role === "admin";
    return matchesSearch;
  });

  // Confirmation dialog
  const ConfirmationDialog = ({ title, message, onConfirm, onCancel }) => (
    <div className="confirmation-overlay">
      <div className="confirmation-dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirmation-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-btn" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  // Mobile header with sidebar toggle
  const MobileHeader = () => (
    <div className="mobile-header">
      <button className="toggle-btn" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <h1>Admin Panel</h1>
    </div>
  );

  // Render dashboard content based on active tab
  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "courses":
        return renderCourses();
      case "lectures":
        return renderLectures();
      case "users":
        return renderUsers();
      default:
        return renderOverview();
    }
  };

  // Render overview tab
  const renderOverview = () => (
    <div className="overview-container">
      <h2>Dashboard Overview</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaBookOpen />
          </div>
          <div className="stat-info">
            <h3>{stats.totalCourses}</h3>
            <p>Courses</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaGraduationCap />
          </div>
          <div className="stat-info">
            <h3>{stats.totalStudents}</h3>
            <p>Students</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaChalkboardTeacher />
          </div>
          <div className="stat-info">
            <h3>{stats.totalTeachers}</h3>
            <p>Teachers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaVideo />
          </div>
          <div className="stat-info">
            <h3>{stats.totalLectures}</h3>
            <p>Lectures</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-info">
            <h3>{stats.totalEnrollments}</h3>
            <p>Enrollments</p>
          </div>
        </div>
      </div>

      <div className="recent-section">
        <div className="section-header">
          <h3>Recent Courses</h3>
          <Link
            to="#"
            onClick={() => setActiveTab("courses")}
            className="view-all"
          >
            View All
          </Link>
        </div>
        <div className="recent-items">
          {courses.slice(0, 3).map((course) => (
            <div key={course._id} className="recent-item">
              <div className="item-image">
                <img
                  src={
                    course.image?.startsWith("http")
                      ? course.image
                      : `http://localhost:5000/${course.image}`
                  }
                  alt={course.title}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/100x60?text=Course";
                  }}
                />
              </div>
              <div className="item-info">
                <h4>{course.title}</h4>
                <p>by {course.instructor}</p>
              </div>
              <div className="item-price">
                {course.price === 0 ? (
                  <span className="free-tag">Free</span>
                ) : (
                  <span>${course.price}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-section">
        <div className="section-header">
          <h3>Recent Users</h3>
          <Link
            to="#"
            onClick={() => setActiveTab("users")}
            className="view-all"
          >
            View All
          </Link>
        </div>
        <div className="recent-items">
          {users.slice(0, 3).map((user) => (
            <div key={user._id} className="recent-item">
              <div className="item-icon">
                {user.role === "student" ? (
                  <FaGraduationCap />
                ) : user.role === "teacher" ? (
                  <FaChalkboardTeacher />
                ) : (
                  <FaUserShield />
                )}
              </div>
              <div className="item-info">
                <h4>{user.name}</h4>
                <p>{user.email}</p>
              </div>
              <div className="item-role">
                <span className={`role-tag ${user.role}`}>{user.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render courses tab
  const renderCourses = () => (
    <div className="courses-container">
      <div className="tab-header">
        <h2>Manage Courses</h2>
        <Link to="/create/courses" className="action-button">
          <FaPlus /> New Course
        </Link>
      </div>

      <div className="filters">
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <FaFilter />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Courses</option>
            <option value="free">Free Courses</option>
            <option value="paid">Paid Courses</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Instructor</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Lectures</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => (
              <tr key={course._id}>
                <td>{course.title}</td>
                <td>{course.instructor}</td>
                <td>{course.price === 0 ? "Free" : `$${course.price}`}</td>
                <td>{course.duration} hours</td>
                <td>{course.lectures?.length}</td>
                <td className="actions">
                  <Link
                    to={`/course/${course._id}`}
                    className="action-icon"
                    title="View Course"
                  >
                    <FaEye />
                  </Link>
                  <Link
                    to={`/edit-course/${course._id}`}
                    className="action-icon"
                    title="Edit Course"
                  >
                    <FaEdit />
                  </Link>
                  <Link
                    to={`/course/${course._id}/lectures/add`}
                    className="action-icon add"
                    title="Add Lecture"
                  >
                    <FaPlus />
                  </Link>
                  <button
                    className="action-icon delete"
                    title="Delete Course"
                    onClick={() =>
                      setConfirmAction({
                        type: "course",
                        id: course._id,
                        title: "Delete Course",
                        message: `Are you sure you want to delete "${course.title}"? This action cannot be undone.`,
                      })
                    }
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {filteredCourses.length === 0 && (
              <tr>
                <td colSpan="6" className="no-data">
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render lectures tab
  const renderLectures = () => (
    <div className="lectures-container">
      <div className="tab-header">
        <h2>Manage Lectures</h2>
      </div>

      <div className="filters">
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Search lectures..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Course</th>
              <th>Duration</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLectures.map((lecture) => {
              const course = courses.find((c) => c._id === lecture.course);
              return (
                <tr key={lecture._id}>
                  <td>{lecture.title}</td>
                  <td>{course ? course.title : "Unknown Course"}</td>
                  <td>{lecture.duration || "N/A"} min</td>
                  <td>{lecture.type || "Video"}</td>
                  <td className="actions">
                    <Link
                      to={`/lecture/${lecture._id}`}
                      className="action-icon"
                      title="View Lecture"
                    >
                      <FaEye />
                    </Link>
                    <Link
                      to={`/lecture/${lecture._id}/edit`}
                      className="action-icon"
                      title="Edit Lecture"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      className="action-icon delete"
                      title="Delete Lecture"
                      onClick={() =>
                        setConfirmAction({
                          type: "lecture",
                          id: lecture._id,
                          title: "Delete Lecture",
                          message: `Are you sure you want to delete "${lecture.title}"? This action cannot be undone.`,
                        })
                      }
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredLectures.length === 0 && (
              <tr>
                <td colSpan="5" className="no-data">
                  No lectures found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render users tab
  const renderUsers = () => (
    <div className="users-container">
      <div className="tab-header">
        <h2>Manage Users</h2>
      </div>

      <div className="filters">
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <FaFilter />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Users</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-tag ${user.role}`}>{user.role}</span>
                </td>
                <td>
                  {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </td>
                <td className="actions">
                  <Link
                    to={`/user/${user._id}`}
                    className="action-icon"
                    title="View User Profile"
                  >
                    <FaEye />
                  </Link>
                  <Link
                    to={`/user/${user._id}/edit`}
                    className="action-icon"
                    title="Edit User"
                  >
                    <FaEdit />
                  </Link>
                  {user.role !== "admin" && (
                    <button
                      className="action-icon delete"
                      title="Delete User"
                      onClick={() =>
                        setConfirmAction({
                          type: "user",
                          id: user._id,
                          title: "Delete User",
                          message: `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`,
                        })
                      }
                    >
                      <FaTrash />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="no-data">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      {/* Mobile Header (visible only on small screens) */}
      <div className="mobile-only">
        <MobileHeader />
      </div>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${!sidebarOpen ? "closed" : ""}`}>
        <div className="sidebar-header">
          <h1>Admin Panel</h1>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li
              className={activeTab === "overview" ? "active" : ""}
              onClick={() => setActiveTab("overview")}
            >
              <FaChartLine /> <span>Overview</span>
            </li>
            <li
              className={activeTab === "courses" ? "active" : ""}
              onClick={() => setActiveTab("courses")}
            >
              <FaBookOpen /> <span>Courses</span>
            </li>
            <li
              className={activeTab === "lectures" ? "active" : ""}
              onClick={() => setActiveTab("lectures")}
            >
              <FaVideo /> <span>Lectures</span>
            </li>
            <li
              className={activeTab === "users" ? "active" : ""}
              onClick={() => setActiveTab("users")}
            >
              <FaUsers /> <span>Users</span>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">{renderContent()}</main>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ConfirmationDialog
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={() => {
            if (confirmAction.type === "course") {
              handleDeleteCourse(confirmAction.id);
            } else if (confirmAction.type === "lecture") {
              handleDeleteLecture(confirmAction.id);
            } else if (confirmAction.type === "user") {
              handleDeleteUser(confirmAction.id);
            }
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
