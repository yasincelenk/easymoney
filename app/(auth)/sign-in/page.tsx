import {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {SignInForm} from '@/components/forms/sign-in-form';

export const metadata: Metadata = {
  title: 'Signloop · Sign in'
};

export default async function SignInPage() {
  const t = await getTranslations('auth');
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">{t('title')}</h1>
        <p className="text-sm text-slate-600">{t('subtitle')}</p>
      </div>
      <SignInForm />
    </div>
  );
}
