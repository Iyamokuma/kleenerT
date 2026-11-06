export default function SectionHead({ kicker, title, children, center = false, id }) {
  return (
    <div className={`section-head ${center ? 'center' : ''}`.trim()}>
      <span className="kicker">{kicker}</span>
      <h2 id={id}>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}
