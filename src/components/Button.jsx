function Button({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={
        `reusable-button ${className}`
      }
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;