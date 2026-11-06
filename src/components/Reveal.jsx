import { useInView } from '../hooks/useInView';

/** Fades its child in the first time it scrolls into view. */
export default function Reveal({ as: Tag = 'div', className = '', delay = 0, style, children, ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`.trim()}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
