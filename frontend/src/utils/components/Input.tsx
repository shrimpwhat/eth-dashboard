export default function Input({
  text,
  id,
  type,
  className,
  min,
  max,
}: {
  text: string;
  id: string;
  type?: string | undefined;
  min?: number;
  max?: number;
  className?: string;
}) {
  const label = "block";
  const input = "border border-black mb-8 p-1 " + className;
  return (
    <div className={className}>
      <label htmlFor={id} className={label}>
        {text}
      </label>
      <input
        className={input}
        id={id}
        type={type}
        min={min}
        max={max}
        required
      />
    </div>
  );
}
