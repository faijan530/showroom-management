import { redirect } from 'next/navigation';

export default function AdminSparePartsRedirectPage() {
  redirect('/inventory/spare-parts');
}
