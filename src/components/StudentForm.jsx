import { useEffect, useState } from "react";

function StudentForm({
  onAddStudent,
  editingStudent,
  onUpdateStudent,
  onCancelEdit,
}) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    course: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name,
        age: editingStudent.age,
        course: editingStudent.course,
      });
    }
  }, [editingStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      formData.name.trim() === "" ||
      formData.age === "" ||
      formData.course.trim() === ""
    ) {
      setError("All fields are required.");
      return;
    }

    if (Number(formData.age) <= 0) {
      setError("Age must be greater than 0.");
      return;
    }

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        name: formData.name.trim(),
        age: Number(formData.age),
        course: formData.course.trim(),
      });
    } else {
      onAddStudent({
        name: formData.name.trim(),
        age: Number(formData.age),
        course: formData.course.trim(),
      });
    }

    clearForm();
  };

  const clearForm = () => {
    setFormData({
      name: "",
      age: "",
      course: "",
    });

    setError("");

    if (editingStudent) {
      onCancelEdit();
    }
  };

  return (
    <div className="form-card">
      <h2>{editingStudent ? "Edit Student" : "Add Student"}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Student Name</label>

          <input
            type="text"
            name="name"
            placeholder="Enter student name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Age</label>

          <input
            type="number"
            name="age"
            placeholder="Enter age"
            value={formData.age}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Course</label>

          <input
            type="text"
            name="course"
            placeholder="Enter course"
            value={formData.course}
            onChange={handleChange}
          />
        </div>

        {error && <p className="error">{error}</p>}

        <div className="form-buttons">
          <button type="submit" className="primary-btn">
            {editingStudent ? "Update Student" : "Add Student"}
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={clearForm}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentForm;