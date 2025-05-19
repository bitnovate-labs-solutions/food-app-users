import { supabase } from '../src/lib/supabase';
import { backOfficeSupabase } from '../src/lib/supabase-bo';

async function testExpiry() {
  try {
    // 1. Get your user ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    
    // 2. Create a test purchase
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        total_amount: 99.99,
        status: 'completed'
      })
      .select()
      .single();
    
    if (purchaseError) throw purchaseError;

    // 3. Get a menu package to purchase
    const { data: menuPackage, error: menuError } = await backOfficeSupabase
      .from('menu_packages')
      .select('id, price')
      .limit(1)
      .single();
    
    if (menuError) throw menuError;

    // 4. Create purchase item (this will trigger the expiry date)
    const { data: purchaseItem, error: itemError } = await supabase
      .from('purchase_items')
      .insert({
        purchase_id: purchase.id,
        package_id: menuPackage.id,
        price: menuPackage.price,
        quantity: 1
      })
      .select()
      .single();

    if (itemError) throw itemError;

    // 5. Create voucher instance
    const { data: voucher, error: voucherError } = await supabase
      .from('voucher_instances')
      .insert({
        purchase_item_id: purchaseItem.id,
        user_id: user.id,
        used: false
      })
      .select()
      .single();

    if (voucherError) throw voucherError;

    console.log('Test purchase created successfully!');
    console.log('Purchase ID:', purchase.id);
    console.log('Purchase Item ID:', purchaseItem.id);
    console.log('Voucher ID:', voucher.id);
    console.log('\nThe voucher will expire in 1 minute.');
    console.log('Check the History tab after 1 minute to see the expired status.');

  } catch (error) {
    console.error('Error creating test purchase:', error);
  }
}

// Run the test
testExpiry(); 