export function FieldLabel(props: { children: React.ReactNode; required?: boolean }) {
  return (
    <div className="text-sm font-medium">
      {props.children} {props.required ? <span className="text-destructive">*</span> : null}
    </div>
  );
}