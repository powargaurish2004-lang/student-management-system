/* eslint-disable react-hooks/rules-of-hooks, react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import StudentForm from "./components/StudentForm";
import StudentList from "./components/StudentList";
import Button from "./components/Button";
import Modal from "./components/Modal";
import SearchBar from "./components/SearchBar";
import Toast from "./components/Toast";
import AuthPanel from "./components/AuthPanel";
import {
    clearSession,
    getToken,
    getUser,
    studentsApi
} from "./api";
import "./App.css";

function App() {

    const [user, setUser] = useState(getUser);
    const [students, setStudents] = useState([]);
    const [editingStudent, setEditingStudent] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [courseFilter, setCourseFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortOrder, setSortOrder] = useState("id-asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({
        message: "",
        type: ""
    });
    const [darkMode, setDarkMode] = useState(false);


    // TOAST
    const showToast = (message, type = "success") => {
        setToast({
            message,
            type
        });

        window.setTimeout(() => {
            setToast({
                message: "",
                type: ""
            });
        }, 2500);
    };


    // LOAD STUDENTS
    useEffect(() => {

        if (!user || !getToken()) {
            return;
        }

        setLoading(true);

        studentsApi
            .list()
            .then(setStudents)
            .catch((error) => {

                showToast(error.message, "error");

                if (
                    error.message.includes("Session") ||
                    error.message.includes("token") ||
                    error.message.includes("Unauthorized")
                ) {
                    clearSession();
                    setUser(null);
                }

            })
            .finally(() => {
                setLoading(false);
            });

    }, [user]);


    // RESET PAGE WHEN FILTER CHANGES
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, courseFilter, statusFilter, sortOrder]);


    // FILTER + SORT
    const filteredStudents = useMemo(() => {

        const result = students.filter((student) =>
            student.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) &&
            (
                courseFilter === "All" ||
                student.course === courseFilter
            ) && (
                statusFilter === "All" ||
                student.status === statusFilter
            )
        );

        if (sortOrder === "id-asc") {
            result.sort((a, b) =>
                String(a.studentId || "").localeCompare(String(b.studentId || ""), undefined, { numeric: true })
            );
        }

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
            result.sort((a, b) =>
                a.age - b.age
            );
        }

        if (sortOrder === "age-desc") {
            result.sort((a, b) =>
                b.age - a.age
            );
        }

        return result;

    }, [
        students,
        searchTerm,
        courseFilter,
        statusFilter,
        sortOrder
    ]);


    // PAGINATION
    const totalPages = Math.max(
        1,
        Math.ceil(filteredStudents.length / 5)
    );

    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * 5,
        currentPage * 5
    );


    // RECENT STUDENTS
    const recentlyAdded = [...students]
        .sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        )
        .slice(0, 5);


    // COURSES
    const courses = [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "Node.js",
        "MongoDB"
    ];


    // CLOSE FORM
    const closeFormModal = () => {
        setEditingStudent(null);
        setIsFormModalOpen(false);
    };


    // ADD STUDENT
    const addStudent = async (data) => {

        try {

            setLoading(true);

            const student =
                await studentsApi.create({
                    ...data,
                    name: data.name.trim()
                });

            setStudents((items) => [
                student,
                ...items
            ]);

            closeFormModal();

            setCurrentPage(1);

            showToast(
                "Student added successfully!"
            );

            return true;

        } catch (error) {

            showToast(
                error.message,
                "error"
            );

            return false;

        } finally {

            setLoading(false);

        }
    };


    // UPDATE STUDENT
    const updateStudent = async (data) => {

        if (!editingStudent) {
            return false;
        }

        try {

            setLoading(true);

            const student =
                await studentsApi.update(
                    editingStudent.id,
                    {
                        ...data,
                        name: data.name.trim()
                    }
                );

            setStudents((items) =>
                items.map((item) =>
                    item.id === student.id
                        ? student
                        : item
                )
            );

            closeFormModal();

            showToast(
                "Student updated successfully!"
            );

            return true;

        } catch (error) {

            showToast(
                error.message,
                "error"
            );

            return false;

        } finally {

            setLoading(false);

        }
    };


    // DELETE STUDENT
    const deleteStudent = async (id) => {

        const student =
            students.find(
                (item) => item.id === id
            );

        if (
            !student ||
            !window.confirm(
                `Are you sure you want to delete ${student.name}?`
            )
        ) {
            return;
        }

        try {

            await studentsApi.remove(id);

            setStudents((items) =>
                items.filter(
                    (item) => item.id !== id
                )
            );

            showToast(
                "Student deleted successfully!"
            );

        } catch (error) {

            showToast(
                error.message,
                "error"
            );

        }
    };


    // TOGGLE STATUS
    const toggleStatus = async (id) => {

        if (!id) {
            showToast(
                "Student ID is missing.",
                "error"
            );
            return;
        }

        try {

            const updated =
                await studentsApi.toggle(id);

            setStudents((items) =>
                items.map((item) =>
                    item.id === updated.id
                        ? updated
                        : item
                )
            );

            showToast(
                "Student status updated."
            );

        } catch (error) {

            showToast(
                error.message,
                "error"
            );

        }
    };


    // RESET FILTERS
    const resetFilters = () => {

        setSearchTerm("");
        setCourseFilter("All");
        setStatusFilter("All");
        setSortOrder("id-asc");

    };


    /*
     * IMPORTANT:
     * Authentication check is AFTER ALL HOOKS.
     *
     * This prevents:
     * "Rendered more hooks than during the previous render."
     */

    if (!user) {
        return (
            <AuthPanel
                onAuthenticated={setUser}
            />
        );
    }

    const isAdmin = user.role === "admin";
    const activeStudents = students.filter((student) => student.status === "Active").length;
    const inactiveStudents = students.length - activeStudents;
    const courseCount = new Set(students.map((student) => student.course)).size;


    // MAIN PAGE
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

                <div className="brand-block">

                    <div className={`brand-mark ${isAdmin ? "admin-mark" : ""}`}>
                        {isAdmin ? "A" : "S"}
                    </div>

                    <div>
                        <p className="header-kicker">{isAdmin ? "ADMINISTRATION" : "YOUR WORKSPACE"}</p>
                        <h1>Student Management System</h1>

                        <p>
                            {user.role === "admin" ? "Admin console for" : "Private workspace for"}{" "}
                            {user.name}
                        </p>
                        <span className="header-email">{user.email}</span>
                    </div>

                </div>


                <div className="header-actions">

                    <Button
                        className="theme-button"
                        onClick={() =>
                            setDarkMode(
                                (value) => !value
                            )
                        }
                    >
                        {darkMode ? "Light Mode" : "Dark Mode"}
                    </Button>


                    <Button
                        className="secondary-button"
                        onClick={() => {
                            clearSession();
                            setUser(null);
                        }}
                    >
                        Sign out
                    </Button>


                    <Button
                        className="add-button"
                        onClick={() => {

                            setEditingStudent(null);
                            setIsFormModalOpen(true);

                        }}
                    >
                        Add Student
                    </Button>

                </div>

            </header>


            <main>

                <section className={`dashboard-intro ${isAdmin ? "admin-intro" : ""}`}>
                    <div>
                        <span className="section-label">{isAdmin ? "Operations overview" : "Personal overview"}</span>
                        <h2>{isAdmin ? "Keep every student record moving." : "Stay on top of your students."}</h2>
                        <p>{isAdmin ? "Review activity, manage status, and maintain the student directory from one place." : "Add, edit, and review your student records in one focused workspace."}</p>
                    </div>
                    <div className="intro-meta">
                        <span className="role-pill">{isAdmin ? "Administrator" : "User account"}</span>
                        <small>Signed in as {user.email}</small>
                    </div>
                </section>

                <section className="metric-grid" aria-label="Student summary">
                    <div className="metric-card metric-primary">
                        <span className="metric-label">Total students</span>
                        <strong>{students.length}</strong>
                        <small>{isAdmin ? "Across all workspaces" : "In your workspace"}</small>
                    </div>
                    <div className="metric-card">
                        <span className="metric-label">Active</span>
                        <strong>{activeStudents}</strong>
                        <small><span className="metric-dot active-dot" /> Currently active</small>
                    </div>
                    <div className="metric-card">
                        <span className="metric-label">Inactive</span>
                        <strong>{inactiveStudents}</strong>
                        <small><span className="metric-dot inactive-dot" /> Needs attention</small>
                    </div>
                    <div className="metric-card">
                        <span className="metric-label">Courses covered</span>
                        <strong>{courseCount}</strong>
                        <small>Of {courses.length} available courses</small>
                    </div>
                </section>

                {/* RECENTLY ADDED */}

                <section className="recent-card">

                    <h2>
                        Recently Added Students
                    </h2>

                    {recentlyAdded.length ? (

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

                                        {isAdmin && <small className="recent-email">{student.email || "Email unavailable"}</small>}

                                        <small>
                                            {student.dateAdded}
                                        </small>

                                    </div>

                                )
                            )}

                        </div>

                    ) : (

                        <p>
                            No students added yet.
                        </p>

                    )}

                </section>


                {/* SEARCH + FILTER */}

                <section className="controls-card">

                    <SearchBar
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />


                    <select
                        value={courseFilter}
                        onChange={(event) =>
                            setCourseFilter(
                                event.target.value
                            )
                        }
                    >

                        <option>
                            All
                        </option>

                        {courses.map(
                            (course) => (

                                <option
                                    key={course}
                                >
                                    {course}
                                </option>

                            )
                        )}

                    </select>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                        aria-label="Filter by status"
                    >
                        <option value="All">All statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>


                    <select
                        value={sortOrder}
                        onChange={(event) =>
                            setSortOrder(
                                event.target.value
                            )
                        }
                    >

                        <option value="id-asc">
                            Student ID 0001 first
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
                        Total Students:{" "}
                        <strong>
                            {students.length}
                        </strong>
                    </span>

                    <span>
                        Showing:{" "}
                        <strong>
                            {filteredStudents.length}
                        </strong>
                    </span>

                </div>


                {/* STUDENT LIST */}

                <StudentList
                    students={paginatedStudents}
                    onView={setViewingStudent}
                    onEdit={(student) => {

                        setEditingStudent(student);
                        setIsFormModalOpen(true);

                    }}
                    onDelete={deleteStudent}
                    onToggleStatus={toggleStatus}
                    canEdit={true}
                    canManage={isAdmin}
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
                            Previous
                        </Button>


                        <span>
                            Page{" "}
                            {currentPage}{" "}
                            of{" "}
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
                            Next
                        </Button>

                    </div>

                )}

            </main>


            {/* ADD / EDIT MODAL */}

            <Modal
                isOpen={isFormModalOpen}
                onClose={closeFormModal}
                title={
                    editingStudent
                        ? "Edit Student"
                        : "Add Student"
                }
            >

                <StudentForm
                    editingStudent={editingStudent}
                    onAddStudent={addStudent}
                    onUpdateStudent={updateStudent}
                    onCancelEdit={closeFormModal}
                    loading={loading}
                />

            </Modal>


            {/* VIEW STUDENT MODAL */}

            <Modal
                isOpen={Boolean(viewingStudent)}
                onClose={() =>
                    setViewingStudent(null)
                }
                title="Student Details"
            >

                {viewingStudent && (

                    <div className="details">

                        {[
                            [
                                "Student ID",
                                viewingStudent.studentId
                            ],
                            [
                                "Name",
                                viewingStudent.name
                            ],
                            [[
                                "Email",
                                viewingStudent.email || user.email || "Not available"
                            ]],
                            [
                                "Age",
                                viewingStudent.age
                            ],
                            [
                                "Course",
                                viewingStudent.course
                            ],
                            [
                                "Status",
                                viewingStudent.status
                            ],
                            [
                                "Date Added",
                                viewingStudent.dateAdded
                            ]
                        ].map(
                            ([label, value]) => (

                                <div key={label}>

                                    <strong>
                                        {label}
                                    </strong>

                                    <span>
                                        {value}
                                    </span>

                                </div>

                            )
                        )}


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