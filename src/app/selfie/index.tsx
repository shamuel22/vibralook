import { RouteStub } from '@/components/dev/RouteStub';

export default function Screen() {
  return <RouteStub title="2 · Preparar selfie" next={[{ href: '/selfie/camera', label: 'Cámara' }, { href: '/selfie/review', label: 'Revisar selfie' }, ]} />;
}
