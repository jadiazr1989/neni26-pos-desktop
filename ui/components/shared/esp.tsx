
function KeyCap(props: { children: React.ReactNode }) {
  return (
    <span
      className="
        inline-flex items-center justify-center
        min-w-[20px] h-[18px] px-1
        rounded-md border
        text-[10px] font-mono
        bg-muted
        text-muted-foreground
      "
    >
      {props.children}
    </span>
  );
}