import Button from "./Button";

function StudentCard({
  student,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  canEdit,
  canManage,
}) {
  return (
    <tr>

      <td>
        <strong>
    {student.studentId}
</strong>
      </td>

      <td>
        {student.name}
      </td>

      <td>{student.email || "Not available"}</td>

      <td>
        {student.age}
      </td>

      <td>
        <span className="course-badge">
          {student.course}
        </span>
      </td>

      <td>
        <span
          className={
            student.status ===
            "Active"
              ? "status active"
              : "status inactive"
          }
        >
          {student.status}
        </span>
      </td>

      <td>
        {student.dateAdded}
      </td>

      <td>

        <div className="action-buttons">

          {/* VIEW */}

          <Button
            className="view-button"
            onClick={() =>
              onView(student)
            }
          >
            View
          </Button>

          {canEdit && <>
            <Button
              className="edit-button"
              onClick={() => onEdit(student)}
            >
              Edit
            </Button>
          </>}

          {canManage && <>
            <Button
              className={`status-button ${student.status === "Active" ? "active-btn" : "inactive-btn"}`}
              onClick={() => onToggleStatus(student.id)}
            >
              {student.status === "Active" ? "🟢 Active" : "🔴 Inactive"}
            </Button>

            <Button
              className="delete-button"
              onClick={() => onDelete(student.id)}
            >
              Delete
            </Button>
          </>}

        </div>

      </td>

    </tr>
  );
}

export default StudentCard;