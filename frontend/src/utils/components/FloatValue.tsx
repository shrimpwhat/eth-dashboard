export default function floatValue(value: number | string, digits: number) {
  if (typeof value === "string") value = Number(value);
  if (value % 1 !== 0) value = value.toFixed(digits);
  return value;
}
