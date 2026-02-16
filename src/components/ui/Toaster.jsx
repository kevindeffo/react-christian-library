import { Toaster as SonnerToaster, toast } from 'sonner';

function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
    />
  );
}

export { toast };
export default Toaster;
