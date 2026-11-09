import { RippleButton, RippleButtonRipples } from '@animate-ui/react/primitives/buttons/ripple';

// Primary action button: Animate UI RippleButton (spring press-in + ink
// ripple from the click point). Drop-in for <button>, keeps all props/classes.
export default function PressButton({ children, rippleColor = 'rgba(255,255,255,0.35)', type = 'button', ...props }) {
  return (
    <RippleButton type={type} tapScale={0.96} {...props}>
      {children}
      <RippleButtonRipples color={rippleColor} />
    </RippleButton>
  );
}
