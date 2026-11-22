TÀI LIỆU NGHIỆP VỤ – TÍCH HỢP GIAO HÀNG GHN
GHN Shipping Integration
MVP
Staging
Backend / Frontend

Thông tin	Mô tả
Hệ thống	Website thương mại điện tử
Đơn vị vận chuyển	Giao Hàng Nhanh (GHN)
Đối tượng	Khách hàng, nhân viên quản trị
Mục tiêu	Tính phí, tạo vận đơn, theo dõi giao hàng
Phạm vi	Giao hàng nội địa Việt Nam


1. Mục tiêu nghiệp vụ
Hệ thống tích hợp GHN nhằm:
1. Cho phép khách hàng lựa chọn địa chỉ nhận hàng theo danh mục địa chỉ GHN.
2. Tự động tính phí vận chuyển dựa trên địa chỉ và thông tin kiện hàng.
3. Hiển thị phí vận chuyển trước khi khách xác nhận đặt hàng.
4. Cho phép nhân viên quản trị tạo vận đơn GHN từ đơn hàng đã xác nhận.
5. Đồng bộ trạng thái vận chuyển từ GHN về website.
6. Cho phép khách hàng theo dõi tiến trình giao hàng.
7. Hỗ trợ quản trị viên hủy vận đơn khi đủ điều kiện.
2. Đối tượng sử dụng
Đối tượng	Quyền nghiệp vụ
Khách hàng	Chọn địa chỉ, xem phí ship, đặt hàng, theo dõi giao hàng
Nhân viên bán hàng	Xác nhận đơn, kiểm tra thông tin, tạo vận đơn
Nhân viên kho	Đóng gói, bàn giao hàng cho GHN
Quản trị viên	Quản lý vận chuyển, hủy vận đơn, xử lý lỗi
Hệ thống GHN	Tiếp nhận vận đơn, vận chuyển, gửi trạng thái

3. Các nghiệp vụ chính
3.1. Quản lý địa chỉ giao hàng
Mục đích: Đảm bảo địa chỉ khách hàng hợp lệ và tương thích với hệ thống GHN.

Luồng nghiệp vụ:
1. Khách hàng truy cập trang thanh toán.
2. Chọn tỉnh/thành phố.
3. Hệ thống lấy danh sách quận/huyện tương ứng (nếu API/danh mục GHN đang sử dụng có cấp này).
4. Khách hàng chọn quận/huyện.
5. Hệ thống lấy danh sách phường/xã tương ứng.
6. Khách hàng nhập địa chỉ chi tiết: số nhà, tên đường, tòa nhà...
7. Hệ thống lưu thông tin địa chỉ.
Quy tắc nghiệp vụ:
- Tỉnh/thành và phường/xã phải sử dụng ID tương ứng do GHN cung cấp.
- Địa chỉ chi tiết không được để trống.
- Không cho phép tính phí nếu thiếu thông tin địa chỉ bắt buộc.
- Địa chỉ đã lưu của khách hàng cần được kiểm tra lại khi tạo vận đơn, tránh dùng ID địa chỉ cũ hoặc không còn hợp lệ.
3.2. Tính phí vận chuyển
Mục đích: Xác định phí giao hàng trước khi khách hàng đặt hàng.

Luồng nghiệp vụ:
1. Khách hàng thêm sản phẩm vào giỏ hàng.
2. Khách hàng nhập hoặc chọn địa chỉ giao hàng.
3. Backend lấy thông tin sản phẩm trong giỏ hàng.
4. Backend tính tổng khối lượng và kích thước kiện hàng dự kiến.
5. Backend gọi API GHN lấy dịch vụ vận chuyển khả dụng.
6. Backend gọi API tính phí vận chuyển.
7. Website hiển thị phí ship cho khách hàng.
8. Khách hàng xác nhận phương thức giao hàng.
Quy tắc nghiệp vụ:
- Chỉ hiển thị những dịch vụ GHN trả về hợp lệ.
- Phí ship phải được tính từ backend, không tin tưởng giá trị frontend gửi lên.
- Tổng tiền thanh toán:
\[
Tổng\ tiền = Tiền\ hàng + Phí\ ship - Giảm\ giá
\]

