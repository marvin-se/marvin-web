import { Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Boyut seçeneklerini tanımlıyoruz
const sizeVariants = {
  small: 'size-4',
  medium: 'size-6',
  large: 'size-8',
};

// Bileşenin kabul edeceği propları tanımlıyoruz
interface SpinnerProps extends React.ComponentProps<'svg'> {
  size?: keyof typeof sizeVariants;
}

function Spinner({ className, size = 'medium', ...props }: SpinnerProps) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('animate-spin', sizeVariants[size], className)}
      {...props}
    />
  );
}

export { Spinner };
