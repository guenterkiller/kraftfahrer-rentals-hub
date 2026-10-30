export function contactUpdate(body: {
  cName: string; contact: string; street: string; house: string; postal: string;
  city: string; phone: string; contactEmail: string; einsatzort?: string;
}) {
  return {
    company: body.cName.trim(), customer_name: body.contact.trim(),
    customer_street: body.street, customer_house_number: body.house,
    customer_postal_code: body.postal, customer_city: body.city,
    customer_phone: body.phone, customer_email: body.contactEmail,
    ...(body.einsatzort ? { einsatzort: body.einsatzort } : {}),
    updated_at: new Date().toISOString(),
  };
}