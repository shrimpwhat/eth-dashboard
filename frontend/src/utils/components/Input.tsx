import { ChangeEventHandler } from "react";

export default function Input({
  text,
  id,
  type,
  className,
  min,
  max,
  step,
  onChange,
}: {
  text: string;
  id: string;
  type?: string | undefined;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  onChange?: ChangeEventHandler;
}) {
  const label = "block";
  const input = "border border-black p-1 " + className;
  return (
    <div>
      <label htmlFor={id} className={label}>
        {text}
      </label>
      <input
        className={input}
        id={id}
        type={type}
        min={min}
        max={max}
        step={step}
        required
        onChange={onChange}
      />
    </div>
  );
}
