import { getTranslations } from 'next-intl/server';
 
export default async function HomePage() {
  const t = await getTranslations('main');
  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  );
}