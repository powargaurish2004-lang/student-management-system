import { useEffect, useMemo, useState } from "react";
import StudentForm from "./components/StudentForm";
import StudentList from "./components/StudentList";
import Button from "./components/Button";
import Modal from "./components/Modal";
import SearchBar from "./components/SearchBar";
import Toast from "./components/Toast";
import AuthPanel from "./components/AuthPanel";
import { clearSession, getToken, getUser, studentsApi } from "./api";
import "./App.css";

function App() {
  const [user, setUser] = useState(getUser);
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [darkMode, setDarkMode] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast({ message: "", type: "" }), 2500);
  };

  useEffect(() => {
    if (!user || !getToken()) return;

    setLoading(true);
    studentsApi.list()
      .then(setStudents)
      .catch((error) => {
        showToast(error.message, "error");
        if (error.message.toLowerCase().includes("token") || error.message.toLowerCase().includes("session") || error.message.toLowerCase().includes("unauthorized")) {
          clearSession();
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const closeFormModal = () => {
    setEditingStudent(null);
    setIsFormModalOpen(false);
  };

  const addStudent = async (data) => {
    try {
      setLoading(true);
      const student = await studentsApi.create({ ...data, name: data.name.trim() });
      setStudents((items) => [student, ...items]);
      closeFormModal();
      setCurrentPage(1);
      showToast("Student added successfully!");
      return true;
    } catch (error) {
      showToast(error.message, "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (data) => {
    if (!editingStudent?.id) return false;

    try {
      setLoading(true);
      const student = await studentsApi.update(editingStudent.id, {
        ...data,
        name: data.name.trim(),
      });
      setStudents((items) => items.map((item) => item.id === student.id ? student : item));
      closeFormModal();
      showToast("Student updated successfully!");
      return true;
    } catch (error) {
      showToast(error.message, "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id) => {
    const student = students.find((item) => item.id === id);
    if (!student || !window.confirm(`Are you sure you want to delete ${student.name}?`)) return;

    try {
      await studentsApi.remove(id);
      setStudents((items) => items.filter((item) => item.id !== id));
      showToast("Student deleted successfully!");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const toggleStatus = async (id) => {
    if (!id) {
      showToast("Student ID is missing.", "error");
      return;
    }

    try {
      const updated = await studentsApi.toggle(id);
      setStudents((items) => items.map((item) => item.id === updated.id ? updated : item));
      showToast("Student status updated.");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const filteredStudents = useMemo(() => {
    const result = students.filter((student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (courseFilter === "All" || student.course === courseFilter)
    );

    if (sortOrder === "name-asc") result.sort((a, b) => a.name.localeCompare(b.name));
    if (sortOrder === "name-desc") result.sort((a, b) => b.name.localeCompare(a.name));
    if (sortOrder === "age-asc") result.sort((a, b) => a.age - b.age);
    if (sortOrder === "age-desc") result.sort((a, b) => b.age - a.age);

    return result;
  }, [students, searchTerm, courseFilter, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, courseFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / 5));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * 5, currentPage * 5);
  const recentlyAdded = [...students]
    .sort((a, b) => new Date(b.createdAt || b.dateAdded) - new Date(a.createdAt || a.dateAdded))
    .slice(0, 5);

  const resetFilters = () => {
    setSearchTerm("");
    setCourseFilter("All");
    setSortOrder("default");
  };

  const courses = ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"];

  if (!user) {
    return <AuthPanel onAuthenticated={setUser} />;
  }

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <header className="header">
        <div>
          <h1>Student Management System</h1>
          <p>Private workspace for {user.name}</p>
        </div>

        <div className="header-actions">
          <Button className="theme-button" onClick={() => setDarkMode((value) => !value)}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>
          <Button className="secondary-button" onClick={() => { clearSession(); setUser(null); }}>
            Sign out
          </Button>
          <Button className="add-button" onClick={() => { setEditingStudent(null); setIsFormModalOpen(true); }}>
            + Add Student
          </Button>
        </div>
      </header>

      <main>
        <section className="recent-card">
          <h2>Recently Added Students</h2>
          {recentlyAdded.length ? (
            <div className="recent-list">
              {recentlyAdded.map((student) => (
                <div className="recent-item" key={student.id}>
                  <strong>{student.name}</strong>
                  <span>{student.course}</span>
                  <small>{student.dateAdded}</small>
                </div>
              ))}
            </div>
          ) : <p>No students added yet.</p>}
        </section>

        <section className="controls-card">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}>
            <option>All</option>
            {courses.map((course) => <option key={course}>{course}</option>)}
          </select>
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
            <option value="default">Default Order</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="age-asc">Age Low-High</option>
            <option value="age-desc">Age High-Low</option>
          </select>
          <Button className="reset-button" onClick={resetFilters}>Reset Filters</Button>
        </section>

        <div className="counts">
          <span>Total Students: <strong>{students.length}</strong></span>
          <span>Showing: <strong>{filteredStudents.length}</strong></span>
        </div>

        <StudentList
          students={paginatedStudents}
          onView={setViewingStudent}
          onEdit={(student) => { setEditingStudent(student); setIsFormModalOpen(true); }}
          onDelete={deleteStudent}
          onToggleStatus={toggleStatus}
        />

        {totalPages > 1 && (
          <div className="pagination">
            <Button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>Previous</Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>Next</Button>
          </div>
        )}
      </main>

      <Modal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        title={editingStudent ? "Edit Student" : "Add Student"}
      >
        <StudentForm
          editingStudent={editingStudent}
          onAddStudent={addStudent}
          onUpdateStudent={updateStudent}
          onCancelEdit={closeFormModal}
          loading={loading}
        />
      </Modal>

      <Modal
        isOpen={Boolean(viewingStudent)}
        onClose={() => setViewingStudent(null)}
        title="Student Details"
      >
        {viewingStudent && (
          <div className="details">
            {[
              ["Student ID", viewingStudent.studentId],
              ["Name", viewingStudent.name],
              ["Age", viewingStudent.age],
              ["Course", viewingStudent.course],
              ["Status", viewingStudent.status],
              ["Date Added", viewingStudent.dateAdded],
            ].map(([label, value]) => (
              <div key={label}>
                <strong>{label}</strong>
                <span>{value}</span>
              </div>
            ))}
            <Button className="close-button" onClick={() => setViewingStudent(null)}>
              Close
            </Button>
          </div>
        )}
      </Modal>

      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}

export default App;
