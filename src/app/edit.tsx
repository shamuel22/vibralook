import { RouteStub } from '@/components/dev/RouteStub';

export default function Screen() {
  return <RouteStub title="8 · Hazlo tuyo" next={[{ href: '/result', label: 'Resultado' }, ]} />;
}
