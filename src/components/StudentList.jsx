import StudentCard from "./StudentCard";

function StudentList({ students, onEdit, onDelete }) {
  if (students.length === 0) {
    return (
      <div className="empty-state">
        <h3>No students added yet.</h3>
        <p>Add a student using the form above.</p>
      </div>
    );
  }

  return (
    <div className="list-card">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Course</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentList;