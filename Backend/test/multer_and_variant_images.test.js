/**
 * Automated test script for Multer file upload & Product Variant Images
 * Run: node test/multer_and_variant_images.test.js
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testProductId = null;
let testVariantId = null;
let testUploadedUrl = '';

// Helper for assertions
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
}

// Minimal 1x1 transparent PNG buffer for testing
const SAMPLE_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

async function runTests() {
  console.log('========================================================');
  console.log('🧪 BẮT ĐẦU TESTCASE: MULTER UPLOAD & VARIANT IMAGE LIST');
  console.log('========================================================\n');

  // TEST 1: Admin Login
  console.log('[1] Kiểm tra đăng nhập Admin...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@geark.vn', password: 'admin123' }),
  });
  const loginData = await loginRes.json();
  assert(loginRes.ok && loginData.success, 'Đăng nhập admin thành công');
  authToken = loginData.data?.token || loginData.token;
  assert(!!authToken, 'Lấy được authToken hợp lệ');

  // TEST 2: Multer File Upload with image
  console.log('\n[2] Kiểm tra Multer Upload ảnh bằng file...');
  const formData = new FormData();
  const fileBlob = new Blob([SAMPLE_PNG_BUFFER], { type: 'image/png' });
  formData.append('file', fileBlob, 'test_gear_image.png');

  const uploadRes = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authToken}` },
    body: formData,
  });
  const uploadData = await uploadRes.json();
  assert(uploadRes.status === 201, `Status code 201 Created (got ${uploadRes.status})`);
  assert(uploadData.success, 'Upload ảnh thành công');
  assert(typeof uploadData.data?.url === 'string' && uploadData.data.url.startsWith('/uploads/'), 'URL trả về có định dạng /uploads/...');
  testUploadedUrl = uploadData.data.url;
  console.log(`    -> Uploaded URL: ${testUploadedUrl}`);

  // TEST 3: Check static file served on disk & via HTTP
  console.log('\n[3] Kiểm tra tệp tĩnh được lưu trên ổ đĩa và truy cập qua HTTP GET...');
  const localFilePath = path.join(__dirname, '../public', testUploadedUrl);
  assert(fs.existsSync(localFilePath), `Tệp tồn tại trên ổ đĩa tại: ${localFilePath}`);

  const staticRes = await fetch(`http://localhost:5000${testUploadedUrl}`);
  assert(staticRes.ok, `Truy cập ảnh tĩnh HTTP 200 OK từ http://localhost:5000${testUploadedUrl}`);
  assert(staticRes.headers.get('content-type')?.includes('image/png'), 'Header Content-Type đúng image/png');

  // TEST 4: Multer rejection of invalid file type
  console.log('\n[4] Kiểm tra Multer từ chối tệp không phải định dạng ảnh (.txt)...');
  const badFormData = new FormData();
  const textBlob = new Blob(['This is not an image'], { type: 'text/plain' });
  badFormData.append('file', textBlob, 'malicious_script.txt');

  const badUploadRes = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authToken}` },
    body: badFormData,
  });
  const badUploadData = await badUploadRes.json();
  assert(!badUploadRes.ok && badUploadRes.status === 400, 'Từ chối tệp .txt với HTTP 400');
  console.log(`    -> Phản hồi mong đợi: ${badUploadData.message}`);

  // TEST 5: Create Product with Variant Image List
  console.log('\n[5] Kiểm tra tạo sản phẩm kèm danh sách ảnh của biến thể...');
  const testSlug = `test-gear-mouse-${Date.now()}`;
  const prodPayload = {
    product_name: `Chuột Test Gaming Gear ${Date.now()}`,
    slug: testSlug,
    category_id: 1,
    brand_id: 1,
    description: 'Chuột gaming test tính năng Multer và Variant Images',
    thumbnail_url: testUploadedUrl,
    variants: [
      {
        sku: `SKU-TEST-WHT-${Date.now().toString().slice(-4)}`,
        variant_name: 'Bản Trắng Moonlight',
        price: 1590000,
        sale_price: 1390000,
        stock: 50,
        warranty_months: 24,
        images: [
          { image_url: testUploadedUrl, is_primary: 1, sort_order: 0 },
          { image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7', is_primary: 0, sort_order: 1 },
        ],
      },
      {
        sku: `SKU-TEST-BLK-${Date.now().toString().slice(-4)}`,
        variant_name: 'Bản Đen Stealth',
        price: 1590000,
        stock: 30,
        warranty_months: 24,
        images: [
          'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46',
        ],
      },
    ],
  };

  const createProdRes = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(prodPayload),
  });
  const createProdData = await createProdRes.json();
  assert(createProdRes.status === 201, `Tạo sản phẩm thành công HTTP 201 (got ${createProdRes.status})`);
  testProductId = createProdData.data?.product_id;
  assert(!!testProductId, `Nhận được product_id = ${testProductId}`);

  // TEST 6: Verify Product Detail returns Variant Images List
  console.log('\n[6] Kiểm tra chi tiết sản phẩm trả về danh sách ảnh của biến thể...');
  const detailRes = await fetch(`${BASE_URL}/products/${testSlug}`);
  const detailData = await detailRes.json();
  assert(detailRes.ok && detailData.success, 'Lấy chi tiết sản phẩm thành công');
  const fetchedVariants = detailData.data?.variants || [];
  assert(fetchedVariants.length === 2, `Sản phẩm có 2 biến thể (got ${fetchedVariants.length})`);
  
  const whiteVar = fetchedVariants.find((v) => v.variant_name.includes('Trắng'));
  assert(!!whiteVar, 'Tìm thấy biến thể Bản Trắng');
  assert(Array.isArray(whiteVar.images) && whiteVar.images.length === 2, `Biến thể trắng có 2 ảnh trong images array (got ${whiteVar.images?.length})`);
  assert(whiteVar.images[0].is_primary === 1, 'Ảnh đầu tiên của biến thể trắng có is_primary = 1');
  testVariantId = whiteVar.variant_id;

  // TEST 7: Add Variant Image via Multer file upload directly to Variant endpoint
  console.log('\n[7] Kiểm tra thêm ảnh trực tiếp cho biến thể qua Multer file upload...');
  const varImgFormData = new FormData();
  const extraBlob = new Blob([SAMPLE_PNG_BUFFER], { type: 'image/png' });
  varImgFormData.append('image', extraBlob, 'extra_variant_view.png');

  const addVarImgRes = await fetch(`${BASE_URL}/products/variants/${testVariantId}/images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authToken}` },
    body: varImgFormData,
  });
  const addVarImgData = await addVarImgRes.json();
  assert(addVarImgRes.status === 201, `Thêm ảnh biến thể HTTP 201 Created (got ${addVarImgRes.status})`);
  assert(addVarImgData.success, 'Thêm ảnh biến thể thành công');
  const addedImageId = addVarImgData.data?.image_id;
  assert(!!addedImageId, `Nhận được image_id = ${addedImageId}`);

  // TEST 8: Get Variant Images List
  console.log('\n[8] Kiểm tra GET danh sách ảnh của biến thể...');
  const getVarImgsRes = await fetch(`${BASE_URL}/products/variants/${testVariantId}/images`);
  const getVarImgsData = await getVarImgsRes.json();
  assert(getVarImgsRes.ok && getVarImgsData.success, 'GET danh sách ảnh biến thể thành công');
  assert(getVarImgsData.data.length === 3, `Biến thể hiện có 3 ảnh (got ${getVarImgsData.data.length})`);

  // TEST 9: Set Primary Variant Image
  console.log('\n[9] Kiểm tra đặt ảnh làm ảnh chính cho biến thể (setPrimary)...');
  const setPrimaryRes = await fetch(`${BASE_URL}/products/variants/images/${addedImageId}/primary`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const setPrimaryData = await setPrimaryRes.json();
  assert(setPrimaryRes.ok && setPrimaryData.success, 'Đặt ảnh chính cho biến thể thành công');

  const verifyPrimaryRes = await fetch(`${BASE_URL}/products/variants/${testVariantId}/images`);
  const verifyPrimaryData = await verifyPrimaryRes.json();
  const primaryImg = verifyPrimaryData.data?.find((img) => img.image_id === addedImageId);
  assert(primaryImg && primaryImg.is_primary === 1, 'Ảnh vừa chọn đã trở thành is_primary = 1');
  const otherPrimaries = verifyPrimaryData.data?.filter((img) => img.image_id !== addedImageId && img.is_primary === 1);
  assert(otherPrimaries.length === 0, 'Các ảnh khác của biến thể đã được chuyển về is_primary = 0');

  // TEST 10: Delete Variant Image
  console.log('\n[10] Kiểm tra xóa ảnh biến thể...');
  const delImgRes = await fetch(`${BASE_URL}/products/variants/images/${addedImageId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const delImgData = await delImgRes.json();
  assert(delImgRes.ok && delImgData.success, 'Xóa ảnh biến thể thành công');

  const afterDelRes = await fetch(`${BASE_URL}/products/variants/${testVariantId}/images`);
  const afterDelData = await afterDelRes.json();
  assert(afterDelData.data.length === 2, `Biến thể còn lại 2 ảnh sau khi xóa (got ${afterDelData.data.length})`);

  // TEST 11: Cleanup test product
  console.log('\n[11] Dọn dẹp dữ liệu test...');
  const delProdRes = await fetch(`${BASE_URL}/products/${testProductId}?hardDelete=true`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const delProdData = await delProdRes.json();
  assert(delProdRes.ok && delProdData.success, 'Xóa vĩnh viễn sản phẩm test thành công');

  console.log('\n========================================================');
  console.log('🎉 TẤT CẢ TESTCASE ĐÃ VƯỢT QUA XUẤT SẮC! (11/11 PASSED)');
  console.log('========================================================');
}

runTests().catch((err) => {
  console.error('\n❌ TEST THẤT BẠI:', err);
  process.exit(1);
});
