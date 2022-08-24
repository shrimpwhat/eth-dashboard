export default function Input({
  text,
  id,
  type,
  className,
}: {
  text: string;
  id: string;
  type?: string | undefined;
  className?: string;
}) {
  const label = "block";
  const input = "border border-black mb-8 p-1 " + className;
  return (
    <div className={className}>
      <label htmlFor={id} className={label}>
        {text}
      </label>
      <input className={input} id={id} type={type} required />
    </div>
  );
}
