import Button from "./Button";

function StudentCard({
  student,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const mongoId = student.id || student._id;
  const displayId = student.displayId || student.studentId;

  return (
    <tr>
      <td>
        <strong>{displayId}</strong>
      </td>

      <td>{student.name}</td>

      <td>{student.age}</td>

      <td>
        <span className="course-badge">{student.course}</span>
      </td>

      <td>
        <span className={student.status === "Active" ? "status active" : "status inactive"}>
          {student.status}
        </span>
      </td>

      <td>{student.dateAdded}</td>

      <td>
        <div className="action-buttons">
          <Button className="view-button" onClick={() => onView(student)}>
            View
          </Button>

          <Button className="edit-button" onClick={() => onEdit(student)}>
            Edit
          </Button>

          <Button
            className={`status-button ${student.status === "Active" ? "active-btn" : "inactive-btn"}`}
            onClick={() => onToggleStatus(mongoId)}
            disabled={!mongoId}
          >
            {student.status === "Active" ? "🟢 Active" : "🔴 Inactive"}
          </Button>

          <Button
            className="delete-button"
            onClick={() => onDelete(mongoId)}
            disabled={!mongoId}
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default StudentCard;
