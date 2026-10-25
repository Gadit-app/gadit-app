import type { ReactElement } from "react";

export const titlesVi = { privacy: "Chính sách quyền riêng tư", terms: "Điều khoản sử dụng" };

export function PrivacyBodyVi(): ReactElement {
  return (
    <>
      <p>
        Gadit (&ldquo;Gadit&rdquo;, &ldquo;chúng tôi&rdquo; hoặc &ldquo;của chúng tôi&rdquo;) là một dịch vụ do{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> vận hành, một công ty đã đăng ký tại Hoa Kỳ. Chính
        sách quyền riêng tư này giải thích những thông tin chúng tôi thu thập, cách chúng tôi sử dụng thông tin đó và các
        lựa chọn mà bạn có.
      </p>
      <p>
        Nếu bạn có bất kỳ câu hỏi nào, hãy liên hệ với chúng tôi tại{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>.
      </p>

      <h2>1. Thông tin chúng tôi thu thập</h2>
      <h3>Thông tin tài khoản</h3>
      <p>
        Khi bạn tạo tài khoản, chúng tôi thu thập địa chỉ email của bạn và, nếu bạn đăng nhập bằng Google, thông tin hồ
        sơ cơ bản do Google cung cấp (tên hiển thị, ảnh hồ sơ). Chúng tôi không nhận mật khẩu Google của bạn.
      </p>
      <h3>Thông tin sử dụng</h3>
      <p>Khi bạn sử dụng Gadit, chúng tôi xử lý:</p>
      <ul>
        <li>các từ và câu (không bắt buộc) mà bạn tra cứu;</li>
        <li>hình ảnh được tạo theo yêu cầu của bạn;</li>
        <li>gói đăng ký và trạng thái thanh toán của bạn;</li>
        <li>lịch sử tìm kiếm gần đây (đối với người dùng trả phí, tối đa 10 từ gần nhất), được lưu trữ để bạn có thể truy cập lại sau;</li>
        <li>hạn mức hằng tháng (ví dụ: số lượng hình ảnh bạn đã tạo trong chu kỳ thanh toán này).</li>
      </ul>
      <h3>Dữ liệu kỹ thuật và phân tích</h3>
      <p>
        Chúng tôi tự động thu thập thông tin kỹ thuật cơ bản như địa chỉ IP, loại trình duyệt, loại thiết bị, URL giới
        thiệu và các trang đã xem. Thông tin này được sử dụng cho mục đích bảo mật, giám sát hiệu suất và phân tích tổng
        hợp. Dịch vụ phân tích do Vercel cung cấp và được ẩn danh hóa ngay tại điểm thu thập (không lưu trữ thông tin định
        danh cá nhân nào). Trên các trang tiếp thị, đăng ký và thanh toán, chúng tôi cũng sử dụng các công cụ quảng
        cáo và phân tích, được mô tả tại Mục 3.
      </p>
      <h3>Thông tin thanh toán</h3>
      <p>
        Nếu bạn đăng ký gói trả phí, việc thanh toán được xử lý bởi <strong>Stripe, Inc.</strong> Chúng tôi không xem
        hoặc lưu trữ số thẻ đầy đủ của bạn; chúng tôi chỉ nhận mã thông báo (token) khách hàng và siêu dữ liệu cần thiết
        để xác định gói đăng ký.
      </p>

      <h2>2. Cách chúng tôi sử dụng thông tin của bạn</h2>
      <ul>
        <li>để cung cấp và cải thiện dịch vụ Gadit (tạo định nghĩa, hình ảnh, nhận xét về câu, bài kiểm tra nhanh);</li>
        <li>để duy trì tài khoản của bạn và cá nhân hóa trải nghiệm của bạn (lịch sử tìm kiếm, ngôn ngữ ưa thích, công tắc &ldquo;Chế độ trẻ em&rdquo;);</li>
        <li>để xử lý gói đăng ký và gửi email giao dịch (biên lai, thay đổi gói đăng ký);</li>
        <li>để đo lường và cải thiện hiệu suất sản phẩm và ngăn chặn hành vi lạm dụng;</li>
        <li>để tuân thủ các nghĩa vụ pháp lý.</li>
      </ul>
      <p>
        Chúng tôi <strong>không bán</strong> thông tin cá nhân của bạn và chúng tôi không sử dụng nội dung của bạn để
        quảng cáo cho bạn.
      </p>

      <h2>3. Các dịch vụ bên thứ ba mà chúng tôi sử dụng</h2>
      <p>
        Gadit dựa vào các bên xử lý dữ liệu sau đây. Mỗi bên chỉ nhận lượng thông tin tối thiểu cần thiết để cung cấp
        dịch vụ liên quan:
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>: xử lý các từ và câu bạn gửi để tạo định nghĩa, nhận xét về câu, bài kiểm tra nhanh và
          chuyển giọng nói thành văn bản (Whisper), đồng thời tạo hình ảnh (DALL·E 3). Dữ liệu gửi đến OpenAI chịu sự
          điều chỉnh của chính sách sử dụng dữ liệu API của OpenAI.
        </li>
        <li>
          <strong>Google Firebase</strong> (Authentication, Firestore, Cloud Storage): lưu trữ tài khoản, hồ sơ, trạng
          thái gói đăng ký, lịch sử tìm kiếm và hình ảnh được tạo của bạn.
        </li>
        <li>
          <strong>Stripe</strong>: xử lý thanh toán, gói đăng ký và cổng quản lý thanh toán.
        </li>
        <li>
          <strong>Vercel</strong>: lưu trữ và phân phối trang web, đồng thời cung cấp phân tích ẩn danh và đo lường
          hiệu suất.
        </li>
        <li>
          <strong>Quảng cáo và phân tích</strong>: Meta (Meta Pixel), Google Analytics và TikTok (TikTok Pixel và
          Events API) đo lường lượt truy cập và kết quả quảng cáo của chúng tôi. Các dịch vụ này sử dụng cookie và các
          công nghệ tương tự trên các trang tiếp thị, đăng ký và thanh toán của chúng tôi. Khi bạn đăng ký hoặc thanh
          toán, chúng tôi có thể gửi cho các dịch vụ này địa chỉ email và ID tài khoản đã được băm (mã hóa một chiều),
          cùng với địa chỉ IP và thông tin trình duyệt của bạn, chỉ để đo lường quảng cáo của chúng tôi. Chúng tôi
          không bao giờ gửi cho họ bất kỳ thông tin nào về trẻ em, và các công cụ này không chạy trên những màn hình
          mà trẻ em sử dụng.
        </li>
      </ul>

      <h2>4. Chúng tôi lưu giữ thông tin của bạn trong bao lâu</h2>
      <ul>
        <li>Thông tin tài khoản: trong thời gian tài khoản của bạn còn tồn tại.</li>
        <li>Lịch sử tìm kiếm: 10 lượt tìm kiếm gần nhất của mỗi người dùng, được cập nhật sau mỗi lượt tìm kiếm mới.</li>
        <li>Hình ảnh được tạo: được lưu giữ để cùng một tổ hợp từ+nghĩa có thể dùng lại hình ảnh đã lưu trong bộ nhớ đệm. Có thể được lưu giữ vô thời hạn chừng nào tài khoản của bạn còn hoạt động.</li>
        <li>Hồ sơ thanh toán và thuế: theo yêu cầu của pháp luật hiện hành (thường là 7 năm).</li>
        <li>Dữ liệu phân tích: ở dạng tổng hợp, thường được nhà cung cấp dịch vụ phân tích lưu giữ trong 13 tháng.</li>
      </ul>

      <h2>5. Quyền của bạn</h2>
      <p>Tùy thuộc vào nơi bạn sinh sống, bạn có thể có quyền:</p>
      <ul>
        <li>yêu cầu truy cập thông tin cá nhân mà chúng tôi lưu giữ về bạn;</li>
        <li>yêu cầu chỉnh sửa thông tin không chính xác;</li>
        <li>yêu cầu xóa tài khoản của bạn và dữ liệu liên quan;</li>
        <li>xuất dữ liệu của bạn ở định dạng có thể chuyển giao;</li>
        <li>phản đối hoặc hạn chế một số cách sử dụng thông tin của bạn;</li>
        <li>từ chối một số hình thức chia sẻ dữ liệu (khi áp dụng theo CCPA hoặc các luật tương tự).</li>
      </ul>
      <p>
        Để thực hiện bất kỳ quyền nào trong số này, hãy gửi email đến{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>. Chúng tôi sẽ phản hồi
        trong vòng 30 ngày.
      </p>

      <h2>6. Bảo mật</h2>
      <p>
        Chúng tôi sử dụng các biện pháp bảo vệ theo tiêu chuẩn ngành, gồm kết nối được mã hóa (HTTPS), API có xác thực
        và kiểm soát truy cập, để bảo vệ thông tin của bạn. Không có phương thức truyền tải hoặc lưu trữ nào trên internet
        an toàn 100%, vì vậy chúng tôi không thể đảm bảo an ninh tuyệt đối, nhưng chúng tôi liên tục nỗ lực để giảm thiểu
        rủi ro.
      </p>

      <h2>7. Trẻ em</h2>
      <p>
        Gadit không hướng đến trẻ em dưới 13 tuổi. Nếu bạn cho rằng một trẻ em dưới 13 tuổi đã tạo tài khoản, hãy gửi
        email cho chúng tôi và chúng tôi sẽ xóa tài khoản đó cùng dữ liệu liên quan.
      </p>

      <h2>8. Người dùng quốc tế</h2>
      <p>
        Gadit được vận hành từ Hoa Kỳ. Nếu bạn truy cập dịch vụ từ bên ngoài Hoa Kỳ, thông tin của bạn sẽ được chuyển
        đến, lưu trữ và xử lý tại Hoa Kỳ và tại các khu vực trung tâm dữ liệu mà các nhà cung cấp dịch vụ của chúng tôi
        sử dụng.
      </p>

      <h2>9. Thay đổi đối với chính sách này</h2>
      <p>
        Chúng tôi có thể cập nhật Chính sách quyền riêng tư này theo thời gian. Những thay đổi quan trọng sẽ được đăng
        trên trang này kèm theo ngày &ldquo;Cập nhật lần cuối&rdquo; đã được sửa đổi. Việc bạn tiếp tục sử dụng Gadit sau
        khi các thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận chính sách đã cập nhật.
      </p>

      <h2>10. Liên hệ</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Email:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}

export function TermsBodyVi(): ReactElement {
  return (
    <>
      <p>
        Chào mừng bạn đến với Gadit. Các Điều khoản sử dụng này (&ldquo;Điều khoản&rdquo;) điều chỉnh việc bạn truy cập
        và sử dụng trang web, ứng dụng và dịch vụ của Gadit (gọi chung là &ldquo;Dịch vụ&rdquo;), do{" "}
        <strong>Lavi Learning and Training Technologies LLC</strong> (&ldquo;chúng tôi&rdquo; hoặc &ldquo;của chúng
        tôi&rdquo;) vận hành. Bằng việc sử dụng Dịch vụ, bạn đồng ý chịu sự ràng buộc của các Điều khoản này. Nếu bạn
        không đồng ý, đừng sử dụng Dịch vụ.
      </p>

      <h2>1. Ai có thể sử dụng Gadit</h2>
      <p>
        Bạn phải từ đủ 13 tuổi trở lên để tạo tài khoản. Nếu bạn từ 13 đến 18 tuổi, bạn phải được cha mẹ hoặc người giám
        hộ hợp pháp cho phép. Bằng việc sử dụng Gadit, bạn cam đoan rằng bạn đáp ứng các yêu cầu này.
      </p>

      <h2>2. Tài khoản của bạn</h2>
      <p>
        Bạn chịu trách nhiệm giữ bí mật thông tin đăng nhập của mình và đối với mọi hoạt động diễn ra trong tài khoản của
        bạn. Hãy thông báo ngay cho chúng tôi qua{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> nếu bạn cho rằng tài khoản
        của mình đã bị xâm phạm.
      </p>

      <h2>3. Gói đăng ký và thanh toán</h2>
      <h3>Gói và phí</h3>
      <p>
        Gadit cung cấp gói Basic miễn phí và các gói trả phí (Clear và Deep) với các tính năng và mức giá được liệt kê
        trên trang bảng giá. Giá được niêm yết bằng USD và có thể thay đổi với thông báo trước ít nhất 30 ngày cho những
        người đăng ký hiện tại.
      </p>
      <h3>Tự động gia hạn</h3>
      <p>
        Các gói đăng ký trả phí được tự động gia hạn vào cuối mỗi kỳ thanh toán (hằng tháng hoặc hằng năm, tùy theo lựa
        chọn) theo mức giá hiện hành tại thời điểm đó, trừ khi được hủy trước ngày gia hạn.
      </p>
      <h3>Hủy</h3>
      <p>
        Bạn có thể hủy bất kỳ lúc nào từ trang tài khoản của mình. Việc hủy sẽ dừng các lần gia hạn trong tương lai. Bạn
        vẫn giữ quyền truy cập vào các tính năng trả phí cho đến hết kỳ thanh toán hiện tại. Chúng tôi không hoàn tiền
        một phần cho thời gian chưa sử dụng.
      </p>
      <h3>Hoàn tiền</h3>
      <p>
        Trừ trường hợp pháp luật có yêu cầu, các khoản thanh toán không được hoàn lại. Nếu bạn cho rằng mình bị tính phí
        nhầm, hãy liên hệ{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a> trong vòng 30 ngày kể từ
        ngày bị tính phí.
      </p>

      <h2>4. Sử dụng được chấp nhận</h2>
      <p>Bạn đồng ý không:</p>
      <ul>
        <li>sử dụng Dịch vụ cho bất kỳ mục đích bất hợp pháp nào hoặc vi phạm bất kỳ luật nào;</li>
        <li>tìm cách thực hiện kỹ thuật đảo ngược, dịch ngược mã hoặc trích xuất mã nguồn của Dịch vụ;</li>
        <li>lạm dụng, quấy rối hoặc gây hại cho người dùng khác, hoặc gửi nội dung mang tính thù ghét, đe dọa hoặc khiêu dâm;</li>
        <li>tự động hóa việc truy cập Dịch vụ vượt quá mức sử dụng cá nhân hợp lý (ví dụ: thu thập tự động định nghĩa trên quy mô lớn);</li>
        <li>lách giới hạn tần suất truy cập hoặc các hạn chế của gói, hoặc sử dụng nhiều tài khoản để né tránh hạn mức;</li>
        <li>sử dụng Dịch vụ để huấn luyện hoặc tinh chỉnh bất kỳ mô hình AI hoặc sản phẩm từ điển nào mang tính cạnh tranh;</li>
        <li>tải lên hoặc gửi nội dung mà bạn không có quyền gửi.</li>
      </ul>
      <p>
        Chúng tôi có quyền tạm ngừng hoặc chấm dứt các tài khoản vi phạm các Điều khoản này.
      </p>

      <h2>5. Nội dung do AI tạo ra</h2>
      <p>
        Gadit sử dụng các mô hình trí tuệ nhân tạo (bao gồm GPT, Whisper và DALL·E của OpenAI) để tạo định nghĩa, ví
        dụ, từ nguyên, nhận xét, bài kiểm tra nhanh, hình ảnh và bản chép lời. Bạn hiểu và đồng ý rằng:
      </p>
      <ul>
        <li>
          Kết quả do AI tạo ra có thể <strong>không chính xác, không đầy đủ hoặc không phù hợp</strong>. Gadit được thiết
          kế như một công cụ hỗ trợ học tập và không nên được dựa vào để đưa ra các quyết định pháp lý, y tế, nghề nghiệp
          hoặc học thuật.
        </li>
        <li>
          Các định nghĩa do AI tạo ra có thể khác với từ điển chính thức. Chúng tôi không đảm bảo rằng mọi định nghĩa đều
          có giá trị chuẩn mực về mặt ngôn ngữ học.
        </li>
        <li>
          Hình ảnh được tạo bằng thuật toán và đôi khi có thể không như mong đợi hoặc không chính xác. Đó là hình minh
          họa, không phải mô tả theo nghĩa đen.
        </li>
        <li>
          Bạn hoàn toàn chịu trách nhiệm về cách bạn diễn giải và sử dụng nội dung do AI tạo ra.
        </li>
      </ul>

      <h2>6. Nội dung của bạn</h2>
      <p>
        Khi bạn gửi từ, câu hoặc âm thanh đến Gadit (ví dụ khi sử dụng &ldquo;Tự đặt câu của bạn&rdquo; hoặc tính năng
        nhập bằng giọng nói), bạn cấp cho chúng tôi giấy phép toàn cầu, không độc quyền, miễn phí bản quyền
        (royalty-free) để xử lý nội dung đó nhằm mục đích cung cấp và cải thiện Dịch vụ. Chúng tôi không tuyên bố quyền
        sở hữu đối với nội dung bạn gửi.
      </p>

      <h2>7. Quyền sở hữu trí tuệ</h2>
      <p>
        Tên Gadit, logo, trang web và phần mềm nền tảng là tài sản của chúng tôi hoặc của các bên cấp phép cho chúng tôi.
        Bạn được cấp một giấy phép cá nhân, có thể thu hồi, không độc quyền để sử dụng Dịch vụ trong phạm vi được các
        Điều khoản này cho phép.
      </p>
      <p>
        Bạn có thể sử dụng nội dung do Gadit tạo ra để phản hồi dữ liệu đầu vào của bạn (định nghĩa, hình ảnh, v.v.) cho
        các mục đích cá nhân, giáo dục hoặc phi thương mại. Đối với việc sử dụng thương mại (ví dụ trong một sản phẩm trả
        phí), vui lòng liên hệ với chúng tôi.
      </p>

      <h2>8. Tính khả dụng và thay đổi</h2>
      <p>
        Chúng tôi cố gắng duy trì tính khả dụng của Dịch vụ nhưng không đảm bảo Dịch vụ hoạt động liên tục hoặc không có
        lỗi. Chúng tôi có thể sửa đổi, tạm ngừng hoặc ngừng cung cấp bất kỳ phần nào của Dịch vụ vào bất kỳ lúc nào, bao
        gồm tính năng, giá cả hoặc tính khả dụng tại các khu vực cụ thể.
      </p>

      <h2>9. Dịch vụ của bên thứ ba</h2>
      <p>
        Dịch vụ dựa vào các nhà cung cấp bên thứ ba (bao gồm OpenAI, Google Firebase, Stripe và Vercel). Tính khả dụng
        hoặc hoạt động của họ có thể ảnh hưởng đến trải nghiệm của bạn. Trách nhiệm của chúng tôi bị giới hạn theo Mục 11
        bất kể các sự cố do những nhà cung cấp này gây ra.
      </p>

      <h2>10. Tuyên bố miễn trừ trách nhiệm</h2>
      <p>
        DỊCH VỤ ĐƯỢC CUNG CẤP &ldquo;NGUYÊN TRẠNG&rdquo; VÀ &ldquo;THEO KHẢ NĂNG SẴN CÓ&rdquo;, KHÔNG KÈM THEO BẤT KỲ
        BẢO ĐẢM NÀO DƯỚI BẤT KỲ HÌNH THỨC NÀO, DÙ RÕ RÀNG HAY NGỤ Ý, BAO GỒM NHƯNG KHÔNG GIỚI HẠN Ở CÁC BẢO ĐẢM VỀ KHẢ
        NĂNG THƯƠNG MẠI (MERCHANTABILITY), SỰ PHÙ HỢP CHO MỘT MỤC ĐÍCH CỤ THỂ VÀ KHÔNG VI PHẠM QUYỀN
        (NON-INFRINGEMENT).
      </p>

      <h2>11. Giới hạn trách nhiệm</h2>
      <p>
        TRONG PHẠM VI TỐI ĐA ĐƯỢC PHÁP LUẬT CHO PHÉP, LAVI LEARNING AND TRAINING TECHNOLOGIES LLC VÀ CÁC CÁN BỘ QUẢN
        LÝ, NHÂN VIÊN VÀ ĐẠI LÝ CỦA CÔNG TY SẼ KHÔNG CHỊU TRÁCH NHIỆM ĐỐI VỚI BẤT KỲ THIỆT HẠI GIÁN TIẾP, NGẪU NHIÊN,
        ĐẶC BIỆT, HỆ QUẢ HOẶC MANG TÍNH TRỪNG PHẠT (PUNITIVE DAMAGES) NÀO, HOẶC ĐỐI VỚI BẤT KỲ KHOẢN MẤT LỢI NHUẬN HOẶC
        DOANH THU NÀO, PHÁT SINH TỪ HOẶC LIÊN QUAN ĐẾN VIỆC BẠN SỬ DỤNG DỊCH VỤ.
      </p>
      <p>
        TỔNG TRÁCH NHIỆM CỦA CHÚNG TÔI ĐỐI VỚI BẤT KỲ KHIẾU NẠI NÀO PHÁT SINH TỪ HOẶC LIÊN QUAN ĐẾN DỊCH VỤ SẼ KHÔNG
        VƯỢT QUÁ SỐ TIỀN LỚN HƠN GIỮA (A) SỐ TIỀN BẠN ĐÃ THANH TOÁN CHO CHÚNG TÔI TRONG MƯỜI HAI THÁNG TRƯỚC KHI PHÁT
        SINH KHIẾU NẠI, HOẶC (B) USD $100.
      </p>

      <h2>12. Chấm dứt</h2>
      <p>
        Bạn có thể ngừng sử dụng Dịch vụ bất kỳ lúc nào. Chúng tôi có thể tạm ngừng hoặc chấm dứt quyền truy cập của bạn
        nếu bạn vi phạm các Điều khoản này hoặc nếu pháp luật yêu cầu. Khi chấm dứt, các điều khoản mà theo bản chất cần
        tiếp tục tồn tại (bao gồm các Mục 7, 10, 11 và 14) sẽ vẫn có hiệu lực.
      </p>

      <h2>13. Thay đổi đối với các Điều khoản này</h2>
      <p>
        Chúng tôi có thể sửa đổi các Điều khoản này theo thời gian. Những thay đổi quan trọng sẽ được đăng trên trang này
        kèm theo ngày &ldquo;Cập nhật lần cuối&rdquo; đã được sửa đổi. Việc bạn tiếp tục sử dụng Dịch vụ sau khi các thay
        đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận các Điều khoản đã cập nhật.
      </p>

      <h2>14. Luật điều chỉnh và giải quyết tranh chấp</h2>
      <p>
        Các Điều khoản này được điều chỉnh bởi pháp luật của Tiểu bang Delaware, Hoa Kỳ, không tính đến các quy tắc xung
        đột pháp luật (conflict-of-law rules) của tiểu bang này. Mọi tranh chấp phát sinh từ hoặc liên quan đến các Điều
        khoản này hoặc Dịch vụ sẽ chỉ được giải quyết tại các tòa án tiểu bang hoặc liên bang đặt tại Delaware, Hoa Kỳ,
        và bạn đồng ý với thẩm quyền tài phán đối với cá nhân (personal jurisdiction) của các tòa án đó.
      </p>

      <h2>15. Liên hệ</h2>
      <p>
        Lavi Learning and Training Technologies LLC<br />
        Email:{" "}
        <a href="mailto:support@gadit.app">support@gadit.app</a>
      </p>
    </>
  );
}
