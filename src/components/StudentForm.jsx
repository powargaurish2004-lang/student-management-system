/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";

import Input from "./Input";
import Button from "./Button";

function StudentForm({
  editingStudent,
  onAddStudent,
  onUpdateStudent,
  onCancelEdit,
  loading,
}) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    course: "",
  });

  const [error, setError] = useState("");

  // Checks whether the user has changed the form
  const [isDirty, setIsDirty] = useState(false);

  // Load existing student while editing
  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name,
        age: editingStudent.age,
        course: editingStudent.course,
      });
    } else {
      setFormData({
        name: "",
        age: "",
        course: "",
      });
    }

    setError("");
    setIsDirty(false);
  }, [editingStudent]);

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Do not allow student name above 30 characters
    if (name === "name" && value.length > 30) {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setIsDirty(true);
    setError("");
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Required fields
    if (
      formData.name.trim() === "" ||
      formData.age === "" ||
      formData.course === ""
    ) {
      setError("Please fill all fields.");
      return;
    }

    // Age validation
    if (Number(formData.age) <= 0) {
      setError("Age must be greater than 0.");
      return;
    }

    // Character limit
    if (formData.name.length > 30) {
      setError("Name cannot exceed 30 characters.");
      return;
    }

    let success;

    if (editingStudent) {
      success = await onUpdateStudent(formData);
    } else {
      success = await onAddStudent(formData);
    }

    // If App.jsx operation was successful
    if (success) {
      setIsDirty(false);
    }
  };

  // Cancel with unsaved warning
  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );

      if (!confirmed) {
        return;
      }
    }

    setFormData({
      name: "",
      age: "",
      course: "",
    });

    setError("");
    setIsDirty(false);

    onCancelEdit();
  };

  // Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDirty]);

  return (
    <form
      className="student-form"
      onSubmit={handleSubmit}
    >

      {/* ERROR MESSAGE */}

      {error && (
        <div className="error-message">
          ⚠ {error}
        </div>
      )}

      {/* STUDENT NAME */}

      <Input
        label="Student Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter student name"
        maxLength={30}
      />

      {/* CHARACTER COUNTER */}

      <div className="character-counter">
        {formData.name.length} / 30 characters
      </div>

      {/* AGE */}

      <Input
        label="Age"
        name="age"
        type="number"
        value={formData.age}
        onChange={handleChange}
        placeholder="Enter age"
      />

      {/* COURSE */}

      <div className="form-group">

        <label htmlFor="course">
          Course
        </label>

        <select
          id="course"
          name="course"
          value={formData.course}
          onChange={handleChange}
        >
          <option value="">
            Select Course
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

      </div>

      {/* BUTTONS */}

      <div className="form-actions">

        <Button
          type="submit"
          className="primary-button"
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : editingStudent
            ? "Update Student"
            : "Add Student"}
        </Button>

        <Button
          type="button"
          className="secondary-button"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>

      </div>

    </form>
  );
}

export default StudentForm;
