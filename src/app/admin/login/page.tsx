import { notFound, redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
import LoginClient from './LoginClient';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const revalidate = 0;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // If already logged in, skip the login form and redirect to admin panel
  if (await isAdminAuthenticated()) {
    redirect('/admin');
  }

  const resolvedParams = await searchParams;
  const access = resolvedParams.access;

  // Render standard 404 Page Not Found if the access key is missing or incorrect
  if (access !== 'cilexplorer') {
    notFound();
  }

  return <LoginClient />;
}
