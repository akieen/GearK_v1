/**
 * Automated test script for Inventory / Warehouse management (Import & Export goods)
 * Run: node test/inventory.test.js
 */

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let targetVariantId = null;
let initialStock = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runTests() {
  console.log('========================================================');
  console.log('📦 TEST KHO HÀNG: NHẬP HÀNG & XUẤT KHO (INVENTORY TEST)');
  console.log('========================================================\n');

  // 1. Login Admin
  console.log('[1] Đăng nhập tài khoản Admin...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@geark.vn', password: 'admin123' }),
  });
  const loginData = await loginRes.json();
  assert(loginRes.ok && loginData.success, 'Đăng nhập admin thành công');
  authToken = loginData.data?.token || loginData.token;
  assert(!!authToken, 'Lấy được JWT authToken');

  // 2. Get Inventory list & KPIs
  console.log('\n[2] Kiểm tra lấy danh sách kho hàng & thống kê KPI...');
  const invRes = await fetch(`${BASE_URL}/inventory`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const invData = await invRes.json();
  assert(invRes.ok && invData.success, 'GET /api/inventory thành công');
  assert(Array.isArray(invData.data?.items) && invData.data.items.length > 0, 'Có danh sách mặt hàng trong kho');
  assert(typeof invData.data?.summary?.total_stock === 'number', 'Có tổng tồn kho summary');
  console.log(`    -> Tổng mặt hàng: ${invData.data.summary.total_variants}`);
  console.log(`    -> Tổng số lượng tồn kho: ${invData.data.summary.total_stock}`);
  console.log(`    -> Mặt hàng cảnh báo sắp hết (<=5): ${invData.data.summary.low_stock_count}`);

  const testItem = invData.data.items[0];
  targetVariantId = testItem.variant_id;
  initialStock = testItem.stock;
  console.log(`    -> Chọn biến thể test: ${testItem.product_name} - ${testItem.variant_name} (SKU: ${testItem.sku}, Tồn kho: ${initialStock})`);

  // 3. Test Nhập hàng (Import Stock)
  console.log('\n[3] Kiểm tra Nhập hàng vào kho (Import Stock +10)...');
  const importRes = await fetch(`${BASE_URL}/inventory/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      variant_id: targetVariantId,
      quantity: 10,
      unit_cost: 1200000,
      supplier_id: 1,
      note: 'Nhập hàng lô đợt 1 testcase',
    }),
  });
  const importData = await importRes.json();
  assert(importRes.status === 201 && importData.success, 'Nhập hàng thành công HTTP 201');
  assert(importData.data?.stock_after === initialStock + 10, `Tồn kho sau nhập đúng = ${initialStock + 10}`);
  console.log(`    -> ${importData.message}`);

  // 4. Test Xuất kho (Export Stock)
  console.log('\n[4] Kiểm tra Xuất kho (Export Stock -4)...');
  const exportRes = await fetch(`${BASE_URL}/inventory/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      variant_id: targetVariantId,
      quantity: 4,
      transaction_type: 'adjustment',
      reason: 'Xuất điều chuyển kiểm kê showroom',
    }),
  });
  const exportData = await exportRes.json();
  assert(exportRes.status === 201 && exportData.success, 'Xuất kho thành công HTTP 201');
  assert(exportData.data?.stock_after === initialStock + 10 - 4, `Tồn kho sau xuất đúng = ${initialStock + 6}`);
  console.log(`    -> ${exportData.message}`);

  // 5. Test Xuất quá số lượng tồn (Over-export prevention)
  console.log('\n[5] Kiểm tra chặn xuất kho vượt quá số lượng tồn hiện có...');
  const overExportRes = await fetch(`${BASE_URL}/inventory/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      variant_id: targetVariantId,
      quantity: 999999,
      reason: 'Cố tình xuất vượt tồn',
    }),
  });
  const overExportData = await overExportRes.json();
  assert(!overExportRes.ok && overExportRes.status === 400, 'Từ chối xuất vượt tồn với HTTP 400');
  console.log(`    -> Phản hồi: ${overExportData.message}`);

  // 6. Test Get Inventory Transactions log
  console.log('\n[6] Kiểm tra lịch sử giao dịch kho (Inventory Transactions Log)...');
  const txRes = await fetch(`${BASE_URL}/inventory/transactions?variant_id=${targetVariantId}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const txData = await txRes.json();
  assert(txRes.ok && txData.success, 'GET /api/inventory/transactions thành công');
  assert(Array.isArray(txData.data?.items) && txData.data.items.length >= 2, 'Ghi nhận ít nhất 2 giao dịch vừa thực hiện');

  const latestExport = txData.data.items[0];
  const latestImport = txData.data.items[1];
  assert(latestExport.quantity_delta === -4, 'Giao dịch xuất có quantity_delta = -4');
  assert(latestImport.quantity_delta === 10, 'Giao dịch nhập có quantity_delta = 10');
  console.log(`    -> Giao dịch 1: [${latestExport.transaction_type}] delta: ${latestExport.quantity_delta}, note: ${latestExport.note}`);
  console.log(`    -> Giao dịch 2: [${latestImport.transaction_type}] delta: ${latestImport.quantity_delta}, note: ${latestImport.note}`);

  // 7. Test Suppliers
  console.log('\n[7] Kiểm tra danh sách Nhà cung cấp (Suppliers)...');
  const supRes = await fetch(`${BASE_URL}/inventory/suppliers`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const supData = await supRes.json();
  assert(supRes.ok && supData.success, 'GET /api/inventory/suppliers thành công');
  assert(Array.isArray(supData.data) && supData.data.length > 0, 'Có danh sách nhà cung cấp');
  console.log(`    -> Số lượng nhà cung cấp: ${supData.data.length} (${supData.data.map((s) => s.supplier_name).join(', ')})`);

  // 8. Restore stock back to initialStock
  console.log('\n[8] Khôi phục tồn kho về ban đầu...');
  await fetch(`${BASE_URL}/inventory/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      variant_id: targetVariantId,
      quantity: 6,
      reason: 'Hoàn tác testcase',
    }),
  });
  console.log('    -> Đã cân bằng lại tồn kho ban đầu');

  console.log('\n========================================================');
  console.log('🎉 TẤT CẢ TESTCASE KHO HÀNG ĐÃ VƯỢT QUA HOÀN HẢO! (8/8)');
  console.log('========================================================');
}

runTests().catch((err) => {
  console.error('\n❌ TEST THẤT BẠI:', err);
  process.exit(1);
});
