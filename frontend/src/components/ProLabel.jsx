import { Crown } from '@phosphor-icons/react';

// Inline "PRO" marker used inside the gold premium badges.
export default function ProLabel({ size = 12 }) {
  return (
    <span className="inline-flex items-center gap-1 leading-none">
      <Crown size={size} weight="fill" aria-hidden="true" />
      PRO
    </span>
  );
}
