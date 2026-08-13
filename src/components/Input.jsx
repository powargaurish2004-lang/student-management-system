function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  maxLength,
}) {
  return (
    <div className="form-group">

      <label htmlFor={name}>
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={
          placeholder
        }
        maxLength={
          maxLength
        }
      />

    </div>
  );
}

export default Input;