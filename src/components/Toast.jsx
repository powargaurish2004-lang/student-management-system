function Toast({
  message,
  type,
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={
        `toast ${type}`
      }
    >
      <span>
        {type === "success"
          ? "✓"
          : "⚠"}
      </span>

      <span>
        {message}
      </span>
    </div>
  );
}

export default Toast;