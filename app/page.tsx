import CentralDisplay from '@/components/CentralDisplay';
import  Page  from '../lib/db';

export default function Home() {
  const test = Page()
  return (
    <div className='mx-16 '>
      <CentralDisplay />
    </div>
  );
}
