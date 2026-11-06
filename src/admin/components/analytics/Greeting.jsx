import { motion } from 'motion/react';
import { EASE, greeting } from './shared';

const WORD = 'Admin';

/**
 * "Good morning, Admin": the name springs in letter by letter, a shimmering
 * underline draws itself, and the letters ripple when you hover them.
 */
export default function Greeting({ children }) {
  const hello = greeting();
  const settle = 0.3 + WORD.length * 0.07;

  return (
    <div className="hello">
      <h1 className="hello-title">
        <span className="sr-only">{hello}, {WORD}</span>
        <motion.span
          className="hello-lead"
          aria-hidden="true"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {hello},
        </motion.span>{' '}
        <motion.span className="hello-word" aria-hidden="true" initial="rest" animate="rest" whileHover="wave">
          {[...WORD].map((ch, i) => (
            <motion.span
              key={ch + i}
              className="hello-char"
              initial={{ y: '0.85em', opacity: 0, rotate: 14 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 17, delay: 0.3 + i * 0.07 }}
            >
              <motion.span
                className="hello-char-inner"
                variants={{
                  rest: { y: 0 },
                  wave: { y: [0, -10, 0], transition: { duration: 0.45, delay: i * 0.05, ease: 'easeInOut' } },
                }}
              >
                {ch}
              </motion.span>
            </motion.span>
          ))}
          <motion.span
            className="hello-underline"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: settle, duration: 0.7, ease: EASE }}
          />
        </motion.span>
      </h1>
      {children && (
        <motion.div
          className="hello-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: settle - 0.1, duration: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
