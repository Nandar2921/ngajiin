import VerseDetailClient from './VerseDetailClient';

interface PageProps {
  params: {
    surah: string;
    ayah: string;
  };
}

export default function Page({ params }: PageProps) {
  return <VerseDetailClient surah={params.surah} ayah={params.ayah} />;
}