- Nếu thay đổi địa chỉ, số lượng sản phẩm hoặc dịch vụ vận chuyển, hệ thống phải tính lại phí.
- Phí ship tại thời điểm đặt hàng cần được lưu lại để đảm bảo lịch sử giao dịch.
3.3. Đặt hàng và tạo đơn hàng nội bộ
Mục đích: Lưu đơn hàng vào hệ thống trước khi tạo vận đơn GHN.

Luồng nghiệp vụ:
1. Khách hàng nhấn Đặt hàng.
2. Backend kiểm tra sản phẩm và tồn kho.
3. Backend kiểm tra giá sản phẩm hiện tại.
4. Backend kiểm tra địa chỉ giao hàng.
5. Backend kiểm tra phí vận chuyển đã tính.
6. Backend tính tổng tiền.
7. Backend tạo đơn hàng nội bộ.
8. Backend lưu thông tin người nhận, sản phẩm, giá bán và phí vận chuyển tại thời điểm đặt hàng.
9. Đơn hàng chuyển sang trạng thái chờ xác nhận.
Quy tắc nghiệp vụ:
- Mỗi đơn hàng có mã đơn hàng riêng.
- Không tạo đơn hàng trùng khi khách nhấn nút đặt hàng nhiều lần.
- Giá sản phẩm phải lấy từ database.
- Không được tạo vận đơn khi đơn hàng chưa đủ điều kiện.
- Nếu khách thanh toán online, cần kiểm tra kết quả thanh toán trước khi xác nhận đơn theo chính sách của shop.
3.4. Nhân viên xác nhận và tạo vận đơn GHN
Mục đích: Chuyển đơn hàng nội bộ thành đơn giao hàng thực tế.

Luồng nghiệp vụ:
1. Nhân viên truy cập trang quản lý đơn hàng.
2. Chọn đơn hàng đang chờ xác nhận.
3. Kiểm tra thông tin khách hàng.
4. Kiểm tra danh sách sản phẩm.
5. Kiểm tra tồn kho và khả năng đóng gói.
6. Xác nhận đơn hàng.
7. Hệ thống lấy thông tin kho gửi hàng.
8. Backend gọi API GHN tạo vận đơn.
9. GHN trả về mã vận đơn order_code.
10. Hệ thống lưu mã vận đơn vào database.
11. Đơn hàng chuyển sang trạng thái chờ lấy hàng.
Quy tắc nghiệp vụ:
- Mỗi đơn hàng chỉ có một vận đơn GHN đang hoạt động, trừ trường hợp nghiệp vụ tách kiện.
- Không tạo vận đơn khi thiếu thông tin người nhận.
- COD phải được tính đúng theo số tiền khách còn phải thanh toán.
- Giá trị hàng hóa và giá trị khai báo bảo hiểm phải được xử lý theo chính sách riêng.
- Nếu API GHN lỗi, đơn nội bộ vẫn được giữ nguyên.
- Không tự động tạo vận đơn lại nếu chưa xác định lần gọi trước đã thất bại hay chưa, tránh tạo vận đơn trùng.
- Lưu lại request, response và lỗi GHN để phục vụ đối soát.
3.5. Theo dõi trạng thái vận chuyển
Mục đích: Cập nhật trạng thái đơn hàng theo tiến trình vận chuyển của GHN.

