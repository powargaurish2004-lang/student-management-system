import { useEffect, useState } from "react";
import StudentForm from "./components/StudentForm";
import StudentList from "./components/StudentList";
import "./App.css";

function App() {
  const [students, setStudents] = useState(() => {
    const savedStudents = localStorage.getItem("students");

    return savedStudents ? JSON.parse(savedStudents) : [];
  });

  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");

  // Save students to local storage
  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  // CREATE
  const addStudent = (student) => {
    const newStudent = {
      ...student,
      id: Date.now(),
    };

    setStudents([...students, newStudent]);
  };

  // UPDATE
  const updateStudent = (updatedStudent) => {
    setStudents(
      students.map((student) =>
        student.id === updatedStudent.id
          ? updatedStudent
          : student
      )
    );

    setEditingStudent(null);
  };

  // DELETE
  const deleteStudent = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) {
      return;
    }

    setStudents(
      students.filter((student) => student.id !== id)
    );
  };

  // EDIT
  const editStudent = (student) => {
    setEditingStudent(student);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // SEARCH
  const filteredStudents = students.filter(
    (student) =>
      student.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.course
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // SORT
  const sortedStudents = [...filteredStudents];

  if (sortOrder === "name") {
    sortedStudents.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  if (sortOrder === "age") {
    sortedStudents.sort((a, b) => a.age - b.age);
  }

  return (
    <div className="app">
      <header>
        <h1>Student Management System</h1>
        <p>
          Manage student records using React CRUD operations
        </p>
      </header>

      <main>
        <StudentForm
          onAddStudent={addStudent}
          editingStudent={editingStudent}
          onUpdateStudent={updateStudent}
          onCancelEdit={() => setEditingStudent(null)}
        />

        <div className="controls">
          <input
            type="text"
            placeholder="Search by name or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="default">Sort By</option>
            <option value="name">Name</option>
            <option value="age">Age</option>
          </select>
        </div>

        <div className="student-count">
          Total Students: <strong>{students.length}</strong>
        </div>

        <StudentList
          students={sortedStudents}
          onEdit={editStudent}
          onDelete={deleteStudent}
        />
      </main>
    </div>
  );
}

export default App;