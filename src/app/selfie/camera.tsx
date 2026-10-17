import { RouteStub } from '@/components/dev/RouteStub';

export default function Screen() {
  return <RouteStub title="3 · Cámara" next={[{ href: '/selfie/review', label: 'Revisar selfie' }, ]} />;
}
