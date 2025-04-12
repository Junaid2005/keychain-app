import { GlowEffect } from '@/components/ui/glow-effect';
import { Button } from './button';

export function GlowEffectButton({ text, link }: { text: string, link?: string }) {
  return (
    <div className='relative inline-flex items-center justify-center'>
      <GlowEffect
        mode='colorShift'
        blur='soft'
        duration={3}
        scale={1.05}
        className="flex justify-center items-center"
      />
      {link ? (
        <Button size="lg" className='relative inline-flex items-center justify-center gap-2 text-sm'>
          <a href={link} className="flex items-center gap-2">
            {text}
          </a>
        </Button>
      ) : (
        <Button size="lg" className='relative inline-flex items-center justify-center gap-2 text-sm'>
          {text}
        </Button>
      )}
    </div>
  );
}
