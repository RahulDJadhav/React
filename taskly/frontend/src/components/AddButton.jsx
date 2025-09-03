
export default function AddButton({
  onClick,
  className = '',
  label,
  text,           // support both text and label
  type = 'button',
  style = {},
  ...restProps     // support other props like disabled, id, etc.
}) {
  return (
    <button
      type={type}
      className={`btn ${className}`}
      style={style}
      onClick={onClick}
      {...restProps}
    >
      {label || text}
    </button>
  );
}