Luồng nghiệp vụ:
1. GHN phát sinh sự kiện thay đổi trạng thái.
2. GHN gửi Webhook đến backend.
3. Backend xác thực nguồn gửi theo cơ chế bảo mật được GHN hỗ trợ.
4. Backend kiểm tra mã vận đơn.
5. Backend lưu lịch sử trạng thái.
6. Backend cập nhật trạng thái vận chuyển hiện tại.
7. Website hiển thị tiến trình giao hàng cho khách hàng.
Các trạng thái nghiệp vụ nên chuẩn hóa ở website:
Trạng thái website	Ý nghĩa
PENDING	Chờ xác nhận
CONFIRMED	Đã xác nhận
READY_TO_SHIP	Chờ tạo vận đơn
WAITING_PICKUP	Chờ GHN lấy hàng
PICKING	GHN đang lấy hàng
IN_TRANSIT	Đang vận chuyển
DELIVERING	Đang giao cho khách
DELIVERED	Giao hàng thành công
DELIVERY_FAILED	Giao hàng không thành công
RETURNING	Đang hoàn hàng
RETURNED	Đã hoàn hàng
CANCELLED	Đã hủy

Lưu ý: Đây là trạng thái chuẩn hóa của website, không phải tên trạng thái nguyên bản GHN. Backend cần ánh xạ từ mã trạng thái GHN thực tế.

Quy tắc nghiệp vụ:
- Webhook có thể được gửi nhiều lần, cần xử lý idempotency.
- Không cho phép trạng thái cũ ghi đè trạng thái mới.
- Mỗi lần thay đổi trạng thái phải lưu lịch sử.
- Khi webhook lỗi, cần có cơ chế retry hoặc đối soát bằng API tra cứu đơn hàng.
3.6. Hủy vận đơn
Mục đích: Cho phép nhân viên hủy vận đơn khi đơn hàng chưa được giao thành công và GHN còn cho phép hủy.

Luồng nghiệp vụ:
1. Nhân viên truy cập đơn hàng.
2. Nhấn Hủy vận chuyển.
3. Hệ thống kiểm tra trạng thái vận đơn.
4. Backend gọi API GHN hủy đơn.
5. GHN trả về kết quả.
6. Nếu thành công, hệ thống cập nhật vận đơn đã hủy.
7. Nhân viên tiếp tục xử lý đơn hàng nội bộ theo chính sách shop.
Quy tắc nghiệp vụ:
- Không cho phép khách hàng tự hủy vận đơn trực tiếp.
- Không cho phép hủy vận đơn đã giao thành công.
- Nếu GHN từ chối hủy, không được cập nhật trạng thái thành công giả.
- Hủy vận đơn không đồng nghĩa với hoàn tiền cho khách hàng.
- Nếu khách vẫn muốn mua hàng, shop có thể tạo vận đơn mới sau khi xử lý vận đơn cũ.
3.7. In vận đơn
Mục đích: Hỗ trợ nhân viên kho chuẩn bị hàng hóa.

Luồng nghiệp vụ:
1. Nhân viên chọn đơn hàng đã tạo vận đơn.
2. Hệ thống lấy mã vận đơn GHN.
3. Backend gọi API lấy thông tin/in vận đơn.
4. Hệ thống trả về file hoặc đường dẫn in theo định dạng GHN hỗ trợ.
5. Nhân viên in và dán lên kiện hàng.

4. Nghiệp vụ đặc biệt dành cho shop công nghệ
Đây là phần mình khuyên nên bổ sung ngay từ đầu vì sản phẩm công nghệ có giá trị cao.
Tình huống	Cách xử lý
Laptop giá trị cao	Khai báo giá trị hàng hóa, kiểm tra chính sách bảo hiểm
Khách mua nhiều sản phẩm	Tính tổng khối lượng và kích thước đóng gói
Khách mua laptop + phụ kiện	Đóng gói thành kiện hàng phù hợp
Khách thanh toán trước	COD = 0
Khách thanh toán khi nhận	COD = số tiền còn phải thu
GHN giao thất bại	Cập nhật trạng thái, chờ xử lý giao lại hoặc hoàn hàng
Hàng bị hoàn	Nhân viên kho kiểm tra ngoại quan, phụ kiện và tình trạng thiết bị
Hàng bị hư hỏng	Lập biên bản, lưu hình ảnh và xử lý khiếu nại theo chính sách

