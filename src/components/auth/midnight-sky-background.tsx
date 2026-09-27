import styles from "./midnight-sky-background.module.css";

/**
 * Animated midnight sky background inspired by uiverse.io/kiranmayee-abbireddy/average-insect-70.
 * Features 3 layers of twinkling stars, animated shooting meteors with gradient tails, and a glowing crescent moon.
 */
export function MidnightSkyBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      <div className={styles.midnightSky}>
        <div className={styles.skyCanvas}>
          {/* Twinkling Star Layers */}
          <div className={`${styles.stars} ${styles.stars1}`} />
          <div className={`${styles.stars} ${styles.stars2}`} />
          <div className={`${styles.stars} ${styles.stars3}`} />

          {/* Shooting Meteors */}
          <div className={`${styles.meteor} ${styles.m1}`} />
          <div className={`${styles.meteor} ${styles.m2}`} />
          <div className={`${styles.meteor} ${styles.m3}`} />

          {/* Glowing Crescent Moon */}
          <div className={styles.moon} />
        </div>
      </div>
    </div>
  );
}
