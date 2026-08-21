import StudentCard from "./StudentCard";

function StudentList({
  students,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  canEdit,
  canManage,
}) {
  if (students.length === 0) {
    return (
      <div className="empty-state">

        <div className="empty-icon">
          👨‍🎓
        </div>

        <h2>
          No Students Found
        </h2>

        <p>
          Try changing your
          search/filter or add
          a new student.
        </p>

      </div>
    );
  }

  return (
    <section className="list-card">

      <div className="table-container">

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Course</th>
              <th>Status</th>
              <th>Date Added</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {students.map(
              (student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={
                    onToggleStatus
                  }
                  canEdit={canEdit}
                  canManage={canManage}
                />
              )
            )}

          </tbody>

        </table>

      </div>

    </section>
  );
}

export default StudentList;