Đặc biệt, đối với laptop và thiết bị điện tử, cần có quy trình kiểm tra serial/IMEI, phụ kiện và tình trạng sản phẩm khi xuất kho và khi nhận hàng hoàn.

5. Nghiệp vụ quản trị vận chuyển
Trang quản trị nên có các chức năng:
Quản lý vận đơn

Danh sách mã vận đơn, đơn hàng, trạng thái GHN



Tính phí vận chuyển

Kiểm tra phí ship, dịch vụ và thông tin kiện hàng



Đồng bộ trạng thái

Webhook, tra cứu lại, xử lý trạng thái sai lệch



In vận đơn

In phiếu giao hàng và quản lý đóng gói



Đối soát COD

Theo dõi tiền thu hộ và tiền GHN chuyển về



6. Đề xuất cấu trúc database
Mình đề xuất các bảng sau:
Bảng	Chức năng
provinces	Danh mục tỉnh/thành
wards	Danh mục phường/xã
shipping_services	Dịch vụ GHN
orders	Đơn hàng nội bộ
order_items	Chi tiết sản phẩm
shipments	Thông tin vận đơn
shipment_histories	Lịch sử vận chuyển
shipment_packages	Thông tin kiện hàng
shipping_webhook_logs	Log Webhook
shipping_api_logs	Log API GHN

Lưu ý: provinces, wards, shipping_services là dữ liệu danh mục được đồng bộ từ GHN; không nhất thiết phải tạo bảng riêng nếu hệ thống đã có danh mục địa chỉ và dịch vụ phù hợp.
7. Phân chia phạm vi triển khai
Giai đoạn	Chức năng	Ưu tiên
Phase 1	Địa chỉ, dịch vụ, tính phí	Must have
Phase 2	Tạo đơn, tạo vận đơn	Must have
Phase 3	Webhook, theo dõi trạng thái	Must have
Phase 4	Hủy đơn, in vận đơn	Should have
Phase 5	COD, đối soát, hoàn hàng	Should have
Phase 6	Nhiều kho, nhiều đơn vị vận chuyển	Future


8. Tiêu chí nghiệm thu
- [ ] Khách hàng chọn được địa chỉ giao hàng hợp lệ.
- [ ] Hệ thống tính được phí ship từ GHN.
- [ ] Phí ship được lưu vào đơn hàng.
- [ ] Khách hàng không thể tự sửa phí vận chuyển bằng frontend.
- [ ] Nhân viên tạo được vận đơn từ đơn hàng nội bộ.
- [ ] Mã vận đơn GHN được lưu chính xác.
- [ ] Webhook cập nhật đúng trạng thái.
- [ ] Webhook gửi lặp không tạo dữ liệu trùng.
- [ ] Có thể tra cứu vận đơn.
- [ ] Có thể hủy vận đơn theo điều kiện GHN.
- [ ] Không mất đơn hàng nội bộ khi GHN gặp lỗi.
- [ ] COD được tính đúng với phương thức thanh toán.
- [ ] Có log để truy vết lỗi tích hợp.

9. Kiến trúc tích hợp đề xuất
Nếu backend của cậu chủ sử dụng Laravel hoặc NestJS, mình khuyên xây dựng một lớp trung gian riêng:
ShippingModule/
├── Controllers/
│   ├── ShippingController
│   └── ShippingWebhookController
├── Services/
│   ├── ShippingService
│   ├── ShippingFeeService
│   └── ShippingOrderService
├── Providers/
│   ├── ShippingProviderInterface
│   └── GHNProvider
├── DTOs/
├── Enums/
└── Repositories/


Không gọi GHN trực tiếp từ OrderController. Order chỉ gọi ShippingService, còn ShippingService làm việc với GHNProvider.

Như vậy sau này muốn tích hợp thêm Viettel Post hoặc J&T thì không phải viết lại nghiệp vụ đơn hàng.

Tài liệu tham khảo: GHN API Documentation.
