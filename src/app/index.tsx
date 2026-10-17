import { RouteStub } from '@/components/dev/RouteStub';

export default function Screen() {
  return <RouteStub title="1 · Intención" next={[{ href: '/selfie', label: 'Preparar selfie' }, ]} />;
}
