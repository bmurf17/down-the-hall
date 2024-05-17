import { getData } from '@/actions/userActions';
import CentralDisplay from '@/components/CentralDisplay';

export default async function Home() {
  const value = await getData();
  console.log(value)
  return (
    <div className='mx-16 '>
      <CentralDisplay />
    </div>
  );
}
