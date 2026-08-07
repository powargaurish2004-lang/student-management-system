function StudentCard({ student, onEdit, onDelete }) {
  return (
    <tr>
      <td>{student.name}</td>
      <td>{student.age}</td>
      <td>{student.course}</td>
      <td>
        <button
          className="edit-btn"
          onClick={() => onEdit(student)}
        >
          Edit
        </button>

        <button
          className="delete-btn"
          onClick={() => onDelete(student.id)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

export default StudentCard;