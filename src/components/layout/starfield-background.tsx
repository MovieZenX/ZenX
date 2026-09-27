import styles from "./starfield.module.css";

/**
 * Animated cosmic parallax starfield background from uiverse.io/jaykdoe/tasty-dragon-12.
 * Replaces plain black with a deep-space radial gradient and three-tier parallax starfield.
 * Fixed in background with pointer-events-none and negative z-index so all interactions remain smooth.
 */
export function StarfieldBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      <div className={styles.starsContainer}>
        <div className={styles.stars1} />
        <div className={styles.stars2} />
        <div className={styles.stars3} />
      </div>
    </div>
  );
}
