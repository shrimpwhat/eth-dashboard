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
  maxText,
  maxFn,
}: {
  text: string;
  id: string;
  type?: string | undefined;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  onChange?: ChangeEventHandler;
  maxText?: string;
  maxFn?: React.MouseEventHandler;
}) {
  const input = "border border-black p-1 " + className;
  return (
    <div>
      <label htmlFor={id} className="block">
        {text}
      </label>
      <div
        className={
          (maxText ? "border border-black" : "") +
          " box-border flex items-center"
        }
      >
        <input
          className={
            (maxText ? className + " focus:outline-none" : input) + " h-[35px]"
          }
          id={id}
          type={type}
          min={min}
          max={max}
          step={step}
          required
          onChange={onChange}
        />
        {maxText && (
          <button
            className="max-button font-bold"
            type="button"
            onClick={maxFn}
          >
            {maxText}
          </button>
        )}
      </div>
    </div>
  );
}
