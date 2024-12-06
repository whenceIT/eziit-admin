import { redirect } from 'next/navigation';
import { paths } from '@/paths';

export default function Home() {
  redirect(paths.auth.signIn);
}