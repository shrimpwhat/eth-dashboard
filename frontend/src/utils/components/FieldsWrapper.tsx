import Container from "@mui/material/Container";

export default function FieldsWrapper({
  children,
}: {
  children: JSX.Element[];
}) {
  return (
    <Container
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        gap: 2,
      }}
      maxWidth="xs"
    >
      {children}
    </Container>
  );
}
