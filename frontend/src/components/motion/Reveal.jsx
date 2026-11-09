import { Fade } from '@animate-ui/react/primitives/effects/fade';
import { Slide } from '@animate-ui/react/primitives/effects/slide';

// Fade + short rise (Animate UI Fade/Slide) for content that appears on demand
// (revealed answers, check results) and for cards in lists. `index` staggers
// siblings by 40ms, capped so the last card of a long list doesn't wait.
export default function Reveal({ index = 0, offset = 14, inView = false, className, children }) {
  const delay = Math.min(index, 10) * 40;
  return (
    <Fade delay={delay} inView={inView} className={className}>
      <Slide direction="up" offset={offset} delay={delay} inView={inView} className="h-full">
        {children}
      </Slide>
    </Fade>
  );
}
