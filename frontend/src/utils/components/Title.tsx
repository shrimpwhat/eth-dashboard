export default function Title({ text }: { text: string }) {
  return (
    <h1 className="text-center text-3xl tracking-wider font-semibold mb-5">
      {text}
    </h1>
  );
}
