export async function getWhatsAppAccountsFromToken(accessToken: string) {
  // 1. Get user businesses
  const businessesRes = await fetch(
    `https://graph.facebook.com/v20.0/me/businesses?access_token=${accessToken}`
  );
  const businessesData = await businessesRes.json();

  if (businessesData.error) {
    throw new Error(`Failed to fetch businesses: ${businessesData.error.message}`);
  }

  const businesses = businessesData.data || [];
  const results = [];

  // 2. For each business, get WABAs
  for (const business of businesses) {
    const wabaRes = await fetch(
      `https://graph.facebook.com/v20.0/${business.id}/owned_whatsapp_business_accounts?access_token=${accessToken}`
    );
    const wabaData = await wabaRes.json();
    const wabas = wabaData.data || [];

    // 3. For each WABA, get phone numbers
    for (const waba of wabas) {
      const phonesRes = await fetch(
        `https://graph.facebook.com/v20.0/${waba.id}/phone_numbers?access_token=${accessToken}`
      );
      const phonesData = await phonesRes.json();
      const phones = phonesData.data || [];

      for (const phone of phones) {
        results.push({
          business_id: business.id,
          business_name: business.name,
          waba_id: waba.id,
          waba_name: waba.name,
          phone_number_id: phone.id,
          display_phone_number: phone.display_phone_number,
        });
      }
    }
  }

  return results;
}
