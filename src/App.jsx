import { useEffect, useMemo, useState } from "react";

import StudentForm from "./components/StudentForm";
import StudentList from "./components/StudentList";
import Button from "./components/Button";
import Modal from "./components/Modal";
import SearchBar from "./components/SearchBar";
import Toast from "./components/Toast";

import "./App.css";

function App() {
  // ---------------------------------------------
  // STUDENT DATA
  // ---------------------------------------------

  const [students, setStudents] = useState(() => {
    const savedStudents = localStorage.getItem("students");

    return savedStudents
      ? JSON.parse(savedStudents)
      : [];
  });

  // Student being edited
  const [editingStudent, setEditingStudent] =
    useState(null);

  // Student being viewed
  const [viewingStudent, setViewingStudent] =
    useState(null);

  // ---------------------------------------------
  // MODAL STATE
  // ---------------------------------------------

  const [isFormModalOpen, setIsFormModalOpen] =
    useState(false);

  // ---------------------------------------------
  // SEARCH / FILTER / SORT
  // ---------------------------------------------

  const [searchTerm, setSearchTerm] =
    useState("");

  const [courseFilter, setCourseFilter] =
    useState("All");

  const [sortOrder, setSortOrder] =
    useState("default");

  // ---------------------------------------------
  // PAGINATION
  // ---------------------------------------------

  const [currentPage, setCurrentPage] =
    useState(1);

  const studentsPerPage = 5;

  // ---------------------------------------------
  // LOADING STATE
  // ---------------------------------------------

  const [loading, setLoading] =
    useState(false);

  // ---------------------------------------------
  // TOAST / SUCCESS / ERROR
  // ---------------------------------------------

  const [toast, setToast] = useState({
    message: "",
    type: "",
  });

  // ---------------------------------------------
  // DARK MODE
  // ---------------------------------------------

  const [darkMode, setDarkMode] =
    useState(false);

  // ---------------------------------------------
  // SAVE TO LOCAL STORAGE
  // ---------------------------------------------

  useEffect(() => {
    localStorage.setItem(
      "students",
      JSON.stringify(students)
    );
  }, [students]);

  // ---------------------------------------------
  // GENERATE STUDENT ID
  // ---------------------------------------------

  const generateStudentId = () => {
    if (students.length === 0) {
      return "STD001";
    }

    const numbers = students.map((student) =>
      parseInt(
        student.id.replace("STD", ""),
        10
      )
    );

    const nextNumber =
      Math.max(...numbers) + 1;

    return `STD${String(nextNumber).padStart(
      3,
      "0"
    )}`;
  };

  // ---------------------------------------------
  // SHOW SUCCESS / ERROR MESSAGE
  // ---------------------------------------------

  const showToast = (
    message,
    type = "success"
  ) => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        message: "",
        type: "",
      });
    }, 2500);
  };

  // ---------------------------------------------
  // OPEN ADD MODAL
  // ---------------------------------------------

  const openAddModal = () => {
    setEditingStudent(null);
    setIsFormModalOpen(true);
  };

  // ---------------------------------------------
  // OPEN EDIT MODAL
  // ---------------------------------------------

  const openEditModal = (student) => {
    setEditingStudent(student);
    setIsFormModalOpen(true);
  };

  // ---------------------------------------------
  // CLOSE ADD / EDIT MODAL
  // ---------------------------------------------

  const closeFormModal = () => {
    setEditingStudent(null);
    setIsFormModalOpen(false);
  };

  // ---------------------------------------------
  // ADD STUDENT
  // ---------------------------------------------

  const addStudent = async (studentData) => {
    // Duplicate validation
    const duplicate = students.some(
      (student) =>
        student.name.toLowerCase() ===
          studentData.name
            .trim()
            .toLowerCase() &&
        Number(student.age) ===
          Number(studentData.age)
    );

    if (duplicate) {
      showToast(
        "Duplicate student: same name and age already exist.",
        "error"
      );

      return false;
    }

    // Loading simulation
    setLoading(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 1000)
    );

    const newStudent = {
      id: generateStudentId(),

      name: studentData.name.trim(),

      age: Number(studentData.age),

      course: studentData.course,

      status: "Active",

      dateAdded:
        new Date().toLocaleDateString(),

      createdAt: Date.now(),
    };

    setStudents((previousStudents) => [
      ...previousStudents,
      newStudent,
    ]);

    setLoading(false);

    closeFormModal();

    setCurrentPage(1);

    showToast(
      "Student added successfully!",
      "success"
    );

    return true;
  };

  // ---------------------------------------------
  // UPDATE STUDENT
  // ---------------------------------------------

  const updateStudent = async (
    studentData
  ) => {
    if (!editingStudent) {
      showToast(
        "No student selected for editing.",
        "error"
      );

      return false;
    }

    // Duplicate validation
    const duplicate = students.some(
      (student) =>
        student.id !== editingStudent.id &&
        student.name.toLowerCase() ===
          studentData.name
            .trim()
            .toLowerCase() &&
        Number(student.age) ===
          Number(studentData.age)
    );

    if (duplicate) {
      showToast(
        "Another student with the same name and age already exists.",
        "error"
      );

      return false;
    }

    setLoading(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 1000)
    );

    setStudents((previousStudents) =>
      previousStudents.map((student) =>
        student.id === editingStudent.id
          ? {
              ...student,

              name: studentData.name.trim(),

              age: Number(studentData.age),

              course: studentData.course,
            }
          : student
      )
    );

    setLoading(false);

    closeFormModal();

    showToast(
      "Student updated successfully!",
      "success"
    );

    return true;
  };

  // ---------------------------------------------
  // DELETE STUDENT
  // ---------------------------------------------

  const deleteStudent = (id) => {
    const student = students.find(
      (item) => item.id === id
    );

    if (!student) {
      showToast(
        "Unable to delete student.",
        "error"
      );

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) {
      return;
    }

    setStudents((previousStudents) =>
      previousStudents.filter(
        (item) => item.id !== id
      )
    );

    showToast(
      "Student deleted successfully!",
      "success"
    );
  };

  // ---------------------------------------------
  // TOGGLE STATUS
  // ---------------------------------------------

  const toggleStatus = (id) => {
    const studentExists = students.some(
      (student) => student.id === id
    );

    if (!studentExists) {
      showToast(
        "Unable to update student status.",
        "error"
      );

      return;
    }

    setStudents((previousStudents) =>
      previousStudents.map((student) =>
        student.id === id
          ? {
              ...student,

              status:
                student.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : student
      )
    );

    showToast(
      "Student status updated.",
      "success"
    );
  };

  // ---------------------------------------------
  // FILTER + SEARCH + SORT
  // ---------------------------------------------

  const filteredStudents = useMemo(() => {
    let result = students.filter(
      (student) => {
        const matchesSearch =
          student.name
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            );

        const matchesCourse =
          courseFilter === "All" ||
          student.course === courseFilter;

        return (
          matchesSearch &&
          matchesCourse
        );
      }
    );

    if (sortOrder === "name-asc") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    if (sortOrder === "name-desc") {
      result.sort((a, b) =>
        b.name.localeCompare(a.name)
      );
    }

    if (sortOrder === "age-asc") {
      result.sort(
        (a, b) => a.age - b.age
      );
    }

    if (sortOrder === "age-desc") {
      result.sort(
        (a, b) => b.age - a.age
      );
    }

    return result;
  }, [
    students,
    searchTerm,
    courseFilter,
    sortOrder,
  ]);

  // ---------------------------------------------
  // RESET PAGE WHEN FILTER CHANGES
  // ---------------------------------------------

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    courseFilter,
    sortOrder,
  ]);

  // ---------------------------------------------
  // PAGINATION
  // ---------------------------------------------

  const totalPages = Math.ceil(
    filteredStudents.length /
      studentsPerPage
  );

  const startIndex =
    (currentPage - 1) *
    studentsPerPage;

  const paginatedStudents =
    filteredStudents.slice(
      startIndex,
      startIndex + studentsPerPage
    );

  // ---------------------------------------------
  // RECENTLY ADDED
  // ---------------------------------------------

  const recentlyAdded = [...students]
    .sort(
      (a, b) =>
        b.createdAt - a.createdAt
    )
    .slice(0, 5);

  // ---------------------------------------------
  // RESET FILTERS
  // ---------------------------------------------

  const resetFilters = () => {
    setSearchTerm("");
    setCourseFilter("All");
    setSortOrder("default");
    setCurrentPage(1);
  };

  return (
    <div
      className={
        darkMode
          ? "app dark"
          : "app"
      }
    >
      {/* HEADER */}

      <header className="header">

        <div>
          <h1>
            Student Management System
          </h1>

          <p>
            React Practice Assignment
          </p>
        </div>

        <div className="header-actions">

          <Button
            className="theme-button"
            onClick={() =>
              setDarkMode(
                (previous) =>
                  !previous
              )
            }
          >
            {darkMode
              ? "☀ Light Mode"
              : "🌙 Dark Mode"}
          </Button>

          <Button
            className="add-button"
            onClick={openAddModal}
          >
            + Add Student
          </Button>

        </div>

      </header>

      <main>

        {/* RECENTLY ADDED */}

        <section className="recent-card">

          <h2>
            Recently Added Students
          </h2>

          {recentlyAdded.length === 0 ? (
            <p>
              No students added yet.
            </p>
          ) : (
            <div className="recent-list">

              {recentlyAdded.map(
                (student) => (
                  <div
                    className="recent-item"
                    key={student.id}
                  >
                    <strong>
                      {student.name}
                    </strong>

                    <span>
                      {student.course}
                    </span>

                    <small>
                      {student.dateAdded}
                    </small>
                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* SEARCH / FILTER / SORT */}

        <section className="controls-card">

          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={
              setSearchTerm
            }
          />

          <select
            value={courseFilter}
            onChange={(e) =>
              setCourseFilter(
                e.target.value
              )
            }
          >
            <option value="All">
              All Courses
            </option>

            <option value="HTML">
              HTML
            </option>

            <option value="CSS">
              CSS
            </option>

            <option value="JavaScript">
              JavaScript
            </option>

            <option value="React">
              React
            </option>

            <option value="Node.js">
              Node.js
            </option>

            <option value="MongoDB">
              MongoDB
            </option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(
                e.target.value
              )
            }
          >
            <option value="default">
              Default Order
            </option>

            <option value="name-asc">
              Name A-Z
            </option>

            <option value="name-desc">
              Name Z-A
            </option>

            <option value="age-asc">
              Age Low-High
            </option>

            <option value="age-desc">
              Age High-Low
            </option>
          </select>

          <Button
            className="reset-button"
            onClick={resetFilters}
          >
            Reset Filters
          </Button>

        </section>

        {/* COUNTS */}

        <div className="counts">

          <span>
            Total Students:
            <strong>
              {students.length}
            </strong>
          </span>

          <span>
            Showing:
            <strong>
              {filteredStudents.length}
            </strong>
          </span>

        </div>

        {/* STUDENT LIST */}

        <StudentList
          students={paginatedStudents}
          onView={
            setViewingStudent
          }
          onEdit={
            openEditModal
          }
          onDelete={
            deleteStudent
          }
          onToggleStatus={
            toggleStatus
          }
        />

        {/* PAGINATION */}

        {totalPages > 1 && (
          <div className="pagination">

            <Button
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    page - 1
                )
              }
            >
              ← Previous
            </Button>

            <span>
              Page {currentPage} of{" "}
              {totalPages}
            </span>

            <Button
              disabled={
                currentPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    page + 1
                )
              }
            >
              Next →
            </Button>

          </div>
        )}

      </main>

      {/* ADD / EDIT MODAL */}

      <Modal
        isOpen={
          isFormModalOpen
        }
        onClose={
          closeFormModal
        }
        title={
          editingStudent
            ? "Edit Student"
            : "Add Student"
        }
      >
        <StudentForm
          editingStudent={
            editingStudent
          }
          onAddStudent={
            addStudent
          }
          onUpdateStudent={
            updateStudent
          }
          onCancelEdit={
            closeFormModal
          }
          loading={loading}
        />
      </Modal>

      {/* VIEW DETAILS MODAL */}

      <Modal
        isOpen={
          viewingStudent !== null
        }
        onClose={() =>
          setViewingStudent(null)
        }
        title="Student Details"
      >
        {viewingStudent && (
          <div className="details">

            <div>
              <strong>
                Student ID
              </strong>

              <span>
                {viewingStudent.id}
              </span>
            </div>

            <div>
              <strong>
                Name
              </strong>

              <span>
                {viewingStudent.name}
              </span>
            </div>

            <div>
              <strong>
                Age
              </strong>

              <span>
                {viewingStudent.age}
              </span>
            </div>

            <div>
              <strong>
                Course
              </strong>

              <span>
                {viewingStudent.course}
              </span>
            </div>

            <div>
              <strong>
                Status
              </strong>

              <span>
                {viewingStudent.status}
              </span>
            </div>

            <div>
              <strong>
                Date Added
              </strong>

              <span>
                {viewingStudent.dateAdded}
              </span>
            </div>

            <Button
              className="close-button"
              onClick={() =>
                setViewingStudent(null)
              }
            >
              Close
            </Button>

          </div>
        )}
      </Modal>

      {/* TOAST */}

      <Toast
        message={toast.message}
        type={toast.type}
      />

    </div>
  );
}

export default App;