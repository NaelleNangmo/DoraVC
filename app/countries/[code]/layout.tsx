import countries from '@/data/countries.json';

export async function generateStaticParams() {
  return countries.map((country) => ({
    code: country.code.toLowerCase(),
  }));
}

export default function CountryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}