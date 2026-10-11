import type { HelpContent } from "./help-i18n";
import type { Lang } from "./i18n";

/** Help Center in vi, fil, af, sw, da, hu (2026-10-10 i18n sweep). Same ids, order and meaning as the English block in help-i18n.ts. */
export const HELP_MORE_4: Partial<Record<Lang, HelpContent>> = {
  vi: {
    eyebrow: "Trung tâm trợ giúp",
    heading: "Tìm câu trả lời thật nhanh.",
    lede: "Các câu hỏi thường gặp và cách khắc phục từng bước, sắp xếp theo chủ đề. Nếu bạn không thấy vấn đề của mình, hãy liên hệ với đội ngũ ở cuối trang.",
    stillNeedHelpHeading: "Vẫn chưa giải quyết được?",
    stillNeedHelpBody: "Hãy viết trực tiếp cho chúng tôi. Mọi tin nhắn đều được đội ngũ đọc và trả lời trong vòng một hoặc hai ngày.",
    emailCta: "Gửi email cho chúng tôi",
    responseTime: "Thời gian trả lời thông thường: trong vòng 24 đến 48 giờ.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Thanh toán và gói đăng ký",
        items: [
          {
            id: "change-card",
            q: "Làm sao để thay đổi thẻ tín dụng cho gói đăng ký của tôi?",
            a: [
              "Bạn có thể chuyển sang thẻ mới trong chưa đầy một phút mà không cần hủy. Gói đăng ký hiện tại vẫn tiếp tục chạy, chỉ là trên thẻ mới.",
              "1. Đăng nhập tại gadit.app và mở trang Tài khoản (góc trên bên phải). 2. Nhấn \"Quản lý thanh toán\". 3. Một trang Stripe bảo mật sẽ mở ra. Nhấn \"Thêm phương thức thanh toán\", nhập thẻ mới và đặt làm Mặc định. 4. Nếu muốn, hãy xóa thẻ cũ.",
              "Từ chu kỳ thanh toán tiếp theo, mọi khoản phí sẽ được tính vào thẻ mới. Khoản phí trước đó (đã thu) vẫn nằm trên thẻ cũ. Không cần hoàn tiền, trừ khi bạn thực sự muốn.",
            ],
          },
          {
            id: "cancel",
            q: "Làm sao để hủy gói đăng ký?",
            a: [
              "Bạn tự làm được, bất cứ lúc nào. Đăng nhập, mở Tài khoản và chạm vào Hủy gói đăng ký bên dưới gói của bạn.",
              "Bạn vẫn được sử dụng đến hết kỳ đã thanh toán. Sau đó tài khoản sẽ trở về gói Basic (miễn phí). Các từ đã lưu, lịch sử và sổ tay của bạn vẫn được giữ an toàn và truy cập được.",
              "Nếu bạn lỡ hủy hoặc đổi ý, bạn có thể tiếp tục gói đăng ký ngay trên cùng trang đó trước khi kỳ hiện tại kết thúc.",
            ],
          },
          {
            id: "switch-plan",
            q: "Làm sao để chuyển từ Clear sang Deep (hoặc ngược lại)?",
            a: [
              "Vào Tài khoản, rồi Quản lý thanh toán, rồi Cập nhật gói đăng ký. Chọn gói mới.",
              "Stripe tự động tính phần chênh lệch giá, theo tỷ lệ số ngày còn lại trong kỳ hiện tại. Nếu bạn nâng cấp, bạn chỉ bị tính phần chênh lệch cho thời gian còn lại của kỳ. Nếu bạn chuyển xuống gói thấp hơn, khoản tín dụng sẽ được trừ vào hóa đơn tiếp theo.",
            ],
          },
          {
            id: "invoice",
            q: "Làm sao để tải hóa đơn hoặc biên lai?",
            a: [
              "Vào Tài khoản, rồi Quản lý thanh toán, rồi Lịch sử hóa đơn. Mỗi khoản phí đều có biên lai PDF tải xuống được, kèm thông tin thanh toán bạn đã lưu.",
              "Nếu bạn cần tên, địa chỉ hoặc mã số thuế khác trên hóa đơn (ví dụ tên công ty cho mục đích thuế), hãy cập nhật thông tin thanh toán trên cùng trang đó trước khi tải xuống. Biên lai tiếp theo sẽ dùng thông tin mới.",
            ],
          },
          {
            id: "portal-error",
            q: "Tôi nhấn Quản lý thanh toán nhưng bị báo lỗi. Giờ phải làm gì?",
            a: [
              "Có hai nguyên nhân thường gặp. Thứ nhất, tài khoản của bạn không có gói đăng ký Stripe đang hoạt động. Thứ hai, Stripe có thể chưa có hồ sơ thanh toán đầy đủ cho tài khoản của bạn.",
              "Cách kiểm tra đầu tiên rất đơn giản: đăng xuất, đăng nhập lại bằng email bạn đã dùng khi thanh toán, rồi thử lại. Nếu vẫn lỗi, hãy liên hệ với chúng tôi kèm email tài khoản, đội ngũ sẽ khắc phục từ phía chúng tôi trong một phút.",
            ],
          },
          {
            id: "autorenew",
            q: "Gói đăng ký của tôi có tự động gia hạn không?",
            a: [
              "Có. Gói tháng gia hạn mỗi tháng, gói năm gia hạn mỗi năm vào cùng ngày. Bạn có thể xem ngày thanh toán tiếp theo trong tài khoản và trên cổng Stripe.",
              "Nếu không muốn tự động gia hạn, hãy hủy bất cứ lúc nào trước ngày gia hạn. Việc hủy không có hiệu lực ngay. Bạn vẫn được sử dụng đến hết kỳ đã thanh toán.",
            ],
          },
          {
            id: "refund",
            q: "Tôi có được hoàn tiền không?",
            a: [
              "Có. Nếu bạn mua chưa đầy 14 ngày và chưa dùng dịch vụ nhiều, hãy viết cho chúng tôi kèm email tài khoản và vài dòng về lý do. Những yêu cầu hoàn tiền này được chấp thuận mà không làm khó bạn.",
              "Nếu đã quá 14 ngày, đội ngũ sẽ xem xét từng trường hợp. Hãy hủy gói đăng ký để nó không tiếp tục gia hạn, rồi gửi email cho chúng tôi.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Tôi thấy một khoản phí mà tôi không nhận ra.",
            a: [
              "Các khoản phí hiển thị là GADIT hoặc GADIT.APP với số tiền $2.99 (Clear hằng tháng), $4.99 (Deep hằng tháng), $29.99 (Clear hằng năm) hoặc $49.99 (Deep hằng năm). Nếu không khớp, có thể đó là khoản phí từ một dịch vụ khác.",
              "Nếu bạn chắc chắn đó không phải khoản phí của mình, đừng vội khiếu nại qua ngân hàng. Hãy viết trực tiếp cho chúng tôi trước, kèm ngày và số tiền. Đội ngũ sẽ tìm ra khoản phí, giải thích đó là gì và hoàn tiền nếu cần. Khiếu nại qua ngân hàng có thể khiến việc thanh toán sau này khó khăn hơn, nên giải quyết qua bộ phận hỗ trợ thường nhanh và an toàn hơn.",
            ],
          },
          {
            id: "failed-payment",
            q: "Thanh toán của tôi bị thất bại. Tôi nên làm gì?",
            a: [
              "Stripe tự động thử lại các khoản thanh toán thất bại vài lần trong những ngày sau đó. Phần lớn trường hợp tự được giải quyết khi ngân hàng gỡ lệnh giữ tiền hoặc thẻ có đủ số dư.",
              "Nếu muốn khắc phục ngay, hãy vào Tài khoản → Quản lý thanh toán → Thêm phương thức thanh toán, nhập một thẻ dùng được và đặt làm Mặc định. Stripe sẽ thử lại khoản phí thất bại ngay lập tức trên thẻ mới. Nếu gói đăng ký của bạn đã bị chuyển về Basic, bạn có thể đăng ký lại từ trang Bảng giá và sổ tay của bạn vẫn còn nguyên.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Basic, Clear và Deep khác nhau thế nào?",
            a: [
              "Basic (miễn phí): tối đa 20 lượt tra từ mỗi ngày, mọi nghĩa của từ, ví dụ cho từng nghĩa, thành ngữ và nguồn gốc từ. Không cần đăng ký để tra cứu cơ bản.",
              "Clear ($2.99/tháng hoặc $29.99/năm): tra không giới hạn, giải thích thân thiện với trẻ em, một hình ảnh cho mỗi từ (30/tháng), tự đặt câu và nhận phản hồi, chi tiết thành ngữ và 30 ngày lịch sử tìm kiếm.",
              "Deep ($4.99/tháng hoặc $49.99/năm): mọi thứ trong Clear, cộng thêm bài kiểm tra luyện tập, sổ tay cá nhân với luyện tập lặp lại ngắt quãng thông minh, phân biệt các từ giống nhau và hạn mức hình ảnh lớn hơn (100/tháng).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Tài khoản và đăng nhập",
        items: [
          {
            id: "no-verification-email",
            q: "Tôi không nhận được email xác minh.",
            a: [
              "Trước tiên hãy kiểm tra thư mục spam và quảng cáo. Gmail và Outlook đôi khi chuyển email tài khoản vào đó cho đến khi bạn đánh dấu một email là \"Không phải spam\".",
              "Nếu không có ở đó, có thể email đã bị gõ sai khi đăng ký. Hãy thử đăng ký lại và kiểm tra kỹ địa chỉ. Nếu bạn đăng ký bằng Google thì không cần email xác minh.",
            ],
          },
          {
            id: "forgot-password",
            q: "Tôi quên mật khẩu.",
            a: [
              "Mở hộp thoại đăng nhập và nhấn \"Quên mật khẩu?\". Nhập email bạn dùng cho Gadit và bạn sẽ nhận được liên kết đặt lại trong vòng một hai phút.",
              "Nếu email không đến, hãy kiểm tra thư mục spam. Nếu vẫn không thấy, có thể bạn đã đăng ký bằng Google thay vì email và mật khẩu. Hãy thử nút \"Tiếp tục với Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Tôi chắc chắn mật khẩu đúng nhưng hệ thống báo \"Sai email hoặc mật khẩu\".",
            a: [
              "Có ba điều cần kiểm tra. Thứ nhất, phím Caps Lock. Thứ hai, khoảng trắng thừa ở cuối khi sao chép và dán. Thứ ba, bạn đã đăng ký bằng Google chứ không phải bằng mật khẩu (hãy dùng \"Tiếp tục với Google\").",
              "Vẫn chưa được? Hãy đặt lại mật khẩu ngay trong hộp thoại đó. Mọi thứ sẽ được thiết lập lại sạch sẽ.",
            ],
          },
          {
            id: "google-fails",
            q: "Đăng nhập bằng Google không hoạt động.",
            a: [
              "Nguyên nhân thường gặp nhất: trình duyệt của bạn đang chặn cookie của bên thứ ba hoặc cửa sổ bật lên cho gadit.app. Hãy cho phép chúng trong phần quyền trên thanh địa chỉ rồi thử lại.",
              "Nếu bạn đang ở chế độ ẩn danh, đăng nhập bằng Google bị hạn chế có chủ đích. Hãy chuyển sang cửa sổ trình duyệt thông thường.",
            ],
          },
          {
            id: "change-email",
            q: "Làm sao để thay đổi email của tài khoản?",
            a: [
              "Vào Tài khoản, nhấn vào email của bạn, chọn Thay đổi email. Bạn cần xác nhận địa chỉ mới thì thay đổi mới có hiệu lực. Gói đăng ký, lịch sử và sổ tay của bạn đều được giữ nguyên.",
              "Nếu email gắn với một khách hàng Stripe, hãy cập nhật cả trên cổng thanh toán Stripe để các biên lai sau này được gửi đến địa chỉ mới.",
            ],
          },
          {
            id: "delete-account",
            q: "Làm sao để xóa tài khoản?",
            a: [
              "Vào Tài khoản, cuối trang, chọn Xóa tài khoản. Thao tác này là vĩnh viễn. Gói đăng ký của bạn bị hủy, sổ tay và lịch sử bị xóa, và email được giải phóng để đăng ký mới.",
              "Hồ sơ các khoản phí trước đây trên Stripe vẫn được giữ lại (theo luật chúng tôi phải lưu chúng cho mục đích kế toán). Không có gì khác được giữ lại.",
            ],
          },
          {
            id: "share-account",
            q: "Người bạn đời hoặc con tôi có thể dùng chung tài khoản của tôi không?",
            a: [
              "Mỗi tài khoản chỉ có một người đăng nhập tại một thời điểm. Chế độ trẻ em cho phép một tài khoản Clear hoặc Deep phục vụ cả cha mẹ và con: bật nút gạt và các định nghĩa sẽ hiển thị theo cách thân thiện với trẻ em mà không cần đăng nhập riêng.",
              "Với hai người lớn đều muốn có sổ tay và tiến độ riêng, hãy tạo hai tài khoản. Clear có giá $2.99 mỗi tháng cho mỗi tài khoản.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Hình như tôi lỡ tạo hai tài khoản. Giờ phải làm sao?",
            a: [
              "Điều này thường xảy ra khi ai đó đăng ký một lần bằng Google và một lần bằng email và mật khẩu với cùng một địa chỉ, hoặc khi bạn đăng ký hai lần bằng hai địa chỉ email khác nhau. Mỗi lần đăng ký tạo ra một tài khoản Gadit riêng, với sổ tay, lịch sử và trạng thái gói đăng ký riêng.",
              "Hãy viết cho chúng tôi kèm cả hai địa chỉ email (hoặc UID từ trang Tài khoản) và cho biết bạn muốn giữ tài khoản nào. Đội ngũ sẽ gộp sổ tay và lịch sử vào tài khoản bạn chọn, sau đó đóng tài khoản kia một cách gọn gàng. Không mất dữ liệu nào.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Sử dụng Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Tôi nghĩ định nghĩa bị sai. Tôi nên làm gì?",
            a: [
              "Mỗi trang kết quả đều có một nút \"Báo cáo\" nhỏ ở cuối trang. Nhấn vào đó, chọn một danh mục (định nghĩa, từ nguyên, ví dụ, thành ngữ, giải thích cho trẻ em, v.v.) và viết một ghi chú ngắn. Báo cáo được gửi thẳng đến đội ngũ và mọi báo cáo đều được xem xét.",
              "Đừng ngại nếu bạn thấy mình quá khắt khe. Từ điển được cải thiện nhờ những phản hồi này nhanh hơn bất cứ điều gì khác.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Chế độ trẻ em không thay đổi phần giải thích.",
            a: [
              "Chế độ trẻ em chỉ đổi văn bản khi từ đó đã có sẵn phần giải thích thân thiện với trẻ em. Với những từ hoàn toàn mới bạn vừa tra, hãy đợi 10 đến 15 giây. Phiên bản cho trẻ em được tạo ngay lập tức vào lần đầu tiên.",
              "Ngoài ra: chế độ trẻ em yêu cầu gói Clear hoặc Deep. Nếu bạn đang dùng Basic, nút gạt sẽ gợi ý bạn nâng cấp. Người dùng chưa đăng nhập sẽ được gợi ý đăng ký.",
            ],
          },
          {
            id: "voice-fails",
            q: "Tìm kiếm bằng giọng nói không hoạt động.",
            a: [
              "Tìm kiếm bằng giọng nói cần quyền truy cập micrô. Hầu hết trình duyệt hỏi một lần cho mỗi trang web. Nếu bạn lỡ nhấn Chặn, bạn cần bật lại thủ công: nhấn vào biểu tượng ổ khóa hoặc thông tin bên cạnh gadit.app trên thanh địa chỉ, rồi Cài đặt trang web, rồi Micrô, rồi Cho phép.",
              "Trên Safari iOS, quyền truy cập micrô còn cần bật trong Cài đặt → Safari → Micrô. Giọng nói hiện là tính năng của Clear và Deep: người dùng Basic sẽ thấy gợi ý nâng cấp, khách chưa đăng nhập sẽ thấy gợi ý đăng nhập.",
            ],
          },
          {
            id: "no-image",
            q: "Tôi không tạo được hình ảnh cho từ.",
            a: [
              "Tạo hình ảnh là tính năng của Clear hoặc Deep với hạn mức hằng tháng. Clear có 30 hình mỗi tháng, Deep có 100. Nếu đã dùng hết hạn mức, bạn sẽ thấy thông báo chặn. Hạn mức được đặt lại vào ngày 1 hằng tháng.",
              "Nếu bạn chưa dùng hết hạn mức mà vẫn gặp lỗi, thường đó chỉ là lỗi tạm thời. Hãy thử lại sau 30 giây. Lỗi kéo dài là một lỗi hệ thống. Vui lòng báo cáo từ trang của từ đó.",
            ],
          },
          {
            id: "save-word",
            q: "Làm sao để lưu một từ vào sổ tay?",
            a: [
              "Trên bất kỳ trang kết quả nào, nhấn Lưu vào sổ tay gần tiêu đề. Sổ tay là tính năng của Clear và Deep, nơi bạn có thể ôn lại các từ đã lưu sau này, xem chúng ở chế độ thiên hà và chạy các buổi luyện tập thông minh (Deep).",
              "Những từ bạn đã lưu và mở ít nhất một lần sẽ dùng được ngoại tuyến từ bộ nhớ đệm cục bộ. Gói ngoại tuyến cũng lưu sẵn những từ phổ biến nhất trong ngôn ngữ của bạn để bạn sẵn sàng ngay cả khi không có internet.",
            ],
          },
          {
            id: "offline",
            q: "Chế độ ngoại tuyến hoạt động thế nào?",
            a: [
              "Những từ bạn đã xem được lưu trong bộ nhớ đệm cục bộ. Mở lại chúng khi không có internet và chúng sẽ tải ngay lập tức. Gói ngoại tuyến đầy đủ (các từ hàng đầu trong ngôn ngữ của bạn) được tải xuống theo yêu cầu từ trang sổ tay.",
              "Tìm một từ hoàn toàn mới vẫn cần kết nối mạng, vì Gadit phải tạo định nghĩa từ đầu. Bộ nhớ đệm ngoại tuyến dành cho những từ bạn đã tìm hiểu.",
            ],
          },
          {
            id: "slow",
            q: "Ứng dụng có vẻ chậm.",
            a: [
              "Lần tra đầu tiên của một từ là chậm nhất vì Gadit tạo toàn bộ kết quả từ đầu: thường mất vài giây, đôi khi lâu hơn với những từ phức tạp. Những lần tra sau của cùng từ đó hiện ra ngay lập tức, lấy từ bộ nhớ đệm.",
              "Nếu mọi thứ đều chậm, hãy thử làm mới hoàn toàn: Cmd+Shift+R trên Mac, Ctrl+Shift+R trên Windows. Nếu tình trạng chậm vẫn kéo dài trên nhiều trang, vui lòng gửi email cho chúng tôi kèm quốc gia và trình duyệt của bạn để đội ngũ kiểm tra đường truyền mạng từ khu vực của bạn đến máy chủ của chúng tôi.",
            ],
          },
          {
            id: "word-not-found",
            q: "Tôi tìm một từ nhưng không có kết quả. Chuyện gì vậy?",
            a: [
              "Trước tiên, hãy kiểm tra chính tả. Gadit xử lý được phần lớn lỗi gõ nhỏ, nhưng một nguyên âm sai hoặc thiếu một chữ cái có thể khiến kết quả bị lệch. Hãy thử từ được gợi ý sửa nếu có.",
              "Ngoài ra: những từ rất hiếm hoặc tiếng lóng có thể không cho ra kết quả đủ chắc chắn. Nếu bạn chắc chắn từ đó có thật, hãy nhấn nút Báo cáo trên trang kết quả (hoặc trên màn hình lỗi) và cho chúng tôi biết. Mọi báo cáo đều được xem xét và những từ thật sự bị bỏ sót sẽ được đưa trở lại vào hệ thống.",
            ],
          },
          {
            id: "change-language",
            q: "Làm sao để thay đổi ngôn ngữ giao diện?",
            a: [
              "Ở góc trên bên phải của mọi trang, bạn sẽ thấy một biểu tượng lá cờ nhỏ (hoặc tên ngôn ngữ hiện tại). Nhấn vào đó và chọn trong hơn 30 ngôn ngữ: tiếng Anh, tiếng Hy Lạp, tiếng Do Thái, tiếng Ả Rập, tiếng Nga, tiếng Tây Ban Nha, tiếng Bồ Đào Nha, tiếng Pháp, tiếng Đức, tiếng Séc, tiếng Slovakia, tiếng Ý, tiếng Nhật, tiếng Hindi, tiếng Amhara, tiếng Zulu.",
              "Lựa chọn của bạn được lưu trên thiết bị này. Mọi thứ sẽ tải lại bằng ngôn ngữ mới: giao diện, các menu, định nghĩa từ sau này, ví dụ, phần giải thích cho trẻ em, thậm chí cả từ nguyên. Những kết quả đã lưu trong bộ nhớ đệm bằng ngôn ngữ cũ vẫn giữ nguyên cho đến khi bạn tìm lại những từ đó.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Chương trình đối tác",
        items: [
          {
            id: "join-partner",
            q: "Làm sao để trở thành đối tác của Gadit?",
            a: [
              "Mở /partners từ bất kỳ trang nào và nhấn \"Trở thành đối tác\". Đăng ký bằng tên và email, và liên kết giới thiệu riêng của bạn cùng một bảng điều khiển để theo dõi lượt nhấp và hoa hồng sẽ sẵn sàng ngay. Không phải chờ duyệt.",
              "Tham gia miễn phí và mở cho tất cả mọi người. Bạn không cần gói đăng ký Gadit để trở thành đối tác.",
            ],
          },
          {
            id: "commission-model",
            q: "Hoa hồng được tính như thế nào?",
            a: [
              "Điều khoản tiêu chuẩn là 25% mỗi khoản thanh toán mà khách hàng thực hiện trong năm đầu tiên. Sau năm đầu tiên đó, bạn nhận 10% mỗi khoản thanh toán chừng nào khách hàng còn tiếp tục trả tiền.",
              "Cách tính này giống nhau cho gói tháng và gói năm, vì hoa hồng được tính trên từng khoản thanh toán thực tế. Nếu khách hàng hủy, hoa hồng của bạn dừng lại ở khoản thanh toán cuối cùng của họ.",
              "Đội ngũ có thể đặt mức khác cho một số đối tác cụ thể. Mức hoa hồng của riêng bạn luôn hiển thị trong bảng điều khiển đối tác, bạn có thể vào đó từ /partners.",
            ],
          },
          {
            id: "payout",
            q: "Khi nào tôi được thanh toán?",
            a: [
              "Hằng tháng, khi số dư của bạn vượt quá $50. Chúng tôi dùng phương thức nhận tiền bạn đã cài đặt trong bảng điều khiển đối tác (chuyển khoản ngân hàng, PayPal, v.v.). $50 là ngưỡng tối thiểu, không phải mức trần. Bạn có thể kiếm nhiều hơn rất nhiều, chỉ là bạn nhận tiền khi vượt qua ngưỡng.",
              "Hoa hồng được giải ngân 30 ngày sau khoản thanh toán gói đăng ký, để chừa thời gian cho khoảng hoàn tiền. Vì vậy một gói đăng ký tháng Một sẽ được giải ngân vào đầu tháng Hai và vào lần thanh toán tiếp theo của bạn khi số dư vượt quá $50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Tôi đã tham gia nhưng bảng điều khiển trống trơn.",
            a: [
              "Số liệu sẽ hiển thị sau lượt nhấp đầu tiên vào liên kết của bạn. Trống chỉ có nghĩa là chưa có ai nhấp. Hãy chia sẻ liên kết. Bảng điều khiển cập nhật gần như theo thời gian thực khi có hoạt động.",
              "Nếu bạn đã chia sẻ và có người đăng ký nhưng bảng điều khiển không phản ánh điều đó, hãy viết cho chúng tôi kèm thời gian đăng ký ước chừng, đội ngũ sẽ kiểm tra việc ghi nhận.",
            ],
          },
          {
            id: "attribution-window",
            q: "Liên kết giới thiệu của tôi theo dõi một khách truy cập trong bao lâu?",
            a: [
              "Sáu mươi ngày. Khi khách truy cập nhấp vào liên kết của bạn, chúng tôi đặt một cookie xác định bạn là người giới thiệu. Nếu họ đăng ký và mua gói bất cứ lúc nào trong 60 ngày tiếp theo (kể cả khi họ rời trang và quay lại sau qua tìm kiếm Google), bạn vẫn được ghi nhận.",
              "Xóa cookie: nếu khách truy cập xóa cookie hoặc đổi trình duyệt/thiết bị trước khi đăng ký, việc ghi nhận có thể bị mất. Không có cách nào khắc phục điều đó, nhưng 60 ngày là khoảng thời gian rộng rãi so với hầu hết các chương trình đối tác.",
            ],
          },
          {
            id: "missing-commission",
            q: "Có người đăng ký qua liên kết của tôi nhưng tôi không thấy hoa hồng.",
            a: [
              "Thường đây là vấn đề thời gian: lượt đăng ký hiện trong bảng điều khiển trong vòng vài phút, nhưng hoa hồng chỉ được ghi nhận khi gói đăng ký thực sự được thanh toán (có thể vài ngày sau nếu họ đang dùng thử miễn phí). Hãy kiểm tra lại sau khi thời gian dùng thử kết thúc.",
              "Nếu gói đăng ký đã được thanh toán mà sau 48 giờ bạn vẫn không thấy hoa hồng, hãy viết cho chúng tôi kèm thời gian đăng ký ước chừng và email hoặc tên gần đúng của người đăng ký nếu bạn biết. Đội ngũ sẽ kiểm tra chuỗi ghi nhận và khắc phục thủ công mọi thiếu sót.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Thông tin chung",
        items: [
          {
            id: "what-is-gadit",
            q: "Gadit là gì?",
            a: [
              "Một từ điển đa ngôn ngữ được tạo ra để giúp bạn thật sự hiểu một từ, không chỉ đưa ra định nghĩa một dòng. Mỗi từ mở ra với tất cả các nghĩa, ví dụ thực tế cho từng nghĩa, thành ngữ, từ nguyên, một hình ảnh tùy chọn, và (với Clear và Deep) phần giải thích thân thiện với trẻ em, tự đặt câu và nhận phản hồi, cùng các bài kiểm tra.",
              "Hiện có hơn 30 ngôn ngữ giao diện. Trong nội bộ, đội ngũ gọi đó là GAD một từ: hiểu một từ đến tận cùng, không chỉ dịch nó.",
            ],
          },
          {
            id: "languages",
            q: "Các bạn hỗ trợ những ngôn ngữ nào?",
            a: [
              "Giao diện: tiếng Anh, tiếng Hy Lạp, tiếng Do Thái, tiếng Ả Rập, tiếng Nga, tiếng Tây Ban Nha, tiếng Bồ Đào Nha, tiếng Pháp, tiếng Đức, tiếng Séc, tiếng Slovakia, tiếng Ý, tiếng Nhật, tiếng Zulu.",
              "Bạn có thể tra một từ bằng bất kỳ ngôn ngữ nào trong số đó và nhận định nghĩa, ví dụ và mọi thứ khác bằng ngôn ngữ giao diện bạn đã chọn. Tiếng Do Thái và tiếng Ả Rập hiển thị hoàn toàn từ phải sang trái (RTL) và dùng phông chữ bản địa của chúng.",
            ],
          },
          {
            id: "kid-safety",
            q: "Gadit có an toàn cho trẻ em không?",
            a: [
              "Gadit được thiết kế để cha mẹ sử dụng an toàn cùng với con. Chế độ trẻ em tạo ra các phần giải thích đơn giản, cụ thể và phù hợp với lứa tuổi (khoảng mức 5 đến 10 tuổi), dùng cùng công cụ tạo nội dung cho người lớn với hướng dẫn rõ ràng để đơn giản hóa. Nội dung do người dùng tạo không bao giờ được hiển thị cho trẻ em.",
              "Theo chính sách của chúng tôi và các quy định về quyền riêng tư của trẻ em trên khắp thế giới, chỉ người từ 13 tuổi trở lên mới được sở hữu tài khoản độc lập. Cách dùng tiêu chuẩn là tài khoản của cha mẹ mà cha mẹ dùng cùng với con, đó chính là điều chế độ trẻ em được xây dựng để phục vụ.",
            ],
          },
          {
            id: "data",
            q: "Dữ liệu của tôi được lưu ở đâu? Các bạn có bán nó không?",
            a: [
              "Tài khoản, lịch sử, sổ tay và hình ảnh đã tạo được lưu trữ an toàn trên Firebase, được mã hóa khi lưu trữ. Chúng tôi không bán dữ liệu của bạn cho bất kỳ ai. Chúng tôi chỉ chia sẻ những gì cần thiết để vận hành Gadit (lưu trữ, thanh toán, nhà cung cấp nội dung), như đã nêu rõ trong Chính sách quyền riêng tư.",
              "Bạn có thể xuất sổ tay hoặc xóa tài khoản bất cứ lúc nào từ trang Tài khoản.",
            ],
          },
          {
            id: "contact-direct",
            q: "Làm sao để liên hệ trực tiếp với các bạn?",
            a: [
              "Hãy dùng nút email ở cuối trang này. Email sẽ đến thẳng hộp thư của đội ngũ. Mọi tin nhắn đều được đọc và trả lời trong vòng 24 đến 48 giờ (thường nhanh hơn).",
              "Với việc hỗ trợ, email tốt hơn trò chuyện trực tuyến: nó cho đội ngũ cơ hội đọc kỹ và trả lời chu đáo. Hiện chúng tôi chưa có hỗ trợ qua điện thoại.",
            ],
          },
        ],
      },
    ],
  },
  fil: {
    eyebrow: "Sentro ng Tulong",
    heading: "Hanapin ang sagot, nang mabilis.",
    lede: "Mga karaniwang tanong at sunud-sunod na solusyon, nakaayos ayon sa paksa. Kung hindi mo makita ang problema mo, makipag-ugnayan sa team sa ibaba.",
    stillNeedHelpHeading: "May problema pa rin?",
    stillNeedHelpBody: "Sumulat ka sa amin nang direkta. Binabasa ng team ang bawat mensahe at sinasagot ito sa loob ng isa o dalawang araw.",
    emailCta: "Mag-email sa amin",
    responseTime: "Karaniwang sagot: sa loob ng 24 hanggang 48 oras.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Billing at subscription",
        items: [
          {
            id: "change-card",
            q: "Paano ko papalitan ang credit card sa subscription ko?",
            a: [
              "Puwede kang lumipat sa bagong card sa loob ng wala pang isang minuto nang hindi nagka-cancel. Tuloy-tuloy pa rin ang kasalukuyang subscription mo, sa bagong card na lang.",
              "1. Mag-sign in sa gadit.app at buksan ang Account page mo (kanang itaas). 2. I-click ang \"Manage billing\". 3. Magbubukas ang isang secure na page ng Stripe. I-click ang \"Add payment method\", ilagay ang bagong card, at i-set ito bilang Default. 4. Kung gusto mo, tanggalin ang lumang card.",
              "Simula sa susunod na billing cycle, sa bagong card na mapupunta ang lahat. Mananatili sa lumang card ang naunang singil (na nakolekta na). Hindi kailangan ng refund maliban kung talagang gusto mo.",
            ],
          },
          {
            id: "cancel",
            q: "Paano ko ika-cancel ang subscription ko?",
            a: [
              "Kaya mo itong gawin mismo, anumang oras. Mag-sign in, buksan ang Account, at i-tap ang Kanselahin ang subscription sa ilalim ng iyong plan.",
              "Tuloy ang access mo hanggang matapos ang period na nabayaran mo na. Pagkatapos noon, babalik ang account sa Basic (libre). Ligtas at magagamit pa rin ang mga na-save mong salita, history, at notebook.",
              "Kung na-cancel mo nang hindi sinasadya o nagbago ang isip mo, puwede mong ituloy ulit ang subscription mula sa parehong page bago matapos ang period.",
            ],
          },
          {
            id: "switch-plan",
            q: "Paano lumipat mula Clear papuntang Deep (o pabalik)?",
            a: [
              "Account, tapos Manage billing, tapos Update subscription. Piliin ang bagong plan.",
              "Awtomatikong kinukuwenta ng Stripe ang diperensya sa presyo, prorated ayon sa mga araw na natitira sa kasalukuyang period. Kung mag-a-upgrade ka, ang diperensya lang ang sisingilin para sa natitirang bahagi ng period. Kung lilipat ka sa mas mababang tier, ilalapat ang credit sa susunod mong bill.",
            ],
          },
          {
            id: "invoice",
            q: "Paano mag-download ng invoice o resibo?",
            a: [
              "Account, tapos Manage billing, tapos Invoice history. Bawat singil ay may PDF na resibo na puwedeng i-download, kasama ang billing details na na-save mo.",
              "Kung kailangan mo ng ibang pangalan, address, o tax ID sa invoice (halimbawa, pangalan ng kumpanya para sa buwis), i-update ang billing details mo sa parehong page bago mag-download. Gagamitin ng susunod na resibo ang bagong details.",
            ],
          },
          {
            id: "portal-error",
            q: "Na-click ko ang Manage billing pero nagka-error. Ano ngayon?",
            a: [
              "Dalawa ang karaniwang dahilan. Una, walang aktibong Stripe subscription ang account mo. Pangalawa, maaaring wala pang kumpletong billing profile ang Stripe para sa account mo.",
              "Madaling unang check: mag-sign out, mag-sign in ulit gamit ang email na ginamit mo sa checkout, at subukan ulit. Kung ayaw pa rin, makipag-ugnayan sa amin kasama ang email ng account mo at aayusin ito ng team mula sa side namin sa loob ng isang minuto.",
            ],
          },
          {
            id: "autorenew",
            q: "Awtomatiko bang magre-renew ang subscription ko?",
            a: [
              "Oo. Nagre-renew buwan-buwan ang mga monthly plan, at taon-taon sa parehong petsa ang mga annual plan. Makikita mo ang susunod na billing date sa account mo at sa portal ng Stripe.",
              "Kung ayaw mo ng auto-renew, mag-cancel anumang oras bago ang renewal date. Hindi agad-agad ang cancellation. Tuloy ang access mo sa buong period na nabayaran mo na.",
            ],
          },
          {
            id: "refund",
            q: "Puwede ba akong makakuha ng refund?",
            a: [
              "Oo. Kung wala pang 14 na araw mula nang bumili ka at hindi pa gaanong nagagamit ang serbisyo, sumulat sa amin kasama ang email ng account mo at maikling paliwanag kung bakit. Inaaprubahan ang mga refund na ito nang walang abala.",
              "Kung lampas na sa 14 na araw, isa-isang tinitingnan ng team ang bawat kaso. I-cancel ang subscription para hindi na ito mag-renew, at mag-email sa amin.",
            ],
          },
          {
            id: "unknown-charge",
            q: "May nakikita akong singil na hindi ko kilala.",
            a: [
              "Lumalabas ang mga singil bilang GADIT o GADIT.APP na may $2.99 (Clear monthly), $4.99 (Deep monthly), $29.99 (Clear yearly), o $49.99 (Deep yearly). Kung hindi tugma, baka galing ito sa ibang serbisyo.",
              "Kung sigurado kang hindi sa iyo ito, huwag munang mag-dispute sa bangko mo. Sumulat muna sa amin nang direkta, kasama ang petsa at halaga. Hahanapin ito ng team, ipapaliwanag kung ano ito, at magre-refund kung kailangan. Puwedeng pahirapan ng bank dispute ang mga susunod na billing, kaya kadalasang mas mabilis at mas ligtas na ayusin ito sa pamamagitan ng support.",
            ],
          },
          {
            id: "failed-payment",
            q: "Nag-fail ang bayad ko. Ano ang dapat kong gawin?",
            a: [
              "Awtomatikong sinusubukan ulit ng Stripe ang mga nag-fail na bayad nang ilang beses sa mga susunod na araw. Karamihan ng failure ay kusang naaayos kapag inalis na ng bangko ang hold o may sapat nang balanse ang card.",
              "Kung gusto mo itong ayusin agad, pumunta sa Account → Manage billing → Add payment method, maglagay ng gumaganang card, at i-set ito bilang Default. Agad na susubukan ulit ng Stripe ang nag-fail na singil sa bagong card. Kung bumalik na sa Basic ang subscription mo, puwede kang mag-subscribe ulit mula sa Pricing at buo pa rin ang notebook mo.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Ano ang pagkakaiba ng Basic, Clear, at Deep?",
            a: [
              "Basic (libre): hanggang 20 word lookup kada araw, lahat ng kahulugan, mga halimbawa sa bawat kahulugan, mga idyoma, at pinagmulan ng salita. Hindi kailangang mag-sign up para sa mga basic na search.",
              "Clear ($2.99/buwan o $29.99/taon): walang limitasyong lookup, mga paliwanag na pambata, isang larawan bawat salita (30/buwan), pagbuo ng sarili mong pangungusap na may feedback, detalye ng mga idyoma, at 30 araw ng search history.",
              "Deep ($4.99/buwan o $49.99/taon): lahat ng nasa Clear, dagdag pa ang mga practice quiz, ang personal na notebook na may matalinong spaced-repetition practice, pagkilala sa pagitan ng magkakahawig na salita, at mas malaking quota ng larawan (100/buwan).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Account at pag-sign in",
        items: [
          {
            id: "no-verification-email",
            q: "Hindi ko natanggap ang verification email ko.",
            a: [
              "Tingnan muna ang spam at promotions folder. Minsan napupunta roon ang mga email ng account sa Gmail at Outlook hanggang markahan mo ang isa bilang \"Not spam\".",
              "Kung wala roon, baka mali ang pagkaka-type ng email noong nag-sign up ka. Subukang mag-sign up ulit at i-double check ang address. Kung Google sign-up ang ginamit mo, hindi kailangan ng verification email.",
            ],
          },
          {
            id: "forgot-password",
            q: "Nakalimutan ko ang password ko.",
            a: [
              "Buksan ang sign-in dialog at i-click ang \"Forgot password?\". Ilagay ang email na ginagamit mo sa Gadit at makakatanggap ka ng reset link sa loob ng isa o dalawang minuto.",
              "Kung hindi dumating ang email, tingnan ang spam. Kung wala pa rin, baka sa Google ka nag-sign up sa halip na email at password. Subukan ang button na \"Continue with Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Sigurado akong tama ang password ko pero sinasabing \"Wrong email or password\".",
            a: [
              "Tatlong bagay ang dapat i-check. Una, ang Caps Lock. Pangalawa, may sobrang space sa dulo kapag nag-copy-paste. Pangatlo, sa Google ka nag-sign up at hindi gamit ang password (gamitin na lang ang \"Continue with Google\").",
              "May problema pa rin? I-reset ang password mula sa parehong dialog. Malinis na magsisimula ulit ang lahat.",
            ],
          },
          {
            id: "google-fails",
            q: "Hindi gumagana ang Google sign-in.",
            a: [
              "Pinakakaraniwang dahilan: bina-block ng browser mo ang third-party cookies o mga pop-up para sa gadit.app. Payagan ang mga ito sa permissions sa address bar at subukan ulit.",
              "Kung naka-incognito mode ka, sadyang limitado ang Google sign-in. Lumipat sa normal na browser window.",
            ],
          },
          {
            id: "change-email",
            q: "Paano ko papalitan ang email sa account ko?",
            a: [
              "Account, i-click ang email mo, Change email. Kailangan mong kumpirmahin ang bagong address bago ito tumalab. Madadala lahat ang subscription, history, at notebook mo.",
              "Kung naka-link ang email sa isang Stripe customer, i-update din ito sa Stripe billing portal para mapunta sa bagong address ang mga susunod na resibo.",
            ],
          },
          {
            id: "delete-account",
            q: "Paano ko buburahin ang account ko?",
            a: [
              "Account, sa ibaba ng page, Delete account. Permanente ito. Makakansela ang subscription mo, mabubura ang notebook at history mo, at magagamit na ulit ang email para sa bagong sign-up.",
              "Mananatili ang mga record ng mga nakaraang singil sa Stripe (obligado kami ayon sa batas na itago ang mga ito para sa accounting). Wala nang iba pang matitira.",
            ],
          },
          {
            id: "share-account",
            q: "Puwede bang gamitin ng partner o anak ko ang account ko?",
            a: [
              "Isang naka-sign in na user lang kada account sa isang pagkakataon. Sa Kids mode, puwedeng magamit ng magulang at anak ang iisang Clear o Deep account: i-on ang toggle at magiging pambata ang mga depinisyon nang hindi kailangan ng hiwalay na login.",
              "Para sa dalawang adult na parehong gusto ng sariling notebook at progreso, gumawa ng dalawang account. Ang Clear ay $2.99 kada buwan bawat account.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Sa tingin ko may dalawa akong account nang hindi sinasadya. Ano ngayon?",
            a: [
              "Karaniwang nangyayari ito kapag may nag-sign up nang isang beses gamit ang Google at isang beses gamit ang email at password sa parehong address, o kapag nag-sign up ka nang dalawang beses gamit ang magkaibang email address. Bawat sign-up ay gumagawa ng hiwalay na Gadit account na may sariling notebook, history, at estado ng subscription.",
              "Sumulat sa amin kasama ang dalawang email address (o mga UID mula sa Account page) at kung alin ang gusto mong panatilihin. Pagsasamahin ng team ang mga notebook at history sa account na pipiliin mo, tapos maayos na isasara ang isa. Walang mawawalang data.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Paggamit ng Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Sa tingin ko mali ang depinisyon. Ano ang gagawin ko?",
            a: [
              "May maliit na button na \"Report\" sa ibaba ng bawat result page. I-tap ito, pumili ng kategorya (depinisyon, etimolohiya, halimbawa, idyoma, paliwanag na pambata, at iba pa) at magsulat ng maikling tala. Diretso itong napupunta sa team at nirerepaso ang bawat report.",
              "Huwag mag-alala kung pakiramdam mo ay masyado kang mapili. Mas mabilis gumaganda ang diksyunaryo dahil sa ganitong feedback kaysa sa kahit ano pa.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Hindi binabago ng Kids mode ang paliwanag.",
            a: [
              "Binabago lang ng Kids mode ang teksto kapag may nagawa nang pambatang paliwanag para sa salita. Para sa mga bagong-bagong salitang kaka-lookup mo lang, maghintay ng 10 hanggang 15 segundo. Ginagawa agad ang pambatang bersyon sa unang pagkakataon.",
              "Dagdag pa: kailangan ng Clear o Deep para sa Kids mode. Kung Basic ka, ipapaalala ng toggle na mag-upgrade ka. Ang mga hindi naka-sign in ay hihilingang mag-sign up.",
            ],
          },
          {
            id: "voice-fails",
            q: "Hindi gumagana ang voice search.",
            a: [
              "Kailangan ng voice search ng pahintulot sa mikropono. Karamihan ng browser ay nagtatanong nang isang beses bawat site. Kung na-click mo ang Block nang hindi sinasadya, kailangan mo itong ibalik nang mano-mano: i-click ang lock o info icon sa tabi ng gadit.app sa address bar, tapos Site settings, tapos Microphone, tapos Allow.",
              "Sa Safari iOS, kailangan ding i-on ang toggle sa Settings → Safari → Microphone para sa access sa mikropono. Sa ngayon, feature ng Clear at Deep ang voice: makakakita ng paalala na mag-upgrade ang mga Basic user, at paalala na mag-sign in ang mga bisitang hindi naka-sign in.",
            ],
          },
          {
            id: "no-image",
            q: "Hindi ako makagawa ng larawan para sa salita.",
            a: [
              "Feature ng Clear o Deep ang paggawa ng larawan, na may buwanang quota. May 30 larawan kada buwan ang Clear, at 100 ang Deep. Kung naubos mo na ang quota, makakakita ka ng harang. Nire-reset ito tuwing ika-1 ng bawat buwan.",
              "Kung hindi mo pa naaabot ang quota at may failure pa rin, kadalasan ay pansamantala lang ito. Subukan ulit pagkalipas ng 30 segundo. Bug na kapag paulit-ulit ang failure. Paki-report mula sa page ng salita.",
            ],
          },
          {
            id: "save-word",
            q: "Paano mag-save ng salita sa notebook ko?",
            a: [
              "Sa kahit anong result page ng salita, i-tap ang Save to notebook malapit sa pamagat. Feature ng Clear at Deep ang notebook, kung saan puwede mong balikan ang mga na-save na salita, tingnan ang mga ito sa galaxy view, at magpatakbo ng smart-practice session (Deep).",
              "Magagamit offline mula sa local cache ang mga salitang na-save at nabuksan mo nang kahit isang beses. Naka-cache din sa offline pack ang mga pinakasikat na salita sa wika mo para handa ka kahit walang internet.",
            ],
          },
          {
            id: "offline",
            q: "Paano gumagana ang offline mode?",
            a: [
              "Naka-cache nang lokal ang mga salitang natingnan mo na. Buksan ulit ang mga ito nang walang internet at agad silang lalabas. Ang buong offline pack (mga nangungunang salita sa wika mo) ay dina-download kapag hiniling mo mula sa notebook page.",
              "Kailangan pa rin ng koneksyon para mag-search ng bagong-bagong salita, dahil kailangang buuin ng Gadit ang depinisyon mula sa simula. Para sa mga salitang na-explore mo na ang offline cache.",
            ],
          },
          {
            id: "slow",
            q: "Parang mabagal ang app.",
            a: [
              "Pinakamabagal ang unang lookup ng isang salita dahil binubuo ng Gadit ang buong resulta mula sa simula: kadalasan ilang segundo, minsan mas matagal para sa mga komplikadong salita. Agad-agad na ang mga susunod na lookup ng parehong salita, mula na sa cache.",
              "Kung mabagal ang lahat, subukan ang hard refresh: Cmd+Shift+R sa Mac, Ctrl+Shift+R sa Windows. Kung patuloy ang pagbagal sa iba't ibang page, paki-email kami kasama ang bansa at browser mo para ma-check ng team ang network route papunta sa mga server namin mula sa rehiyon mo.",
            ],
          },
          {
            id: "word-not-found",
            q: "Nag-search ako ng salita at walang lumabas na resulta. Ano'ng nangyayari?",
            a: [
              "Una, i-check ang spelling. Kadalasan ay kaya ng Gadit ang maliliit na typo, pero puwede itong malito sa maling patinig o kulang na letra. Subukan ang iminumungkahing pagwawasto kung may lumabas.",
              "Bukod doon: maaaring hindi makapagbigay ng tiyak na resulta ang mga napakabihirang salita o slang. Kung sigurado kang totoo ang salita, i-click ang Report button sa result page (o sa error screen) at ipaalam sa amin. Nirerepaso ang bawat report at ibinabalik sa system ang mga totoong nakaligtaan.",
            ],
          },
          {
            id: "change-language",
            q: "Paano palitan ang wika ng interface?",
            a: [
              "Sa kanang itaas ng kahit anong page, makikita mo ang maliit na icon ng bandila (o ang pangalan ng kasalukuyang wika mo). I-tap ito at pumili mula sa 30+ na wika: Ingles, Griyego, Hebreo, Arabe, Ruso, Espanyol, Portuges, Pranses, Aleman, Czech, Slovak, Italyano, Hapon, Hindi, Amharic, Zulu.",
              "Naka-save ang pinili mo sa device na ito. Magre-reload ang lahat sa bagong wika: ang interface, ang mga menu, ang mga susunod na depinisyon ng salita, mga halimbawa, mga pambatang paliwanag, pati ang etimolohiya. Mananatili ang mga resultang naka-cache na sa lumang wika hanggang i-search mo ulit ang mga salitang iyon.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Partner program",
        items: [
          {
            id: "join-partner",
            q: "Paano maging partner ng Gadit?",
            a: [
              "Buksan ang /partners mula sa kahit anong page at i-click ang \"Maging partner\". Mag-sign up gamit ang pangalan at email mo, at handa agad ang sarili mong referral link pati ang dashboard para i-track ang mga click at komisyon. Walang hihintaying approval.",
              "Libre ang pagsali at bukas sa lahat. Hindi mo kailangan ng Gadit subscription para maging partner.",
            ],
          },
          {
            id: "commission-model",
            q: "Paano kinukuwenta ang mga komisyon?",
            a: [
              "Ang standard na terms ay 25% ng bawat bayad na ginagawa ng customer sa unang taon niya. Pagkatapos ng unang taon na iyon, kikita ka ng 10% ng bawat bayad hangga't patuloy na nagbabayad ang customer.",
              "Pareho ito para sa mga monthly at annual plan, dahil binibilang ang komisyon sa bawat aktwal na bayad. Kung mag-cancel ang customer, titigil ang komisyon mo sa huli niyang bayad.",
              "Puwedeng magtakda ang team ng ibang rate para sa mga partikular na partner. Laging makikita ang sarili mong mga rate sa partner dashboard mo, na mapupuntahan mo mula sa /partners.",
            ],
          },
          {
            id: "payout",
            q: "Kailan ako mababayaran?",
            a: [
              "Buwan-buwan, kapag lumampas na sa $50 ang balanse mo. Ginagamit namin ang payout method na itinakda mo sa partner dashboard (bank transfer, PayPal, at iba pa). Ang $50 ay minimum na threshold, hindi limitasyon. Puwede kang kumita nang mas malaki, matatanggap mo lang ang payout kapag nalampasan mo ang threshold.",
              "Inilalabas ang mga komisyon 30 araw pagkatapos ng bayad sa subscription, para bigyang-daan ang refund window. Kaya ang subscription noong Enero ay inilalabas sa unang bahagi ng Pebrero at napupunta sa susunod mong payout kapag lumampas na sa $50 ang balanse mo.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Sumali ako pero walang laman ang dashboard ko.",
            a: [
              "Lalabas ang stats pagkatapos ng unang click sa link mo. Kapag walang laman, ibig sabihin lang ay wala pang nagki-click. I-share mo na ang link. Halos real time ang update ng dashboard kapag nagsimula na ang aktibidad.",
              "Kung na-share mo na at may nag-sign up pero hindi ito makikita sa dashboard, sumulat sa amin kasama ang tantiyang oras ng sign-up at iche-check ng team ang attribution.",
            ],
          },
          {
            id: "attribution-window",
            q: "Gaano katagal sinusubaybayan ng referral link ko ang isang bisita?",
            a: [
              "Animnapung araw. Kapag na-click ng bisita ang link mo, naglalagay kami ng cookie na nagsasabing ikaw ang nag-refer. Kung mag-sign up at mag-subscribe sila anumang oras sa loob ng susunod na 60 araw (kahit umalis sila sa site at bumalik pagkatapos sa pamamagitan ng Google search), sa iyo pa rin ang credit.",
              "Pag-clear ng cookies: kung i-clear ng bisita ang cookies niya o lumipat ng browser/device bago mag-sign up, puwedeng mawala ang attribution. Walang paraan para maiwasan iyon, pero maluwag na ang 60 araw kumpara sa karamihan ng partner program.",
            ],
          },
          {
            id: "missing-commission",
            q: "May nag-sign up gamit ang link ko pero hindi ko makita ang komisyon.",
            a: [
              "Kadalasan, usapin ito ng timing: lumalabas ang sign-up sa dashboard sa loob ng ilang minuto, pero naitatala lang ang komisyon kapag talagang nabayaran na ang subscription (na puwedeng ilang araw pa kung naka-free trial sila). Balikan ito pagkatapos ng trial.",
              "Kung nabayaran na ang subscription pero wala ka pa ring nakikitang komisyon pagkalipas ng 48 oras, sumulat sa amin kasama ang tantiyang oras ng sign-up at ang email o tantiyang pangalan ng subscriber kung alam mo. Susuriin ng team ang attribution chain at mano-manong aayusin ang anumang nakaligtaan.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Pangkalahatan",
        items: [
          {
            id: "what-is-gadit",
            q: "Ano ang Gadit?",
            a: [
              "Isang multilingual na diksyunaryo na ginawa para talagang maintindihan mo ang isang salita, hindi lang magbigay ng isang linyang depinisyon. Bawat salita ay bumubukas kasama ang lahat ng kahulugan nito, mga totoong halimbawa sa bawat kahulugan, mga idyoma, etimolohiya, opsyonal na larawan, at (sa Clear at Deep) pambatang paliwanag, pagbuo ng sarili mong pangungusap na may feedback, at mga quiz.",
              "Sa ngayon, 30+ na wika ng interface. Sa loob ng team, tinatawag namin itong pag-GAD sa isang salita: maintindihan ang isang salita nang buong-buo, hindi lang isalin ito.",
            ],
          },
          {
            id: "languages",
            q: "Anong mga wika ang sinusuportahan ninyo?",
            a: [
              "Interface: Ingles, Griyego, Hebreo, Arabe, Ruso, Espanyol, Portuges, Pranses, Aleman, Czech, Slovak, Italyano, Hapon, Zulu.",
              "Puwede kang mag-lookup ng salita sa alinman sa mga wikang iyon at makuha ang depinisyon, mga halimbawa, at lahat ng iba pa sa pinili mong wika ng interface. Ganap na RTL ang Hebreo at Arabe at gumagamit ng sarili nilang mga font.",
            ],
          },
          {
            id: "kid-safety",
            q: "Ligtas ba ang Gadit para sa mga bata?",
            a: [
              "Dinisenyo ang Gadit para ligtas na magamit ng magulang kasama ang anak. Gumagawa ang Kids mode ng mga paliwanag na simple, kongkreto, at angkop sa edad (mga antas ng 5 hanggang 10 taong gulang), gamit ang parehong engine na nagpapatakbo ng content para sa mga adult na may tahasang instruksyon na gawing simple. Hindi kailanman ipinapakita sa mga bata ang anumang content na gawa ng mga user.",
              "Alinsunod sa aming mga patakaran at sa mga patakaran sa privacy ng mga bata sa buong mundo, 13 pataas lang ang puwedeng magkaroon ng sariling account. Ang karaniwang ayos ay account ng magulang na ginagamit ng magulang kasama ang anak niya, at iyon mismo ang dahilan kung bakit ginawa ang Kids mode.",
            ],
          },
          {
            id: "data",
            q: "Saan naka-store ang data ko? Ibinebenta ba ninyo ito?",
            a: [
              "Ang account, history, notebook, at mga nagawang larawan ay ligtas na naka-store sa Firebase, naka-encrypt sa storage. Hindi namin ibinebenta ang data mo kaninuman. Ibinabahagi lang namin ang kailangan para patakbuhin ang Gadit (storage, bayad, mga content provider), gaya ng nakasaad sa Privacy Policy.",
              "Puwede mong i-export ang notebook mo o burahin ang account mo anumang oras mula sa Account page.",
            ],
          },
          {
            id: "contact-direct",
            q: "Paano ko kayo makakausap nang direkta?",
            a: [
              "Gamitin ang email button sa ibaba ng page na ito. Diretso itong napupunta sa inbox ng team. Binabasa ang bawat mensahe at sinasagot sa loob ng 24 hanggang 48 oras (madalas mas mabilis).",
              "Mas mainam ang email kaysa chat para sa support: nabibigyan nito ang team ng pagkakataong magbasa nang mabuti at sumagot nang maayos. Wala pang phone support sa ngayon.",
            ],
          },
        ],
      },
    ],
  },
  af: {
    eyebrow: "Hulpsentrum",
    heading: "Kry vinnig 'n antwoord.",
    lede: "Algemene vrae en stap-vir-stap oplossings, volgens onderwerp georden. As jy nie jou probleem sien nie, kontak die span onderaan.",
    stillNeedHelpHeading: "Steeds vas?",
    stillNeedHelpBody: "Skryf direk aan ons. Die span lees elke boodskap en antwoord binne 'n dag of twee.",
    emailCta: "E-pos ons",
    responseTime: "Gewone antwoordtyd: binne 24 tot 48 uur.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Betaling en intekening",
        items: [
          {
            id: "change-card",
            q: "Hoe verander ek die kredietkaart vir my intekening?",
            a: [
              "Jy kan in minder as 'n minuut na 'n nuwe kaart oorskakel sonder om te kanselleer. Jou huidige intekening loop gewoon voort, net op die nuwe kaart.",
              "1. Teken in by gadit.app en maak jou Rekening-bladsy oop (regs bo). 2. Klik op \"Bestuur betaling\". 3. 'n Veilige Stripe-bladsy maak oop. Klik op \"Voeg betaalmetode by\", voer die nuwe kaart in en merk dit as Verstek. 4. Verwyder opsioneel die ou kaart.",
              "Vanaf die volgende faktuursiklus gaan alles na die nuwe kaart. Die vorige heffing (reeds ingevorder) bly op die ou kaart. Geen terugbetaling is nodig nie, tensy jy spesifiek een wil hê.",
            ],
          },
          {
            id: "cancel",
            q: "Hoe kanselleer ek my intekening?",
            a: [
              "Jy doen dit self, enige tyd. Meld aan, maak Rekening oop en tik op Kanselleer intekening onder jou plan.",
              "Jou toegang duur voort tot aan die einde van die tydperk waarvoor jy reeds betaal het. Daarna val die rekening terug na Basic (gratis). Jou gestoorde woorde, geskiedenis en notaboek bly veilig en toeganklik.",
              "As jy per ongeluk kanselleer of van plan verander, kan jy die intekening op dieselfde bladsy hervat voordat die tydperk eindig.",
            ],
          },
          {
            id: "switch-plan",
            q: "Hoe skakel ek van Clear na Deep oor (of andersom)?",
            a: [
              "Rekening, dan Bestuur betaling, dan Werk intekening by. Kies die nuwe plan.",
              "Stripe bereken die prysverskil outomaties, pro rata volgens die dae wat in die huidige tydperk oorbly. As jy opgradeer, word jy net die verskil vir die res van die tydperk gehef. As jy na 'n laer vlak oorskakel, word die krediet op jou volgende rekening toegepas.",
            ],
          },
          {
            id: "invoice",
            q: "Hoe laai ek 'n faktuur of kwitansie af?",
            a: [
              "Rekening, dan Bestuur betaling, dan Faktuurgeskiedenis. Elke heffing het 'n PDF-kwitansie wat jy kan aflaai, met die faktuurbesonderhede wat jy gestoor het.",
              "As jy 'n ander naam, adres of belastingnommer op die faktuur nodig het (byvoorbeeld 'n maatskappynaam vir belastingdoeleindes), werk jou faktuurbesonderhede op dieselfde bladsy by voordat jy aflaai. Die volgende kwitansie sal die nuwe besonderhede gebruik.",
            ],
          },
          {
            id: "portal-error",
            q: "Ek het op Bestuur betaling geklik, maar 'n fout gekry. Wat nou?",
            a: [
              "Twee algemene oorsake. Eerstens het jou rekening nie 'n aktiewe Stripe-intekening nie. Tweedens het Stripe dalk nog nie 'n volledige faktuurprofiel vir jou rekening nie.",
              "Maklike eerste toets: teken uit, teken weer in met die e-posadres wat jy by die betaling gebruik het, en probeer weer. As dit steeds misluk, kontak ons met jou rekening se e-posadres en die span sal dit binne 'n minuut aan ons kant regmaak.",
            ],
          },
          {
            id: "autorenew",
            q: "Sal my intekening outomaties hernu?",
            a: [
              "Ja. Maandelikse planne hernu elke maand, jaarlikse planne hernu elke jaar op dieselfde datum. Jy kan die volgende faktuurdatum in jou rekening en op Stripe se portaal sien.",
              "As jy nie outomatiese hernuwing wil hê nie, kanselleer enige tyd voor die hernuwingsdatum. Kansellasie is nie onmiddellik nie. Jy behou toegang tot aan die einde van die tydperk waarvoor jy reeds betaal het.",
            ],
          },
          {
            id: "refund",
            q: "Kan ek 'n terugbetaling kry?",
            a: [
              "Ja. As die aankoop minder as 14 dae gelede was en die diens nog nie veel gebruik is nie, skryf aan ons met jou rekening se e-posadres en 'n kort nota oor hoekom. Daardie terugbetalings word sonder 'n stryd goedgekeur.",
              "As dit meer as 14 dae gelede was, hanteer die span dit geval vir geval. Kanselleer die intekening sodat dit nie aanhou hernu nie, en e-pos ons.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Ek sien 'n heffing wat ek nie herken nie.",
            a: [
              "Heffings verskyn as GADIT of GADIT.APP met $2.99 (Clear maandeliks), $4.99 (Deep maandeliks), $29.99 (Clear jaarliks) of $49.99 (Deep jaarliks). As dit nie ooreenstem nie, kom dit dalk van 'n ander diens.",
              "As jy seker is dit is nie joune nie, moet dit nog nie deur jou bank betwis nie. Skryf eers direk aan ons met die datum en bedrag. Die span sal dit opspoor, verduidelik wat dit is en terugbetaal indien nodig. 'n Bankgeskil kan toekomstige betalings moeiliker maak, so om dit deur ondersteuning op te los is gewoonlik vinniger en veiliger.",
            ],
          },
          {
            id: "failed-payment",
            q: "My betaling het misluk. Wat moet ek doen?",
            a: [
              "Stripe probeer mislukte betalings outomaties 'n paar keer oor die volgende dae weer. Die meeste mislukkings los vanself op sodra die bank die blokkering ophef of die kaart genoeg saldo het.",
              "As jy dit dadelik wil regmaak, gaan na Rekening → Bestuur betaling → Voeg betaalmetode by, voer 'n kaart in wat werk en stel dit as Verstek. Stripe sal die mislukte heffing dadelik op die nuwe kaart herprobeer. As jou intekening reeds na Basic teruggeval het, kan jy weer inteken vanaf Pryse en jou notaboek bly ongeskonde.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Wat is die verskil tussen Basic, Clear en Deep?",
            a: [
              "Basic (gratis): tot 20 woordsoektogte per dag, elke betekenis, voorbeelde per betekenis, idiome en woordoorsprong. Geen registrasie nodig vir basiese soektogte nie.",
              "Clear ($2.99/maand of $29.99/jaar): onbeperkte soektogte, kindervriendelike verduidelikings, 'n prent per woord (30/maand), skryf jou eie sin met terugvoer, idioombesonderhede en 30 dae se soekgeskiedenis.",
              "Deep ($4.99/maand of $49.99/jaar): alles in Clear, plus oefenvasvrae, die persoonlike notaboek met slim gespasieerde herhalingsoefening, onderskeid tussen soortgelyke woorde en 'n groter prentkwota (100/maand).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Rekening en aanmelding",
        items: [
          {
            id: "no-verification-email",
            q: "Ek het nie my verifikasie-e-pos ontvang nie.",
            a: [
              "Kyk eers in jou strooipos- en promosiesvouers. Gmail en Outlook stuur soms rekening-e-posse soontoe totdat jy een as \"Nie strooipos nie\" merk.",
              "As dit nie daar is nie, is die e-posadres dalk verkeerd getik by registrasie. Probeer weer registreer en kontroleer die adres noukeurig. As jy met Google geregistreer het, is geen verifikasie-e-pos nodig nie.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ek het my wagwoord vergeet.",
            a: [
              "Maak die aanmeldvenster oop en klik op \"Wagwoord vergeet?\". Voer die e-posadres in wat jy vir Gadit gebruik en jy kry binne 'n minuut of twee 'n herstelskakel.",
              "As die e-pos nie aankom nie, kyk in strooipos. As dit steeds nie aankom nie, het jy dalk met Google geregistreer in plaas van e-pos en wagwoord. Probeer die \"Gaan voort met Google\"-knoppie.",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Ek is seker my wagwoord is reg, maar dit sê \"Verkeerde e-pos of wagwoord\".",
            a: [
              "Drie dinge om na te gaan. Eerstens, Caps Lock. Tweedens, 'n spasie aan die einde wanneer jy kopieer en plak. Derdens, jy het met Google geregistreer eerder as met 'n wagwoord (gebruik eerder \"Gaan voort met Google\").",
              "Steeds vas? Stel die wagwoord in dieselfde venster terug. Dan begin alles skoon van voor af.",
            ],
          },
          {
            id: "google-fails",
            q: "Aanmelding met Google werk nie.",
            a: [
              "Mees algemene oorsaak: jou blaaier blokkeer derdeparty-koekies of opspringvensters vir gadit.app. Laat dit toe in die toestemmings by die adresbalk en probeer weer.",
              "As jy in incognito-modus is, word aanmelding met Google doelbewus beperk. Skakel oor na 'n gewone blaaiervenster.",
            ],
          },
          {
            id: "change-email",
            q: "Hoe verander ek die e-posadres op my rekening?",
            a: [
              "Rekening, klik op jou e-posadres, Verander e-pos. Jy moet die nuwe adres bevestig voordat die verandering geld. Jou intekening, geskiedenis en notaboek word almal oorgedra.",
              "As die e-posadres aan 'n Stripe-kliënt gekoppel is, werk dit ook op die Stripe-betaalportaal by sodat toekomstige kwitansies na die nuwe adres gaan.",
            ],
          },
          {
            id: "delete-account",
            q: "Hoe skrap ek my rekening?",
            a: [
              "Rekening, onderaan die bladsy, Skrap rekening. Dit is permanent. Jou intekening word gekanselleer, jou notaboek en geskiedenis word uitgevee en die e-posadres word vrygestel vir 'n nuwe registrasie.",
              "Stripe se rekords van vorige heffings bly bestaan (ons is wetlik verplig om dit vir rekeningkundige doeleindes te hou). Niks anders bly oor nie.",
            ],
          },
          {
            id: "share-account",
            q: "Kan my lewensmaat of kind my rekening deel?",
            a: [
              "Een aangemelde gebruiker per rekening op 'n slag. Kindermodus laat een Clear- of Deep-rekening 'n ouer en kind bedien: skakel die skakelaar aan en definisies word kindervriendelik vertoon sonder aparte aanmeldings.",
              "Vir twee volwassenes wat albei aparte notaboeke en vordering wil hê, skep twee rekeninge. Clear kos $2.99 per maand per rekening.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ek dink ek het per ongeluk twee rekeninge. Wat nou?",
            a: [
              "Dit gebeur gewoonlik wanneer iemand een keer met Google en een keer met e-pos en wagwoord registreer met dieselfde adres, of wanneer jy twee keer met verskillende e-posadresse registreer. Elke registrasie skep 'n aparte Gadit-rekening met sy eie notaboek, geskiedenis en intekeningstatus.",
              "Skryf aan ons met albei e-posadresse (of UID's van die Rekening-bladsy) en watter een jy wil hou. Die span sal die notaboeke en geskiedenis saamvoeg op die rekening wat jy kies, en dan die ander een netjies sluit. Geen data gaan verlore nie.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Gadit gebruik",
        items: [
          {
            id: "wrong-definition",
            q: "Ek dink die definisie is verkeerd. Wat doen ek?",
            a: [
              "Elke resultaatbladsy het 'n klein \"Rapporteer\"-knoppie onderaan. Tik daarop, kies 'n kategorie (definisie, etimologie, voorbeeld, idioom, kinderverduideliking, ensovoorts) en skryf 'n kort nota. Dit gaan direk na die span en elke verslag word nagegaan.",
              "Moenie bekommerd wees dat jy te puntenerig is nie. Die woordeboek verbeter vinniger deur hierdie terugvoer as deur enigiets anders.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Kindermodus verander nie die verduideliking nie.",
            a: [
              "Kindermodus verander net teks waar die woord reeds 'n kindervriendelike verduideliking het. Vir splinternuwe woorde wat jy pas opgesoek het, gee dit 10 tot 15 sekondes. Die kindervriendelike weergawe word die eerste keer sommer dadelik geskep.",
              "Ook: kindermodus vereis Clear of Deep. As jy op Basic is, sal die skakelaar jou vra om op te gradeer. Anonieme gebruikers word gevra om te registreer.",
            ],
          },
          {
            id: "voice-fails",
            q: "Stemsoektog werk nie.",
            a: [
              "Stemsoektog het mikrofoontoestemming nodig. Die meeste blaaiers vra een keer per webwerf. As jy per ongeluk op Blokkeer geklik het, moet jy dit self terugstel: klik op die slot- of inligtingsikoon langs gadit.app in die adresbalk, dan Werfinstellings, dan Mikrofoon, dan Laat toe.",
              "Op Safari iOS vereis mikrofoontoegang ook 'n skakelaar by Instellings → Safari → Mikrofoon. Stem is tans 'n Clear- en Deep-funksie: Basic-gebruikers sien 'n opgraderingsversoek, afgemelde besoekers sien 'n aanmeldversoek.",
            ],
          },
          {
            id: "no-image",
            q: "Ek kan nie 'n prent vir die woord skep nie.",
            a: [
              "Prentskepping is 'n Clear- of Deep-funksie met 'n maandelikse kwota. Clear kry 30 prente per maand, Deep kry 100. As jy die kwota opgebruik het, sal jy 'n blokkering sien. Dit word op die 1ste van elke maand teruggestel.",
              "As jy onder die kwota is en steeds mislukkings sien, is dit gewoonlik tydelik. Probeer weer oor 30 sekondes. Aanhoudende mislukkings is 'n fout. Rapporteer dit asseblief vanaf die woordbladsy.",
            ],
          },
          {
            id: "save-word",
            q: "Hoe stoor ek 'n woord in my notaboek?",
            a: [
              "Op enige woordresultaatbladsy, tik op Stoor in notaboek naby die titel. Die notaboek is 'n Clear- en Deep-funksie waar jy gestoorde woorde later kan hersien, hulle in 'n sterrestelselaansig kan sien en slim oefensessies kan doen (Deep).",
              "Woorde wat jy gestoor en minstens een keer oopgemaak het, is vanlyn beskikbaar uit die plaaslike kas. Die vanlyn pakket stoor ook die gewildste woorde in jou taal sodat jy sonder internet gereed is.",
            ],
          },
          {
            id: "offline",
            q: "Hoe werk vanlyn modus?",
            a: [
              "Woorde wat jy reeds bekyk het, word plaaslik in die kas gestoor. Maak hulle weer sonder internet oop en hulle laai onmiddellik. Die volledige vanlyn pakket (topwoorde in jou taal) word op aanvraag vanaf die notaboekbladsy afgelaai.",
              "Om 'n splinternuwe woord te soek, vereis steeds 'n verbinding, want Gadit moet die definisie van nuuts af skep. Die vanlyn kas is vir woorde wat jy reeds verken het.",
            ],
          },
          {
            id: "slow",
            q: "Die toep voel stadig.",
            a: [
              "Die eerste soektog van 'n woord is die stadigste omdat Gadit die volledige resultaat van nuuts af skep: gewoonlik 'n paar sekondes, soms langer vir komplekse woorde. Latere soektogte van dieselfde woord is onmiddellik, uit die kas bedien.",
              "As alles stadig voel, probeer 'n harde herlaai: Cmd+Shift+R op Mac, Ctrl+Shift+R op Windows. As die stadigheid oor verskeie bladsye voortduur, e-pos ons asseblief met jou land en blaaier sodat die span die netwerkroete van jou streek na ons bedieners kan nagaan.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ek het 'n woord gesoek en geen resultaat gekry nie. Wat gaan aan?",
            a: [
              "Kontroleer eers die spelling. Gadit hanteer meestal klein tikfoute, maar 'n verkeerde klinker of ontbrekende letter kan dit van stryk bring. Probeer die voorgestelde regstelling as een verskyn.",
              "Verder: baie skaars woorde of slengwoorde gee dalk nie 'n betroubare resultaat nie. As jy seker is die woord bestaan, klik op die Rapporteer-knoppie op die resultaatbladsy (of op die foutskerm) en laat weet ons. Elke verslag word nagegaan en woorde wat werklik gemis is, word terug in die stelsel gevoer.",
            ],
          },
          {
            id: "change-language",
            q: "Hoe verander ek die koppelvlaktaal?",
            a: [
              "Regs bo op enige bladsy sien jy 'n klein vlagikoon (of die naam van jou huidige taal). Tik daarop en kies uit 30+ tale: Engels, Grieks, Hebreeus, Arabies, Russies, Spaans, Portugees, Frans, Duits, Tsjeggies, Slowaaks, Italiaans, Japannees, Hindi, Amharies, Zoeloe.",
              "Jou keuse word op hierdie toestel gestoor. Alles herlaai in die nuwe taal: die koppelvlak, die kieslyste, toekomstige woorddefinisies, voorbeelde, kinderverduidelikings, selfs die etimologie. Resultate wat reeds in die ou taal in die kas is, bly totdat jy daardie woorde weer soek.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Vennootprogram",
        items: [
          {
            id: "join-partner",
            q: "Hoe word ek 'n Gadit-vennoot?",
            a: [
              "Maak /partners vanaf enige bladsy oop en klik op \"Word 'n vennoot\". Registreer met jou naam en e-posadres, en jou unieke verwysingskakel plus 'n paneelbord om klieke en kommissies te volg, is dadelik gereed. Geen wag vir goedkeuring nie.",
              "Aansluiting is gratis en oop vir enigiemand. Jy het nie 'n Gadit-intekening nodig om 'n vennoot te word nie.",
            ],
          },
          {
            id: "commission-model",
            q: "Hoe word kommissies bereken?",
            a: [
              "Die standaardvoorwaardes is 25% van elke betaling wat 'n kliënt in hul eerste jaar maak. Na daardie eerste jaar verdien jy 10% van elke betaling solank die kliënt aanhou betaal.",
              "Dit werk dieselfde vir maandelikse en jaarlikse planne, want kommissie word op elke werklike betaling bereken. As 'n kliënt kanselleer, stop jou kommissie met hul laaste betaling.",
              "Die span kan ander tariewe vir spesifieke vennote stel. Jou eie tariewe verskyn altyd op jou vennootpaneelbord, wat jy vanaf /partners kan bereik.",
            ],
          },
          {
            id: "payout",
            q: "Wanneer word ek betaal?",
            a: [
              "Maandeliks, sodra jou saldo $50 oorskry. Ons gebruik die uitbetalingsmetode wat jy op die vennootpaneelbord gestel het (bankoorplasing, PayPal, ensovoorts). $50 is die minimum drempel, nie 'n plafon nie. Jy kan baie meer verdien, jy ontvang net die uitbetaling wanneer jy die drempel oorskry.",
              "Kommissies word 30 dae na die intekeningbetaling vrygestel, om voorsiening te maak vir die terugbetalingstydperk. 'n Januarie-intekening word dus vroeg in Februarie vrygestel en beland in jou volgende uitbetaling sodra jou saldo $50 oorskry.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ek het aangesluit, maar my paneelbord is leeg.",
            a: [
              "Statistieke verskyn na die eerste klik op jou skakel. Leeg beteken net dat nog niemand geklik het nie. Gaan deel die skakel. Die paneelbord werk byna intyds by sodra daar aktiwiteit is.",
              "As jy gedeel het en iemand geregistreer het, maar die paneelbord wys dit nie, skryf aan ons met die benaderde tyd van registrasie en die span sal die toeskrywing nagaan.",
            ],
          },
          {
            id: "attribution-window",
            q: "Hoe lank hou my verwysingskakel 'n besoeker dop?",
            a: [
              "Sestig dae. Wanneer 'n besoeker op jou skakel klik, stel ons 'n koekie wat jou as die verwyser identifiseer. As hulle enige tyd in die volgende 60 dae registreer en inteken (selfs as hulle die webwerf verlaat en later via 'n Google-soektog terugkom), word dit steeds aan jou toegeskryf.",
              "Koekies uitvee: as die besoeker hul koekies uitvee of van blaaier/toestel verander voordat hulle registreer, kan die toeskrywing verlore gaan. Daar is geen oplossing daarvoor nie, maar 60 dae is 'n ruim tydperk in vergelyking met die meeste vennootprogramme.",
            ],
          },
          {
            id: "missing-commission",
            q: "Iemand het deur my skakel geregistreer, maar ek sien nie die kommissie nie.",
            a: [
              "Meestal gaan dit oor tydsberekening: die registrasie verskyn binne minute op die paneelbord, maar die kommissie word eers geboek wanneer die intekening werklik betaal is (wat dae later kan wees as hulle op 'n gratis proeftydperk is). Kyk weer nadat die proeftydperk verby is.",
              "As die intekening betaal is, maar jy sien ná 48 uur steeds nie die kommissie nie, skryf aan ons met die benaderde registrasietyd en die e-posadres of benaderde naam van die intekenaar as jy dit weet. Die span sal die toeskrywingsketting ondersoek en enige gemis self regstel.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Algemeen",
        items: [
          {
            id: "what-is-gadit",
            q: "Wat is Gadit?",
            a: [
              "'n Meertalige woordeboek wat gebou is om 'n woord regtig te laat insink, nie net om 'n eenreël-definisie te gee nie. Elke woord maak oop met al sy betekenisse, regte voorbeelde per betekenis, idiome, etimologie, 'n opsionele prent en (met Clear en Deep) 'n kindervriendelike verduideliking, skryf jou eie sin met terugvoer, en vasvrae.",
              "Tans 30+ koppelvlaktale. Intern noem die span dit om 'n woord te GAD: om 'n woord deur en deur te verstaan, nie net te vertaal nie.",
            ],
          },
          {
            id: "languages",
            q: "Watter tale ondersteun julle?",
            a: [
              "Koppelvlak: Engels, Grieks, Hebreeus, Arabies, Russies, Spaans, Portugees, Frans, Duits, Tsjeggies, Slowaaks, Italiaans, Japannees, Zoeloe.",
              "Jy kan 'n woord in enige van daardie tale opsoek en die definisie, voorbeelde en alles anders in jou gekose koppelvlaktaal kry. Hebreeus en Arabies is volledig RTL (van regs na links) en gebruik hul eie lettertipes.",
            ],
          },
          {
            id: "kid-safety",
            q: "Is Gadit veilig vir kinders?",
            a: [
              "Gadit is ontwerp sodat 'n ouer dit veilig saam met 'n kind kan gebruik. Kindermodus lewer verduidelikings wat eenvoudig, konkreet en ouderdomsgepas is (rondom die vlak van 5 tot 10 jaar oud), met dieselfde enjin wat volwasse inhoud aandryf, maar met uitdruklike instruksies om te vereenvoudig. Geen gebruikersgegenereerde inhoud word ooit aan kinders gewys nie.",
              "In ooreenstemming met ons beleid en kinderprivaatheidsreëls regoor die wêreld, is onafhanklike rekeningeienaarskap vir 13 jaar en ouer. Die standaardpatroon is 'n ouer se rekening wat die ouer saam met hul kind gebruik, en dit is presies waarvoor Kindermodus gebou is.",
            ],
          },
          {
            id: "data",
            q: "Waar word my data gestoor? Verkoop julle dit?",
            a: [
              "Rekening, geskiedenis, notaboek en geskepte prente word veilig in Firebase gestoor, geënkripteer in berging. Ons verkoop nie jou data aan enigiemand nie. Ons deel net wat nodig is om Gadit te bedryf (berging, betalings, inhoudverskaffers), soos uiteengesit in die Privaatheidsbeleid.",
              "Jy kan jou notaboek uitvoer of jou rekening enige tyd vanaf die Rekening-bladsy skrap.",
            ],
          },
          {
            id: "contact-direct",
            q: "Hoe bereik ek julle direk?",
            a: [
              "Gebruik die e-posknoppie onderaan hierdie bladsy. Dit gaan direk na die span se inkassie. Elke boodskap word gelees en kry binne 24 tot 48 uur 'n antwoord (dikwels vinniger).",
              "E-pos is beter as klets vir ondersteuning: dit gee die span 'n kans om noukeurig te lees en deurdag te antwoord. Telefoniese ondersteuning word nog nie aangebied nie.",
            ],
          },
        ],
      },
    ],
  },
  sw: {
    eyebrow: "Kituo cha Msaada",
    heading: "Pata jibu, haraka.",
    lede: "Maswali ya kawaida na suluhisho hatua kwa hatua, yamepangwa kwa maeneo. Ikiwa huoni tatizo lako, wasiliana na timu chini ya ukurasa.",
    stillNeedHelpHeading: "Bado umekwama?",
    stillNeedHelpBody: "Tuandikie moja kwa moja. Kila ujumbe husomwa na timu na hujibiwa ndani ya siku moja au mbili.",
    emailCta: "Tutumie barua pepe",
    responseTime: "Muda wa kawaida wa kujibu: ndani ya saa 24 hadi 48.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Malipo na usajili",
        items: [
          {
            id: "change-card",
            q: "Ninabadilishaje kadi ya mkopo kwenye usajili wangu?",
            a: [
              "Unaweza kuhamia kadi mpya kwa chini ya dakika moja bila kughairi. Usajili wako wa sasa unaendelea kama kawaida, ila kwa kadi mpya.",
              "1. Ingia kwenye gadit.app na ufungue ukurasa wako wa Akaunti (juu kulia). 2. Bofya \"Dhibiti malipo\". 3. Ukurasa salama wa Stripe utafunguka. Bofya \"Ongeza njia ya malipo\", weka kadi mpya, na uiweke kama Chaguo-msingi. 4. Ukipenda, ondoa kadi ya zamani.",
              "Kuanzia mzunguko ujao wa malipo, kila kitu kitatozwa kwenye kadi mpya. Malipo ya awali (yaliyokwisha kukusanywa) yanabaki kwenye kadi ya zamani. Hakuna haja ya kurejeshewa pesa isipokuwa ukitaka hasa.",
            ],
          },
          {
            id: "cancel",
            q: "Ninaghairi vipi usajili wangu?",
            a: [
              "Unaweza kufanya mwenyewe, wakati wowote. Ingia, fungua Akaunti, kisha gusa Ghairi usajili chini ya mpango wako.",
              "Utaendelea kutumia huduma hadi mwisho wa kipindi ulichokwisha kulipia. Baada ya hapo akaunti inarudi kwenye Basic (bure). Maneno uliyohifadhi, historia, na daftari lako vinabaki salama na unaweza kuvifikia.",
              "Ukighairi kwa makosa au ukibadili nia, unaweza kuendelea na usajili kutoka ukurasa huo huo kabla kipindi hakijaisha.",
            ],
          },
          {
            id: "switch-plan",
            q: "Ninahamaje kutoka Clear kwenda Deep (au kinyume chake)?",
            a: [
              "Akaunti, kisha Dhibiti malipo, kisha Sasisha usajili. Chagua mpango mpya.",
              "Stripe hukokotoa tofauti ya bei kiotomatiki, kwa uwiano wa siku zilizobaki katika kipindi cha sasa. Ukipandisha daraja, utatozwa tofauti tu kwa sehemu iliyobaki ya kipindi. Ukihamia daraja la chini, salio litatumika kwenye bili yako inayofuata.",
            ],
          },
          {
            id: "invoice",
            q: "Ninapakuaje ankara au risiti?",
            a: [
              "Akaunti, kisha Dhibiti malipo, kisha Historia ya ankara. Kila malipo yana risiti ya PDF unayoweza kupakua, yenye maelezo ya malipo uliyohifadhi.",
              "Ikiwa unahitaji jina, anwani, au namba ya kodi tofauti kwenye ankara (kwa mfano jina la kampuni kwa ajili ya kodi), sasisha maelezo yako ya malipo kwenye ukurasa huo huo kabla ya kupakua. Risiti inayofuata itatumia maelezo mapya.",
            ],
          },
          {
            id: "portal-error",
            q: "Nilibofya Dhibiti malipo lakini nikapata hitilafu. Sasa nifanye nini?",
            a: [
              "Kuna sababu mbili za kawaida. Kwanza, akaunti yako haina usajili wa Stripe unaofanya kazi. Pili, huenda Stripe bado haina wasifu kamili wa malipo wa akaunti yako.",
              "Ukaguzi rahisi wa kwanza: toka, ingia tena kwa barua pepe uliyotumia wakati wa kulipa, kisha jaribu tena. Ikiendelea kushindikana, wasiliana nasi ukitaja barua pepe ya akaunti yako na timu itairekebisha kutoka upande wetu ndani ya dakika moja.",
            ],
          },
          {
            id: "autorenew",
            q: "Je, usajili wangu utajisasisha kiotomatiki?",
            a: [
              "Ndiyo. Mipango ya kila mwezi husasishwa kila mwezi, mipango ya kila mwaka husasishwa kila mwaka tarehe ile ile. Unaweza kuona tarehe ijayo ya malipo kwenye akaunti yako na kwenye tovuti ya Stripe.",
              "Ikiwa hutaki usasishaji wa kiotomatiki, ghairi wakati wowote kabla ya tarehe ya kusasisha. Kughairi hakuanzi papo hapo. Utaendelea kutumia huduma katika kipindi chote ulichokwisha kulipia.",
            ],
          },
          {
            id: "refund",
            q: "Je, ninaweza kurejeshewa pesa?",
            a: [
              "Ndiyo. Ikiwa ulinunua chini ya siku 14 zilizopita na huduma haijatumika sana, tuandikie ukitaja barua pepe ya akaunti yako na maelezo mafupi ya sababu. Marejesho hayo huidhinishwa bila usumbufu.",
              "Ikiwa zimepita zaidi ya siku 14, timu hushughulikia kila kesi kivyake. Ghairi usajili ili usiendelee kujisasisha, kisha tutumie barua pepe.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Ninaona malipo nisiyoyatambua.",
            a: [
              "Malipo huonekana kama GADIT au GADIT.APP yakiwa $2.99 (Clear kila mwezi), $4.99 (Deep kila mwezi), $29.99 (Clear kila mwaka), au $49.99 (Deep kila mwaka). Ikiwa hayalingani, huenda yanatoka kwa huduma nyingine.",
              "Ikiwa una uhakika si yako, usiyapinge kupitia benki yako bado. Tuandikie moja kwa moja kwanza ukitaja tarehe na kiasi. Timu itayatafuta, itaeleza ni nini, na itarejesha pesa ikihitajika. Mgogoro wa benki unaweza kufanya malipo ya baadaye kuwa magumu zaidi, kwa hiyo kutatua kupitia huduma kwa wateja kwa kawaida ni haraka na salama zaidi.",
            ],
          },
          {
            id: "failed-payment",
            q: "Malipo yangu yameshindikana. Nifanye nini?",
            a: [
              "Stripe hujaribu tena malipo yaliyoshindikana kiotomatiki mara kadhaa katika siku zinazofuata. Mara nyingi tatizo hujitatua lenyewe benki inapoondoa kizuizi au kadi inapokuwa na salio la kutosha.",
              "Ukitaka kulirekebisha mara moja, nenda Akaunti → Dhibiti malipo → Ongeza njia ya malipo, weka kadi inayofanya kazi, na uiweke kama Chaguo-msingi. Stripe itajaribu tena malipo yaliyoshindikana papo hapo kwenye kadi mpya. Ikiwa usajili wako tayari umerudi kwenye Basic, unaweza kujisajili upya kutoka ukurasa wa Bei na daftari lako litabaki salama.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Kuna tofauti gani kati ya Basic, Clear, na Deep?",
            a: [
              "Basic (bure): hadi utafutaji wa maneno 20 kwa siku, kila maana, mifano kwa kila maana, nahau, na asili ya neno. Hakuna haja ya kujisajili kwa utafutaji wa msingi.",
              "Clear ($2.99/mwezi au $29.99/mwaka): utafutaji bila kikomo, maelezo yanayofaa watoto, picha moja kwa kila neno (30/mwezi), tunga sentensi yako mwenyewe upate maoni, maelezo ya kina ya nahau, na siku 30 za historia ya utafutaji.",
              "Deep ($4.99/mwezi au $49.99/mwaka): kila kitu kilicho kwenye Clear, pamoja na majaribio ya mazoezi, daftari binafsi lenye mazoezi mahiri ya kurudia kwa vipindi, kutofautisha maneno yanayofanana, na kiwango kikubwa zaidi cha picha (100/mwezi).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Akaunti na kuingia",
        items: [
          {
            id: "no-verification-email",
            q: "Sikupokea barua pepe ya uthibitisho.",
            a: [
              "Angalia kwanza folda za barua taka na matangazo. Gmail na Outlook wakati mwingine hupeleka barua pepe za akaunti huko hadi utakapoweka alama kwenye moja kuwa \"Si barua taka\".",
              "Ikiwa haipo huko, huenda barua pepe iliandikwa vibaya wakati wa kujisajili. Jaribu kujisajili tena na uhakiki anwani kwa makini. Ikiwa ulijisajili kwa Google, hakuna haja ya barua pepe ya uthibitisho.",
            ],
          },
          {
            id: "forgot-password",
            q: "Nimesahau nenosiri langu.",
            a: [
              "Fungua dirisha la kuingia na ubofye \"Umesahau nenosiri?\". Weka barua pepe unayotumia kwa Gadit na utapata kiungo cha kuweka upya ndani ya dakika moja au mbili.",
              "Ikiwa barua pepe haifiki, angalia barua taka. Ikiwa bado haifiki, huenda ulijisajili kwa Google badala ya barua pepe na nenosiri. Jaribu kitufe cha \"Endelea na Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Nina uhakika nenosiri langu ni sahihi lakini inasema \"Barua pepe au nenosiri si sahihi\".",
            a: [
              "Mambo matatu ya kukagua. Kwanza, Caps Lock. Pili, nafasi ya ziada mwishoni unaponakili na kubandika. Tatu, ulijisajili kwa Google badala ya nenosiri (tumia \"Endelea na Google\" badala yake).",
              "Bado umekwama? Weka upya nenosiri kutoka dirisha hilo hilo. Inakuanzisha upya kikamilifu.",
            ],
          },
          {
            id: "google-fails",
            q: "Kuingia kwa Google hakufanyi kazi.",
            a: [
              "Sababu ya kawaida zaidi: kivinjari chako kinazuia vidakuzi vya wahusika wengine au madirisha ibukizi kwa gadit.app. Viruhusu kwenye ruhusa za upau wa anwani kisha jaribu tena.",
              "Ikiwa uko kwenye hali fiche (incognito), kuingia kwa Google kumezuiwa kwa makusudi. Hamia kwenye dirisha la kawaida la kivinjari.",
            ],
          },
          {
            id: "change-email",
            q: "Ninabadilishaje barua pepe kwenye akaunti yangu?",
            a: [
              "Akaunti, bofya barua pepe yako, Badilisha barua pepe. Utahitaji kuthibitisha anwani mpya kabla mabadiliko hayajaanza kufanya kazi. Usajili wako, historia, na daftari vyote vinahamia nawe.",
              "Ikiwa barua pepe imeunganishwa na mteja wa Stripe, isasishe pia kwenye tovuti ya malipo ya Stripe ili risiti za baadaye ziende kwenye anwani mpya.",
            ],
          },
          {
            id: "delete-account",
            q: "Ninafutaje akaunti yangu?",
            a: [
              "Akaunti, chini ya ukurasa, Futa akaunti. Hatua hii ni ya kudumu. Usajili wako unaghairiwa, daftari na historia yako vinafutwa, na barua pepe inaachiliwa kwa ajili ya usajili mpya.",
              "Kumbukumbu za Stripe za malipo ya awali zinabaki (tunatakiwa kisheria kuzihifadhi kwa ajili ya uhasibu). Hakuna kingine kinachobaki.",
            ],
          },
          {
            id: "share-account",
            q: "Je, mwenzi wangu au mtoto wangu anaweza kutumia akaunti yangu pamoja nami?",
            a: [
              "Mtumiaji mmoja aliyeingia kwa kila akaunti kwa wakati mmoja. Hali ya Watoto inaruhusu akaunti moja ya Clear au Deep kumhudumia mzazi na mtoto: washa kitufe na maana zitaonyeshwa kwa namna inayofaa watoto bila kuingia tofauti.",
              "Kwa watu wazima wawili ambao kila mmoja anataka daftari na maendeleo yake, fungua akaunti mbili. Clear ni $2.99 kwa mwezi kwa kila akaunti.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Nadhani nina akaunti mbili kwa makosa. Sasa nifanye nini?",
            a: [
              "Hii kwa kawaida hutokea mtu anapojisajili mara moja kwa Google na mara moja kwa barua pepe na nenosiri akitumia anwani ile ile, au unapojisajili mara mbili kwa anwani tofauti za barua pepe. Kila usajili huunda akaunti tofauti ya Gadit yenye daftari, historia, na hali ya usajili yake.",
              "Tuandikie ukitaja anwani zote mbili za barua pepe (au UID kutoka ukurasa wa Akaunti) na ipi ungependa kubaki nayo. Timu itaunganisha madaftari na historia kwenye akaunti utakayochagua, kisha itafunga nyingine kwa utaratibu. Hakuna data itakayopotea.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Kutumia Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Nadhani maana si sahihi. Nifanye nini?",
            a: [
              "Kila ukurasa wa matokeo una kitufe kidogo cha \"Ripoti\" chini. Kiguse, chagua aina (maana, etimolojia, mfano, nahau, maelezo ya watoto, na kadhalika) na uandike ujumbe mfupi. Unafika moja kwa moja kwa timu na kila ripoti hupitiwa.",
              "Usijali kuwa mchambuzi kupita kiasi. Kamusi huboreka kutokana na maoni haya haraka kuliko kitu kingine chochote.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Hali ya Watoto haibadilishi maelezo.",
            a: [
              "Hali ya Watoto hubadilisha maandishi tu pale ambapo neno tayari lina maelezo yanayofaa watoto. Kwa maneno mapya kabisa uliyotafuta sasa hivi, subiri sekunde 10 hadi 15. Toleo linalofaa watoto huundwa papo hapo mara ya kwanza.",
              "Pia: Hali ya Watoto inahitaji Clear au Deep. Ikiwa uko kwenye Basic, kitufe kitakuomba upandishe daraja. Watumiaji wasiojulikana wataombwa kujisajili.",
            ],
          },
          {
            id: "voice-fails",
            q: "Utafutaji kwa sauti haufanyi kazi.",
            a: [
              "Utafutaji kwa sauti unahitaji ruhusa ya kipaza sauti. Vivinjari vingi huuliza mara moja kwa kila tovuti. Ikiwa ulibofya Zuia kwa bahati mbaya, utahitaji kuirudisha mwenyewe: bofya aikoni ya kufuli au taarifa kando ya gadit.app kwenye upau wa anwani, kisha Mipangilio ya tovuti, kisha Kipaza sauti, kisha Ruhusu.",
              "Kwenye Safari iOS, ufikiaji wa kipaza sauti pia unahitaji kuwasha kitufe kwenye Mipangilio → Safari → Kipaza sauti. Kwa sasa sauti ni kipengele cha Clear na Deep: watumiaji wa Basic wanaona ombi la kupandisha daraja, wageni ambao hawajaingia wanaona ombi la kuingia.",
            ],
          },
          {
            id: "no-image",
            q: "Siwezi kuunda picha ya neno.",
            a: [
              "Kuunda picha ni kipengele cha Clear au Deep chenye kiwango cha kila mwezi. Clear inapata picha 30 kwa mwezi, Deep inapata 100. Ukimaliza kiwango, utaona kizuizi. Kiwango huanza upya tarehe 1 ya kila mwezi.",
              "Ikiwa hujafikia kiwango na bado unaona hitilafu, kwa kawaida ni ya muda tu. Jaribu tena baada ya sekunde 30. Hitilafu zinazoendelea ni kasoro ya mfumo. Tafadhali ripoti kutoka ukurasa wa neno.",
            ],
          },
          {
            id: "save-word",
            q: "Ninahifadhije neno kwenye daftari langu?",
            a: [
              "Kwenye ukurasa wowote wa matokeo ya neno, gusa Hifadhi kwenye daftari karibu na kichwa. Daftari ni kipengele cha Clear na Deep ambapo unaweza kupitia maneno uliyohifadhi baadaye, kuyaona kwenye mwonekano wa galaksi, na kufanya vipindi vya mazoezi mahiri (Deep).",
              "Maneno uliyohifadhi na kuyafungua angalau mara moja yanapatikana nje ya mtandao kutoka kwenye akiba ya kifaa. Kifurushi cha nje ya mtandao pia huhifadhi maneno maarufu zaidi katika lugha yako ili uwe tayari hata bila intaneti.",
            ],
          },
          {
            id: "offline",
            q: "Hali ya nje ya mtandao inafanyaje kazi?",
            a: [
              "Maneno uliyokwisha kuyaona huhifadhiwa kwenye akiba ya kifaa. Yafungue tena bila intaneti na yatafunguka papo hapo. Kifurushi kamili cha nje ya mtandao (maneno ya juu katika lugha yako) hupakuliwa unapokiomba kutoka ukurasa wa daftari.",
              "Kutafuta neno jipya kabisa bado kunahitaji muunganisho, kwa sababu Gadit lazima iunde maana kuanzia mwanzo. Akiba ya nje ya mtandao ni kwa maneno uliyokwisha kuyachunguza.",
            ],
          },
          {
            id: "slow",
            q: "Programu inaonekana kuwa polepole.",
            a: [
              "Utafutaji wa kwanza wa neno ndio wa polepole zaidi kwa sababu Gadit huunda matokeo kamili kuanzia mwanzo: kwa kawaida sekunde chache, wakati mwingine zaidi kwa maneno magumu. Utafutaji unaofuata wa neno hilo hilo ni wa papo hapo, kutoka kwenye akiba.",
              "Ikiwa kila kitu kiko polepole, jaribu kupakia upya kikamilifu: Cmd+Shift+R kwenye Mac, Ctrl+Shift+R kwenye Windows. Ikiwa hali hiyo inaendelea kwenye kurasa nyingi, tafadhali tutumie barua pepe ukitaja nchi yako na kivinjari ili timu ikague njia ya mtandao kutoka eneo lako hadi kwenye seva zetu.",
            ],
          },
          {
            id: "word-not-found",
            q: "Nilitafuta neno na sikupata matokeo. Kuna nini?",
            a: [
              "Kwanza, kagua tahajia. Mara nyingi Gadit hushughulikia makosa madogo ya uchapaji, lakini irabu isiyo sahihi au herufi iliyokosekana inaweza kuichanganya. Jaribu marekebisho yanayopendekezwa ikiwa yanaonekana.",
              "Zaidi ya hayo: maneno adimu sana au ya misimu huenda yasilete matokeo ya uhakika. Ikiwa una uhakika neno lipo kweli, bofya kitufe cha Ripoti kwenye ukurasa wa matokeo (au kwenye skrini ya hitilafu) na utujulishe. Kila ripoti hupitiwa na maneno yaliyokosekana kweli huingizwa tena kwenye mfumo.",
            ],
          },
          {
            id: "change-language",
            q: "Ninabadilishaje lugha ya kiolesura?",
            a: [
              "Juu kulia mwa ukurasa wowote, utaona aikoni ndogo ya bendera (au jina la lugha yako ya sasa). Iguse na uchague kati ya lugha 30+: Kiingereza, Kigiriki, Kiebrania, Kiarabu, Kirusi, Kihispania, Kireno, Kifaransa, Kijerumani, Kicheki, Kislovakia, Kiitaliano, Kijapani, Kihindi, Kiamhari, Kizulu.",
              "Chaguo lako huhifadhiwa kwenye kifaa hiki. Kila kitu hupakia upya kwa lugha mpya: kiolesura, menyu, maana za maneno za baadaye, mifano, maelezo ya watoto, hata etimolojia. Matokeo yaliyokwisha kuhifadhiwa kwenye akiba kwa lugha ya zamani yanabaki hadi utakapotafuta maneno hayo tena.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Mpango wa washirika",
        items: [
          {
            id: "join-partner",
            q: "Ninakuwaje mshirika wa Gadit?",
            a: [
              "Fungua /partners kutoka ukurasa wowote na ubofye \"Kuwa mshirika\". Jisajili kwa jina lako na barua pepe, na kiungo chako cha kipekee cha rufaa pamoja na dashibodi ya kufuatilia mibofyo na kamisheni vitakuwa tayari papo hapo. Hakuna kusubiri idhini.",
              "Kujiunga ni bure na kuko wazi kwa yeyote. Huhitaji usajili wa Gadit ili kuwa mshirika.",
            ],
          },
          {
            id: "commission-model",
            q: "Kamisheni hukokotolewa vipi?",
            a: [
              "Masharti ya kawaida ni 25% ya kila malipo ambayo mteja hufanya katika mwaka wake wa kwanza. Baada ya mwaka huo wa kwanza, unapata 10% ya kila malipo kwa muda wote ambao mteja anaendelea kulipa.",
              "Hii inafanya kazi vivyo hivyo kwa mipango ya kila mwezi na ya kila mwaka, kwa sababu kamisheni huhesabiwa kwa kila malipo halisi. Mteja akighairi, kamisheni yako inakoma na malipo yake ya mwisho.",
              "Timu inaweza kuweka viwango tofauti kwa washirika fulani. Viwango vyako mwenyewe huonekana kila wakati kwenye dashibodi yako ya mshirika, ambayo unaweza kuifikia kutoka /partners.",
            ],
          },
          {
            id: "payout",
            q: "Ninalipwa lini?",
            a: [
              "Kila mwezi, salio lako likishavuka $50. Tunatumia njia ya malipo uliyoweka kwenye dashibodi ya mshirika (uhamisho wa benki, PayPal, na kadhalika). $50 ni kiwango cha chini, si kikomo. Unaweza kupata zaidi sana, ila unapokea malipo unapovuka kiwango hicho.",
              "Kamisheni hutolewa siku 30 baada ya malipo ya usajili, ili kutoa nafasi kwa kipindi cha kurejesha pesa. Kwa hiyo usajili wa Januari hutolewa mwanzoni mwa Februari na kuingia kwenye malipo yako yanayofuata salio lako likishavuka $50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Nimejiunga lakini dashibodi yangu haina kitu.",
            a: [
              "Takwimu huonekana baada ya mbofyo wa kwanza kwenye kiungo chako. Kuwa tupu kunamaanisha tu kwamba bado hakuna aliyebofya. Nenda ukashiriki kiungo. Dashibodi husasishwa karibu papo hapo shughuli zikianza.",
              "Ikiwa umeshiriki na mtu amejisajili lakini dashibodi haionyeshi hivyo, tuandikie ukitaja muda wa takriban wa kujisajili na timu itakagua uhusishaji.",
            ],
          },
          {
            id: "attribution-window",
            q: "Kiungo changu cha rufaa kinamfuatilia mgeni kwa muda gani?",
            a: [
              "Siku sitini. Mgeni anapobofya kiungo chako, tunaweka kidakuzi kinachokutambulisha kama aliyemleta. Akijisajili na kulipia usajili wakati wowote ndani ya siku 60 zijazo (hata akiondoka kwenye tovuti na kurudi baadaye kupitia utafutaji wa Google), bado unahesabiwa wewe.",
              "Kufuta vidakuzi: mgeni akifuta vidakuzi vyake au akibadili kivinjari/kifaa kabla ya kujisajili, uhusishaji unaweza kupotea. Hakuna njia ya kuepuka hilo, lakini siku 60 ni kipindi kirefu ukilinganisha na programu nyingi za washirika.",
            ],
          },
          {
            id: "missing-commission",
            q: "Mtu amejisajili kupitia kiungo changu lakini sioni kamisheni.",
            a: [
              "Mara nyingi ni suala la muda: usajili huonekana kwenye dashibodi ndani ya dakika chache, lakini kamisheni hurekodiwa tu usajili unapolipiwa kweli (jambo ambalo linaweza kuwa siku kadhaa baadaye ikiwa wako kwenye kipindi cha majaribio bila malipo). Angalia tena baada ya kipindi cha majaribio kuisha.",
              "Ikiwa usajili umelipiwa lakini bado huoni kamisheni baada ya saa 48, tuandikie ukitaja muda wa takriban wa kujisajili na barua pepe au jina la takriban la mteja ikiwa unalijua. Timu itachunguza mnyororo wa uhusishaji na kurekebisha kosa lolote yenyewe.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Jumla",
        items: [
          {
            id: "what-is-gadit",
            q: "Gadit ni nini?",
            a: [
              "Kamusi ya lugha nyingi iliyojengwa ili ulielewe neno kweli, si kutoa tu maana ya mstari mmoja. Kila neno hufunguka na maana zake zote, mifano halisi kwa kila maana, nahau, etimolojia, picha ya hiari, na (kwa Clear na Deep) maelezo yanayofaa watoto, tunga sentensi yako mwenyewe upate maoni, na majaribio.",
              "Kwa sasa kuna lugha 30+ za kiolesura. Ndani ya timu tunaita hivi kufanya GAD kwa neno: kuelewa neno hadi mwisho, si kulitafsiri tu.",
            ],
          },
          {
            id: "languages",
            q: "Mnaunga mkono lugha zipi?",
            a: [
              "Kiolesura: Kiingereza, Kigiriki, Kiebrania, Kiarabu, Kirusi, Kihispania, Kireno, Kifaransa, Kijerumani, Kicheki, Kislovakia, Kiitaliano, Kijapani, Kizulu.",
              "Unaweza kutafuta neno kwa lugha yoyote kati ya hizo na kupata maana, mifano, na kila kitu kingine kwa lugha ya kiolesura uliyochagua. Kiebrania na Kiarabu zinaonyeshwa kikamilifu kutoka kulia kwenda kushoto (RTL) na zinatumia fonti zao asilia.",
            ],
          },
          {
            id: "kid-safety",
            q: "Je, Gadit ni salama kwa watoto?",
            a: [
              "Gadit imeundwa ili mzazi aitumie kwa usalama pamoja na mtoto. Hali ya Watoto hutoa maelezo rahisi, yanayoeleweka, na yanayofaa umri (karibu kiwango cha miaka 5 hadi 10), ikitumia injini ile ile inayoendesha maudhui ya watu wazima ikiwa na maagizo ya wazi ya kurahisisha. Maudhui yanayoundwa na watumiaji hayaonyeshwi kamwe kwa watoto.",
              "Kwa mujibu wa sera zetu na kanuni za faragha za watoto duniani kote, umiliki wa akaunti binafsi ni kwa miaka 13 na zaidi. Mpangilio wa kawaida ni akaunti ya mzazi ambayo mzazi huitumia pamoja na mtoto wake, na hicho ndicho hasa Hali ya Watoto imejengwa kwa ajili yake.",
            ],
          },
          {
            id: "data",
            q: "Data yangu inahifadhiwa wapi? Je, mnaiuza?",
            a: [
              "Akaunti, historia, daftari, na picha zilizoundwa huhifadhiwa kwa usalama kwenye Firebase, zikiwa zimesimbwa fiche katika hifadhi. Hatuuzi data yako kwa mtu yeyote. Tunashiriki tu kile kinachohitajika kuendesha Gadit (hifadhi, malipo, watoa maudhui), kama ilivyoelezwa kwenye Sera ya Faragha.",
              "Unaweza kuhamisha daftari lako au kufuta akaunti yako wakati wowote kutoka ukurasa wa Akaunti.",
            ],
          },
          {
            id: "contact-direct",
            q: "Ninawafikiaje moja kwa moja?",
            a: [
              "Tumia kitufe cha barua pepe chini ya ukurasa huu. Kinaenda moja kwa moja kwenye kikasha cha timu. Kila ujumbe husomwa na kujibiwa ndani ya saa 24 hadi 48 (mara nyingi haraka zaidi).",
              "Kwa msaada, barua pepe ni bora kuliko gumzo: inaipa timu nafasi ya kusoma kwa makini na kujibu kwa uangalifu. Msaada kwa simu bado haupatikani.",
            ],
          },
        ],
      },
    ],
  },
  da: {
    eyebrow: "Hjælpecenter",
    heading: "Find et svar, hurtigt.",
    lede: "Almindelige spørgsmål og løsninger trin for trin, ordnet efter emne. Hvis du ikke kan se dit problem, så kontakt teamet nederst på siden.",
    stillNeedHelpHeading: "Sidder du stadig fast?",
    stillNeedHelpBody: "Skriv direkte til os. Teamet læser hver eneste besked og svarer inden for en dag eller to.",
    emailCta: "Send os en e-mail",
    responseTime: "Typisk svartid: inden for 24 til 48 timer.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Betaling og abonnement",
        items: [
          {
            id: "change-card",
            q: "Hvordan skifter jeg betalingskortet på mit abonnement?",
            a: [
              "Du kan skifte til et nyt kort på under et minut uden at opsige noget. Dit nuværende abonnement fortsætter som normalt, bare på det nye kort.",
              "1. Log ind på gadit.app, og åbn din Konto-side (øverst til højre). 2. Klik på \"Administrer betaling\". 3. En sikker Stripe-side åbnes. Klik på \"Tilføj betalingsmetode\", indtast det nye kort, og markér det som Standard. 4. Fjern eventuelt det gamle kort.",
              "Fra næste betalingsperiode går alt til det nye kort. Den tidligere opkrævning (som allerede er trukket) bliver på det gamle kort. Der er ikke brug for en refusion, medmindre du specifikt ønsker en.",
            ],
          },
          {
            id: "cancel",
            q: "Hvordan opsiger jeg mit abonnement?",
            a: [
              "Du gør det selv, når som helst. Log ind, åbn Konto, og tryk på Opsig abonnement under din plan.",
              "Din adgang fortsætter til udgangen af den periode, du allerede har betalt for. Derefter går kontoen tilbage til Basic (gratis). Dine gemte ord, din historik og din notesbog forbliver sikre og tilgængelige.",
              "Hvis du opsiger ved en fejl eller fortryder, kan du genoptage abonnementet fra samme side, før perioden udløber.",
            ],
          },
          {
            id: "switch-plan",
            q: "Hvordan skifter jeg fra Clear til Deep (eller omvendt)?",
            a: [
              "Konto, derefter Administrer betaling, derefter Opdater abonnement. Vælg den nye plan.",
              "Stripe beregner prisforskellen automatisk, forholdsmæssigt ud fra de dage, der er tilbage i den aktuelle periode. Hvis du opgraderer, bliver du kun opkrævet forskellen for resten af perioden. Hvis du skifter til et lavere niveau, bliver kreditten trukket fra din næste regning.",
            ],
          },
          {
            id: "invoice",
            q: "Hvordan downloader jeg en faktura eller kvittering?",
            a: [
              "Konto, derefter Administrer betaling, derefter Fakturahistorik. Hver opkrævning har en PDF-kvittering, du kan downloade, med de faktureringsoplysninger, du har gemt.",
              "Hvis du har brug for et andet navn, en anden adresse eller et andet skattenummer på fakturaen (for eksempel et firmanavn af skattemæssige årsager), så opdater dine faktureringsoplysninger på samme side, før du downloader. Den næste kvittering bruger de nye oplysninger.",
            ],
          },
          {
            id: "portal-error",
            q: "Jeg klikkede på Administrer betaling, men fik en fejl. Hvad nu?",
            a: [
              "To almindelige årsager. For det første har din konto ikke et aktivt Stripe-abonnement. For det andet har Stripe måske endnu ikke en komplet betalingsprofil for din konto.",
              "Nem første kontrol: log ud, log ind igen med den e-mail, du brugte ved betalingen, og prøv igen. Hvis det stadig ikke virker, så kontakt os med din kontos e-mail, så ordner teamet det fra vores side på et minut.",
            ],
          },
          {
            id: "autorenew",
            q: "Fornyes mit abonnement automatisk?",
            a: [
              "Ja. Månedlige planer fornyes hver måned, årlige planer fornyes hvert år på samme dato. Du kan se næste betalingsdato på din konto og i Stripes portal.",
              "Hvis du ikke vil have automatisk fornyelse, så opsig når som helst før fornyelsesdatoen. Opsigelsen træder ikke i kraft med det samme. Du beholder adgangen hele den periode, du allerede har betalt for.",
            ],
          },
          {
            id: "refund",
            q: "Kan jeg få pengene tilbage?",
            a: [
              "Ja. Hvis købet er mindre end 14 dage gammelt, og tjenesten ikke er blevet brugt meget, så skriv til os med din kontos e-mail og en kort note om hvorfor. Den slags refusioner bliver godkendt uden diskussion.",
              "Hvis der er gået mere end 14 dage, behandler teamet det fra sag til sag. Opsig abonnementet, så det ikke bliver ved med at blive fornyet, og send os en e-mail.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Jeg kan se en opkrævning, jeg ikke genkender.",
            a: [
              "Opkrævninger vises som GADIT eller GADIT.APP med $2.99 (Clear månedlig), $4.99 (Deep månedlig), $29.99 (Clear årlig) eller $49.99 (Deep årlig). Hvis det ikke passer, kan den komme fra en anden tjeneste.",
              "Hvis du er sikker på, at den ikke er din, så lad være med at gøre indsigelse via din bank endnu. Skriv først direkte til os med dato og beløb. Teamet finder den, forklarer, hvad det er, og refunderer om nødvendigt. En indsigelse via banken kan gøre fremtidige betalinger sværere, så det er som regel hurtigere og sikrere at løse det via support.",
            ],
          },
          {
            id: "failed-payment",
            q: "Min betaling mislykkedes. Hvad skal jeg gøre?",
            a: [
              "Stripe prøver automatisk mislykkede betalinger igen et par gange i løbet af de følgende dage. De fleste fejl løser sig selv, når banken frigiver reservationen, eller kortet har nok dækning.",
              "Hvis du vil løse det med det samme, så gå til Konto → Administrer betaling → Tilføj betalingsmetode, indtast et kort, der virker, og sæt det som Standard. Stripe prøver straks den mislykkede opkrævning igen på det nye kort. Hvis dit abonnement allerede er faldet tilbage til Basic, kan du tegne abonnement igen fra Priser, og din notesbog er intakt.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Hvad er forskellen på Basic, Clear og Deep?",
            a: [
              "Basic (gratis): op til 20 ordopslag om dagen, alle betydninger, eksempler for hver betydning, idiomer og ordets oprindelse. Ingen tilmelding nødvendig til almindelige søgninger.",
              "Clear ($2.99/måned eller $29.99/år): ubegrænsede opslag, børnevenlige forklaringer, et billede pr. ord (30/måned), skriv din egen sætning og få feedback, uddybning af idiomer og 30 dages søgehistorik.",
              "Deep ($4.99/måned eller $49.99/år): alt i Clear plus øvequizzer, den personlige notesbog med smart øvelse med spredt gentagelse, skelnen mellem ord, der ligner hinanden, og en større billedkvote (100/måned).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Konto og login",
        items: [
          {
            id: "no-verification-email",
            q: "Jeg har ikke fået min bekræftelsesmail.",
            a: [
              "Tjek først mapperne for spam og kampagner. Gmail og Outlook sender nogle gange kontomails dertil, indtil du markerer en som \"Ikke spam\".",
              "Hvis den ikke er der, er e-mailen måske blevet stavet forkert ved tilmeldingen. Prøv at tilmelde dig igen, og dobbelttjek adressen. Hvis du tilmeldte dig med Google, er der ikke brug for en bekræftelsesmail.",
            ],
          },
          {
            id: "forgot-password",
            q: "Jeg har glemt min adgangskode.",
            a: [
              "Åbn login-vinduet, og klik på \"Glemt adgangskode?\". Indtast den e-mail, du bruger til Gadit, så får du et nulstillingslink inden for et minut eller to.",
              "Hvis mailen ikke kommer, så tjek spam. Hvis den stadig ikke kommer, har du måske tilmeldt dig med Google i stedet for e-mail og adgangskode. Prøv knappen \"Fortsæt med Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Jeg er sikker på, at min adgangskode er rigtig, men der står \"Forkert e-mail eller adgangskode\".",
            a: [
              "Tre ting at tjekke. For det første Caps Lock. For det andet et mellemrum til sidst, når du kopierer og indsætter. For det tredje om du tilmeldte dig med Google i stedet for en adgangskode (brug i så fald \"Fortsæt med Google\").",
              "Sidder du stadig fast? Nulstil adgangskoden fra samme vindue. Så starter du helt forfra.",
            ],
          },
          {
            id: "google-fails",
            q: "Login med Google virker ikke.",
            a: [
              "Den mest almindelige årsag: din browser blokerer tredjepartscookies eller pop op-vinduer for gadit.app. Tillad dem under tilladelserne i adresselinjen, og prøv igen.",
              "Hvis du bruger inkognitotilstand, er login med Google bevidst begrænset. Skift til et almindeligt browservindue.",
            ],
          },
          {
            id: "change-email",
            q: "Hvordan ændrer jeg e-mailen på min konto?",
            a: [
              "Konto, klik på din e-mail, Skift e-mail. Du skal bekræfte den nye adresse, før ændringen træder i kraft. Dit abonnement, din historik og din notesbog følger alle med.",
              "Hvis e-mailen er knyttet til en Stripe-kunde, så opdater den også i Stripes betalingsportal, så fremtidige kvitteringer går til den nye adresse.",
            ],
          },
          {
            id: "delete-account",
            q: "Hvordan sletter jeg min konto?",
            a: [
              "Konto, nederst på siden, Slet konto. Det er permanent. Dit abonnement bliver opsagt, din notesbog og historik bliver slettet, og e-mailen bliver frigivet til en ny tilmelding.",
              "Stripes registreringer af tidligere opkrævninger bliver bevaret (vi er lovmæssigt forpligtet til at gemme dem til regnskabet). Intet andet bliver gemt.",
            ],
          },
          {
            id: "share-account",
            q: "Kan min partner eller mit barn dele min konto?",
            a: [
              "Én logget ind bruger pr. konto ad gangen. Børnetilstand lader én Clear- eller Deep-konto betjene både en forælder og et barn: slå kontakten til, og definitionerne vises børnevenligt uden separate logins.",
              "Til to voksne, der begge vil have hver deres notesbog og fremskridt, skal I oprette to konti. Clear koster $2.99 om måneden pr. konto.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Jeg tror, jeg har to konti ved en fejl. Hvad nu?",
            a: [
              "Det sker typisk, når nogen tilmelder sig én gang med Google og én gang med e-mail og adgangskode med samme adresse, eller når du tilmelder dig to gange med forskellige e-mailadresser. Hver tilmelding opretter en separat Gadit-konto med sin egen notesbog, historik og abonnementsstatus.",
              "Skriv til os med begge e-mailadresser (eller UID'er fra Konto-siden), og hvilken du gerne vil beholde. Teamet samler notesbøgerne og historikken på den konto, du vælger, og lukker derefter den anden pænt. Ingen data går tabt.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "Brug af Gadit",
        items: [
          {
            id: "wrong-definition",
            q: "Jeg tror, definitionen er forkert. Hvad gør jeg?",
            a: [
              "Hver resultatside har en lille \"Rapportér\"-knap nederst. Tryk på den, vælg en kategori (definition, etymologi, eksempel, idiom, børneforklaring og så videre), og skriv en kort note. Den går direkte til teamet, og hver rapport bliver gennemgået.",
              "Du skal ikke være bange for at være for kritisk. Ordbogen bliver hurtigere bedre af denne feedback end af noget andet.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Børnetilstand ændrer ikke forklaringen.",
            a: [
              "Børnetilstand skifter kun teksten, hvor ordet allerede har en børnevenlig forklaring. For helt nye ord, du lige har slået op, så giv det 10 til 15 sekunder. Den børnevenlige version bliver lavet med det samme første gang.",
              "Desuden: børnetilstand kræver Clear eller Deep. Hvis du har Basic, vil kontakten bede dig om at opgradere. Anonyme brugere bliver bedt om at tilmelde sig.",
            ],
          },
          {
            id: "voice-fails",
            q: "Stemmesøgning virker ikke.",
            a: [
              "Stemmesøgning kræver adgang til mikrofonen. De fleste browsere spørger én gang pr. websted. Hvis du ved et uheld klikkede på Bloker, skal du slå det til igen manuelt: klik på lås- eller info-ikonet ved siden af gadit.app i adresselinjen, derefter Webstedsindstillinger, derefter Mikrofon, derefter Tillad.",
              "I Safari på iOS kræver mikrofonadgang også en kontakt under Indstillinger → Safari → Mikrofon. Stemme er i øjeblikket en Clear- og Deep-funktion: Basic-brugere ser en opfordring til at opgradere, besøgende, der ikke er logget ind, ser en opfordring til at logge ind.",
            ],
          },
          {
            id: "no-image",
            q: "Jeg kan ikke lave et billede til ordet.",
            a: [
              "Billedgenerering er en Clear- eller Deep-funktion med en månedlig kvote. Clear får 30 billeder om måneden, Deep får 100. Hvis du har brugt kvoten op, ser du en spærring. Den nulstilles den 1. i hver måned.",
              "Hvis du er under kvoten og stadig oplever fejl, er det som regel midlertidigt. Prøv igen om 30 sekunder. Vedvarende fejl er en fejl i systemet. Rapportér det venligst fra ordets side.",
            ],
          },
          {
            id: "save-word",
            q: "Hvordan gemmer jeg et ord i min notesbog?",
            a: [
              "På enhver resultatside for et ord trykker du på Gem i notesbog ved titlen. Notesbogen er en Clear- og Deep-funktion, hvor du senere kan gennemgå gemte ord, se dem i en galaksevisning og køre smarte øvesessioner (Deep).",
              "Ord, du har gemt og åbnet mindst én gang, er tilgængelige offline fra den lokale cache. Offlinepakken gemmer også de mest populære ord på dit sprog, så du er klar uden internet.",
            ],
          },
          {
            id: "offline",
            q: "Hvordan virker offlinetilstand?",
            a: [
              "Ord, du allerede har set, bliver gemt lokalt i cachen. Åbn dem igen uden internet, og de indlæses med det samme. Den fulde offlinepakke (de mest brugte ord på dit sprog) downloades efter behov fra notesbogssiden.",
              "At søge efter et helt nyt ord kræver stadig forbindelse, fordi Gadit skal lave definitionen fra bunden. Offlinecachen er til ord, du allerede har udforsket.",
            ],
          },
          {
            id: "slow",
            q: "Appen føles langsom.",
            a: [
              "Det første opslag af et ord er det langsomste, fordi Gadit laver hele resultatet fra bunden: som regel et par sekunder, nogle gange længere for komplekse ord. Senere opslag af samme ord er øjeblikkelige og hentes fra cachen.",
              "Hvis alt føles langsomt, så prøv en hård genindlæsning: Cmd+Shift+R på Mac, Ctrl+Shift+R på Windows. Hvis langsommeligheden fortsætter på tværs af sider, så send os en e-mail med dit land og din browser, så teamet kan tjekke netværksruten fra din region til vores servere.",
            ],
          },
          {
            id: "word-not-found",
            q: "Jeg søgte efter et ord og fik intet resultat. Hvad sker der?",
            a: [
              "Tjek først stavningen. Gadit klarer som regel mindre tastefejl, men en forkert vokal eller et manglende bogstav kan bringe den ud af kurs. Prøv den foreslåede rettelse, hvis der dukker en op.",
              "Derudover: meget sjældne ord eller slangord giver måske ikke et sikkert resultat. Hvis du er sikker på, at ordet findes, så klik på Rapportér-knappen på resultatsiden (eller på fejlskærmen), og giv os besked. Hver rapport bliver gennemgået, og ord, der reelt mangler, bliver ført tilbage i systemet.",
            ],
          },
          {
            id: "change-language",
            q: "Hvordan skifter jeg sprog i brugerfladen?",
            a: [
              "Øverst til højre på alle sider ser du et lille flagikon (eller navnet på dit nuværende sprog). Tryk på det, og vælg mellem 30+ sprog: engelsk, græsk, hebraisk, arabisk, russisk, spansk, portugisisk, fransk, tysk, tjekkisk, slovakisk, italiensk, japansk, hindi, amharisk, zulu.",
              "Dit valg bliver gemt på denne enhed. Alt indlæses igen på det nye sprog: brugerfladen, menuerne, fremtidige orddefinitioner, eksempler, børneforklaringer og endda etymologien. Resultater, der allerede ligger i cachen på det gamle sprog, bliver liggende, indtil du søger efter de ord igen.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Partnerprogram",
        items: [
          {
            id: "join-partner",
            q: "Hvordan bliver jeg Gadit-partner?",
            a: [
              "Åbn /partners fra en hvilken som helst side, og klik på \"Bliv partner\". Tilmeld dig med dit navn og din e-mail, så er dit unikke henvisningslink og et dashboard til at følge klik og provision klar med det samme. Ingen ventetid på godkendelse.",
              "Det er gratis at være med og åbent for alle. Du behøver ikke et Gadit-abonnement for at blive partner.",
            ],
          },
          {
            id: "commission-model",
            q: "Hvordan beregnes provisionen?",
            a: [
              "Standardvilkårene er 25% af hver betaling, en kunde foretager i sit første år. Efter det første år tjener du 10% af hver betaling, så længe kunden bliver ved med at betale.",
              "Det fungerer på samme måde for månedlige og årlige planer, fordi provisionen beregnes af hver faktisk betaling. Hvis en kunde opsiger, stopper din provision med kundens sidste betaling.",
              "Teamet kan fastsætte andre satser for bestemte partnere. Dine egne satser vises altid på dit partnerdashboard, som du kan nå fra /partners.",
            ],
          },
          {
            id: "payout",
            q: "Hvornår får jeg udbetaling?",
            a: [
              "Månedligt, når din saldo overstiger $50. Vi bruger den udbetalingsmetode, du har valgt på partnerdashboardet (bankoverførsel, PayPal og så videre). $50 er minimumsgrænsen, ikke et loft. Du kan tjene langt mere, du modtager bare udbetalingen, når du passerer grænsen.",
              "Provisionen frigives 30 dage efter abonnementsbetalingen for at give plads til refusionsperioden. Så et abonnement i januar frigives i starten af februar og lander i din næste udbetaling, når din saldo overstiger $50.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Jeg er tilmeldt, men mit dashboard er tomt.",
            a: [
              "Statistik vises efter det første klik på dit link. Tomt betyder bare, at ingen har klikket endnu. Gå ud og del linket. Dashboardet opdateres næsten i realtid, så snart der er aktivitet.",
              "Hvis du har delt linket, og nogen har tilmeldt sig, men dashboardet ikke viser det, så skriv til os med det omtrentlige tidspunkt for tilmeldingen, så tjekker teamet tilskrivningen.",
            ],
          },
          {
            id: "attribution-window",
            q: "Hvor længe sporer mit henvisningslink en besøgende?",
            a: [
              "Tres dage. Når en besøgende klikker på dit link, sætter vi en cookie, der identificerer dig som henviser. Hvis de tilmelder sig og tegner abonnement når som helst inden for de næste 60 dage (også selvom de forlader siden og vender tilbage senere via en Google-søgning), bliver det stadig tilskrevet dig.",
              "Sletning af cookies: hvis den besøgende sletter sine cookies eller skifter browser/enhed, før vedkommende tilmelder sig, kan tilskrivningen gå tabt. Det kan man ikke komme uden om, men 60 dage er en generøs periode sammenlignet med de fleste partnerprogrammer.",
            ],
          },
          {
            id: "missing-commission",
            q: "Nogen har tilmeldt sig via mit link, men jeg kan ikke se provisionen.",
            a: [
              "Oftest handler det om timing: tilmeldingen vises på dashboardet inden for få minutter, men provisionen bliver først bogført, når abonnementet faktisk er betalt (hvilket kan være dage senere, hvis de er på en gratis prøveperiode). Kig igen, når prøveperioden er slut.",
              "Hvis abonnementet er betalt, og du stadig ikke kan se provisionen efter 48 timer, så skriv til os med det omtrentlige tidspunkt for tilmeldingen og abonnentens e-mail eller omtrentlige navn, hvis du kender det. Teamet graver i tilskrivningskæden og retter manuelt eventuelle fejl.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Generelt",
        items: [
          {
            id: "what-is-gadit",
            q: "Hvad er Gadit?",
            a: [
              "En flersproget ordbog bygget til at få et ord til at falde på plads, ikke bare give en definition på én linje. Hvert ord åbner med alle dets betydninger, rigtige eksempler for hver betydning, idiomer, etymologi, et valgfrit billede og (med Clear og Deep) en børnevenlig forklaring, skriv din egen sætning og få feedback, samt quizzer.",
              "I øjeblikket 30+ sprog i brugerfladen. Internt kalder teamet det at GAD'e et ord: at forstå et ord helt til bunds, ikke bare oversætte det.",
            ],
          },
          {
            id: "languages",
            q: "Hvilke sprog understøtter I?",
            a: [
              "Brugerflade: engelsk, græsk, hebraisk, arabisk, russisk, spansk, portugisisk, fransk, tysk, tjekkisk, slovakisk, italiensk, japansk, zulu.",
              "Du kan slå et ord op på et hvilket som helst af disse sprog og få definitionen, eksemplerne og alt det andet på det sprog, du har valgt til brugerfladen. Hebraisk og arabisk vises fuldt ud fra højre mod venstre (RTL) og bruger deres egne skrifttyper.",
            ],
          },
          {
            id: "kid-safety",
            q: "Er Gadit sikker for børn?",
            a: [
              "Gadit er designet, så en forælder trygt kan bruge den sammen med et barn. Børnetilstand giver forklaringer, der er enkle, konkrete og alderssvarende (omkring niveauet for 5 til 10 år), med den samme motor, der driver indholdet for voksne, men med klare instruktioner om at forenkle. Brugergenereret indhold bliver aldrig vist for børn.",
              "I overensstemmelse med vores politikker og regler om børns privatliv verden over kræver selvstændigt ejerskab af en konto, at man er fyldt 13 år. Det almindelige mønster er en forælders konto, som forælderen bruger sammen med sit barn, og det er præcis det, børnetilstand er bygget til.",
            ],
          },
          {
            id: "data",
            q: "Hvor bliver mine data gemt? Sælger I dem?",
            a: [
              "Konto, historik, notesbog og genererede billeder bliver opbevaret sikkert i Firebase, krypteret i lageret. Vi sælger ikke dine data til nogen. Vi deler kun det, der er nødvendigt for at drive Gadit (lagring, betalinger, indholdsleverandører), som beskrevet i privatlivspolitikken.",
              "Du kan eksportere din notesbog eller slette din konto når som helst fra Konto-siden.",
            ],
          },
          {
            id: "contact-direct",
            q: "Hvordan kontakter jeg jer direkte?",
            a: [
              "Brug e-mail-knappen nederst på denne side. Den går direkte til teamets indbakke. Hver besked bliver læst og besvaret inden for 24 til 48 timer (ofte hurtigere).",
              "E-mail er bedre end chat til support: det giver teamet mulighed for at læse grundigt og svare gennemtænkt. Telefonsupport tilbydes ikke endnu.",
            ],
          },
        ],
      },
    ],
  },
  hu: {
    eyebrow: "Súgóközpont",
    heading: "Találd meg gyorsan a választ.",
    lede: "Gyakori kérdések és lépésről lépésre megoldások, témák szerint rendezve. Ha nem látod a problémádat, lent felveheted a kapcsolatot a csapattal.",
    stillNeedHelpHeading: "Még mindig elakadtál?",
    stillNeedHelpBody: "Írj nekünk közvetlenül. A csapat minden üzenetet elolvas, és egy-két napon belül válaszol.",
    emailCta: "Írj nekünk e-mailt",
    responseTime: "Szokásos válaszidő: 24-48 órán belül.",
    categories: [
      {
        id: "billing",
        icon: "💳",
        title: "Számlázás és előfizetés",
        items: [
          {
            id: "change-card",
            q: "Hogyan cserélhetem le a bankkártyát az előfizetésemen?",
            a: [
              "Kevesebb mint egy perc alatt átválthatsz egy új kártyára, lemondás nélkül. A jelenlegi előfizetésed tovább fut, csak az új kártyáról.",
              "1. Jelentkezz be a gadit.app oldalon, és nyisd meg a Fiók oldalt (jobb felső sarok). 2. Kattints a \"Számlázás kezelése\" gombra. 3. Megnyílik egy biztonságos Stripe-oldal. Kattints a \"Fizetési mód hozzáadása\" gombra, add meg az új kártyát, és jelöld meg alapértelmezettként. 4. Ha szeretnéd, töröld a régi kártyát.",
              "A következő számlázási ciklustól minden az új kártyára megy. Az előző terhelés (amelyet már levontunk) a régi kártyán marad. Visszatérítésre nincs szükség, hacsak kifejezetten nem kérsz egyet.",
            ],
          },
          {
            id: "cancel",
            q: "Hogyan mondhatom le az előfizetésemet?",
            a: [
              "Saját magad, bármikor. Jelentkezz be, nyisd meg a Fiók oldalt, és koppints a csomagod alatti Előfizetés lemondása gombra.",
              "A hozzáférésed a már kifizetett időszak végéig megmarad. Ezután a fiók visszaáll Basic (ingyenes) csomagra. A mentett szavaid, az előzményeid és a füzeted biztonságban és elérhetők maradnak.",
              "Ha véletlenül mondtad le, vagy meggondoltad magad, az időszak vége előtt ugyanazon az oldalon folytathatod az előfizetést.",
            ],
          },
          {
            id: "switch-plan",
            q: "Hogyan válthatok Clear csomagról Deep csomagra (vagy fordítva)?",
            a: [
              "Fiók, majd Számlázás kezelése, majd Előfizetés módosítása. Válaszd ki az új csomagot.",
              "A Stripe automatikusan kiszámítja az árkülönbözetet, az aktuális időszakból hátralévő napok arányában. Ha magasabb csomagra váltasz, csak a különbözetet terheljük az időszak hátralévő részére. Ha alacsonyabb szintre váltasz, a jóváírás a következő számládon érvényesül.",
            ],
          },
          {
            id: "invoice",
            q: "Hogyan tölthetek le számlát vagy nyugtát?",
            a: [
              "Fiók, majd Számlázás kezelése, majd Számlaelőzmények. Minden terheléshez tartozik egy letölthető PDF-nyugta a mentett számlázási adataiddal.",
              "Ha más névre, címre vagy adószámra van szükséged a számlán (például cégnévre adózási célból), letöltés előtt frissítsd a számlázási adataidat ugyanazon az oldalon. A következő nyugta már az új adatokkal készül.",
            ],
          },
          {
            id: "portal-error",
            q: "A Számlázás kezelése gombra kattintottam, de hibát kaptam. Most mi legyen?",
            a: [
              "Két gyakori ok van. Az első, hogy a fiókodhoz nem tartozik aktív Stripe-előfizetés. A második, hogy a Stripe-nál talán még nincs teljes számlázási profil a fiókodhoz.",
              "Egyszerű első lépés: jelentkezz ki, jelentkezz be újra azzal az e-mail-címmel, amelyet a fizetésnél használtál, és próbáld újra. Ha még mindig nem működik, írj nekünk a fiókod e-mail-címével, és a csapat egy perc alatt kijavítja a mi oldalunkon.",
            ],
          },
          {
            id: "autorenew",
            q: "Automatikusan megújul az előfizetésem?",
            a: [
              "Igen. A havi csomagok minden hónapban, az éves csomagok minden évben ugyanazon a napon újulnak meg. A következő számlázási dátumot a fiókodban és a Stripe portálján is láthatod.",
              "Ha nem szeretnéd az automatikus megújítást, a megújítás dátuma előtt bármikor lemondhatod. A lemondás nem azonnali. A már kifizetett időszak végéig megtartod a hozzáférést.",
            ],
          },
          {
            id: "refund",
            q: "Kérhetek visszatérítést?",
            a: [
              "Igen. Ha a vásárlás kevesebb mint 14 napja történt, és a szolgáltatást még nem nagyon használtad, írj nekünk a fiókod e-mail-címével és pár sorban az okáról. Ezeket a visszatérítéseket vita nélkül jóváhagyjuk.",
              "Ha több mint 14 nap telt el, a csapat esetről esetre dönt. Mondd le az előfizetést, hogy ne újuljon meg tovább, és írj nekünk e-mailt.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Olyan terhelést látok, amelyet nem ismerek fel.",
            a: [
              "A terhelések GADIT vagy GADIT.APP néven jelennek meg, $2.99 (Clear havi), $4.99 (Deep havi), $29.99 (Clear éves) vagy $49.99 (Deep éves) összeggel. Ha nem egyezik, lehet, hogy egy másik szolgáltatástól származik.",
              "Ha biztos vagy benne, hogy nem a tiéd, még ne indíts reklamációt a bankodnál. Először írj nekünk közvetlenül a dátummal és az összeggel. A csapat megkeresi, elmagyarázza, mi ez, és szükség esetén visszatéríti. A banki reklamáció megnehezítheti a későbbi számlázást, ezért az ügyfélszolgálaton keresztüli rendezés általában gyorsabb és biztonságosabb.",
            ],
          },
          {
            id: "failed-payment",
            q: "Sikertelen volt a fizetésem. Mit tegyek?",
            a: [
              "A Stripe a következő napokban automatikusan többször újrapróbálja a sikertelen fizetéseket. A legtöbb hiba magától megoldódik, amint a bank feloldja a zárolást, vagy elegendő egyenleg lesz a kártyán.",
              "Ha azonnal rendezni szeretnéd, menj a Fiók → Számlázás kezelése → Fizetési mód hozzáadása menüpontra, adj meg egy működő kártyát, és állítsd be alapértelmezettként. A Stripe azonnal újrapróbálja a sikertelen terhelést az új kártyán. Ha az előfizetésed már visszaesett Basic csomagra, az Árak oldalon újra előfizethetsz, és a füzeted érintetlen marad.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Mi a különbség a Basic, a Clear és a Deep között?",
            a: [
              "Basic (ingyenes): naponta legfeljebb 20 szókeresés, minden jelentés, példák minden jelentéshez, szólások és a szó eredete. Az alapkeresésekhez nem kell regisztrálni.",
              "Clear ($2.99/hó vagy $29.99/év): korlátlan keresés, gyerekbarát magyarázatok, egy kép szavanként (30/hó), saját mondat írása visszajelzéssel, részletes szólások és 30 napnyi keresési előzmény.",
              "Deep ($4.99/hó vagy $49.99/év): minden, ami a Clear csomagban, plusz gyakorló kvízek, a személyes füzet okos, időközönkénti ismétléses gyakorlással, a hasonló szavak megkülönböztetése és nagyobb képkeret (100/hó).",
            ],
          },
        ],
      },
      {
        id: "account",
        icon: "👤",
        title: "Fiók és bejelentkezés",
        items: [
          {
            id: "no-verification-email",
            q: "Nem kaptam meg a megerősítő e-mailt.",
            a: [
              "Először nézd meg a spam és a promóciók mappát. A Gmail és az Outlook néha oda irányítja a fiókkal kapcsolatos e-maileket, amíg egyet meg nem jelölsz \"Nem spam\" címkével.",
              "Ha ott sincs, lehet, hogy regisztrációkor elgépelted az e-mail-címet. Próbálj meg újra regisztrálni, és ellenőrizd alaposan a címet. Ha Google-fiókkal regisztráltál, nincs szükség megerősítő e-mailre.",
            ],
          },
          {
            id: "forgot-password",
            q: "Elfelejtettem a jelszavamat.",
            a: [
              "Nyisd meg a bejelentkezési ablakot, és kattints az \"Elfelejtetted a jelszavad?\" lehetőségre. Add meg a Gadithoz használt e-mail-címedet, és egy-két percen belül megkapod a visszaállító linket.",
              "Ha az e-mail nem érkezik meg, nézd meg a spam mappát. Ha még mindig nem jön, lehet, hogy Google-lel regisztráltál, nem e-maillel és jelszóval. Próbáld a \"Folytatás Google-lel\" gombot.",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Biztos vagyok benne, hogy jó a jelszavam, mégis azt írja: \"Hibás e-mail-cím vagy jelszó\".",
            a: [
              "Három dolgot érdemes ellenőrizni. Először a Caps Lockot. Másodszor a végén maradt szóközt másolás és beillesztés után. Harmadszor azt, hogy nem jelszóval, hanem Google-lel regisztráltál-e (ilyenkor használd a \"Folytatás Google-lel\" gombot).",
              "Még mindig nem megy? Állítsd vissza a jelszót ugyanabban az ablakban. Így tisztán indulhatsz újra.",
            ],
          },
          {
            id: "google-fails",
            q: "Nem működik a Google-bejelentkezés.",
            a: [
              "A leggyakoribb ok: a böngésződ letiltja a harmadik féltől származó sütiket vagy a felugró ablakokat a gadit.app számára. Engedélyezd őket a címsor engedélyeinél, és próbáld újra.",
              "Inkognitó módban a Google-bejelentkezés szándékosan korlátozott. Válts normál böngészőablakra.",
            ],
          },
          {
            id: "change-email",
            q: "Hogyan változtathatom meg a fiókom e-mail-címét?",
            a: [
              "Fiók, kattints az e-mail-címedre, majd E-mail-cím módosítása. Az új címet meg kell erősítened, mielőtt életbe lép. Az előfizetésed, az előzményeid és a füzeted mind átkerülnek.",
              "Ha az e-mail-cím egy Stripe-ügyfélhez tartozik, a Stripe számlázási portálján is frissítsd, hogy a jövőbeli nyugták az új címre érkezzenek.",
            ],
          },
          {
            id: "delete-account",
            q: "Hogyan törölhetem a fiókomat?",
            a: [
              "Fiók, az oldal alján Fiók törlése. Ez végleges. Az előfizetésedet lemondjuk, a füzetedet és az előzményeidet töröljük, az e-mail-cím pedig felszabadul egy új regisztrációhoz.",
              "A korábbi terhelések Stripe-nyilvántartása megmarad (a törvény előírja, hogy könyvelési célból megőrizzük). Semmi más nem marad meg.",
            ],
          },
          {
            id: "share-account",
            q: "Használhatja a társam vagy a gyerekem is a fiókomat?",
            a: [
              "Egy fiókba egyszerre egy felhasználó lehet bejelentkezve. A Gyerek mód lehetővé teszi, hogy egyetlen Clear vagy Deep fiók egy szülőt és egy gyereket is kiszolgáljon: kapcsold be a kapcsolót, és a definíciók gyerekbarát formában jelennek meg, külön bejelentkezés nélkül.",
              "Ha két felnőtt külön füzetet és saját haladást szeretne, hozzatok létre két fiókot. A Clear ára fiókonként havi $2.99.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Azt hiszem, véletlenül két fiókom van. Most mi legyen?",
            a: [
              "Ez általában akkor fordul elő, ha valaki ugyanazzal a címmel egyszer Google-lel, egyszer pedig e-maillel és jelszóval regisztrál, vagy ha kétszer regisztrálsz két különböző e-mail-címmel. Minden regisztráció külön Gadit-fiókot hoz létre saját füzettel, előzményekkel és előfizetési állapottal.",
              "Írj nekünk mindkét e-mail-címmel (vagy a Fiók oldalon látható UID-kkal), és azzal, hogy melyiket szeretnéd megtartani. A csapat összevonja a füzeteket és az előzményeket a választott fiókba, majd rendben lezárja a másikat. Semmilyen adat nem vész el.",
            ],
          },
        ],
      },
      {
        id: "product",
        icon: "🔍",
        title: "A Gadit használata",
        items: [
          {
            id: "wrong-definition",
            q: "Szerintem hibás a definíció. Mit tegyek?",
            a: [
              "Minden találati oldal alján van egy kis \"Hibajelentés\" gomb. Koppints rá, válassz kategóriát (definíció, etimológia, példa, szólás, gyerekmagyarázat és így tovább), és írj egy rövid megjegyzést. Egyenesen a csapathoz kerül, és minden jelentést átnézünk.",
              "Ne aggódj, hogy túl szőrszálhasogató vagy. A szótár ebből a visszajelzésből gyorsabban fejlődik, mint bármi másból.",
            ],
          },
          {
            id: "kids-not-working",
            q: "A Gyerek mód nem változtatja meg a magyarázatot.",
            a: [
              "A Gyerek mód csak akkor cseréli a szöveget, ha a szóhoz már elkészült a gyerekbarát magyarázat. A vadonatúj szavaknál, amelyeket épp most kerestél ki, adj neki 10-15 másodpercet. A gyerekbarát változat az első alkalommal menet közben készül el.",
              "Továbbá: a Gyerek módhoz Clear vagy Deep csomag kell. Ha Basic csomagot használsz, a kapcsoló frissítést ajánl fel. A bejelentkezés nélküli felhasználókat regisztrációra kérjük.",
            ],
          },
          {
            id: "voice-fails",
            q: "Nem működik a hangalapú keresés.",
            a: [
              "A hangalapú kereséshez mikrofonengedély kell. A legtöbb böngésző oldalanként egyszer kérdez rá. Ha véletlenül a Letiltás gombra kattintottál, kézzel kell visszakapcsolnod: kattints a lakat vagy az információ ikonra a címsorban a gadit.app mellett, majd Webhelybeállítások, majd Mikrofon, majd Engedélyezés.",
              "Safari iOS-en a mikrofonhozzáféréshez a Beállítások → Safari → Mikrofon kapcsolót is be kell kapcsolni. A hang jelenleg a Clear és a Deep csomag funkciója: a Basic felhasználók frissítési ajánlatot látnak, a kijelentkezett látogatók pedig bejelentkezési felszólítást.",
            ],
          },
          {
            id: "no-image",
            q: "Nem tudok képet készíteni a szóhoz.",
            a: [
              "A képkészítés a Clear és a Deep csomag funkciója, havi kerettel. A Clear havi 30 képet kap, a Deep 100-at. Ha elhasználtad a keretet, egy korlátozó üzenetet látsz. A keret minden hónap 1-jén nullázódik.",
              "Ha még a kereten belül vagy, és mégis hibát látsz, az általában átmeneti. Próbáld újra 30 másodperc múlva. A tartós hiba programhiba. Kérjük, jelentsd a szó oldaláról.",
            ],
          },
          {
            id: "save-word",
            q: "Hogyan menthetek el egy szót a füzetembe?",
            a: [
              "Bármelyik szó találati oldalán koppints a cím melletti Mentés a füzetbe gombra. A füzet a Clear és a Deep csomag funkciója, ahol később átnézheted a mentett szavakat, galaxisnézetben láthatod őket, és okos gyakorlásokat indíthatsz (Deep).",
              "Azok a szavak, amelyeket elmentettél és legalább egyszer megnyitottál, offline is elérhetők a helyi gyorsítótárból. Az offline csomag a nyelved legnépszerűbb szavait is eltárolja, így internet nélkül is készen állsz.",
            ],
          },
          {
            id: "offline",
            q: "Hogyan működik az offline mód?",
            a: [
              "A már megtekintett szavak a helyi gyorsítótárba kerülnek. Ha internet nélkül újra megnyitod őket, azonnal betöltődnek. A teljes offline csomag (a nyelved leggyakoribb szavai) igény szerint letölthető a füzet oldaláról.",
              "Egy vadonatúj szó kereséséhez továbbra is internetkapcsolat kell, mert a Gaditnak a nulláról kell elkészítenie a definíciót. Az offline gyorsítótár a már felfedezett szavakhoz való.",
            ],
          },
          {
            id: "slow",
            q: "Lassúnak tűnik az alkalmazás.",
            a: [
              "Egy szó első keresése a leglassabb, mert a Gadit a nulláról készíti el a teljes találatot: általában néhány másodperc, összetett szavaknál néha több. Ugyanannak a szónak a későbbi keresései azonnaliak, a gyorsítótárból jönnek.",
              "Ha minden lassúnak tűnik, próbálj meg egy teljes frissítést: Cmd+Shift+R Macen, Ctrl+Shift+R Windowson. Ha a lassúság több oldalon is megmarad, írj nekünk e-mailt az országoddal és a böngésződdel, hogy a csapat ellenőrizhesse a hálózati útvonalat a régiódból a szervereinkig.",
            ],
          },
          {
            id: "word-not-found",
            q: "Rákerestem egy szóra, de nem kaptam találatot. Mi történik?",
            a: [
              "Először ellenőrizd a helyesírást. A Gadit a kisebb elírásokat többnyire kezeli, de egy rossz magánhangzó vagy egy hiányzó betű megzavarhatja. Ha megjelenik javasolt javítás, próbáld ki.",
              "Ezen túl: a nagyon ritka vagy szleng szavakra nem mindig születik megbízható találat. Ha biztos vagy benne, hogy a szó létezik, kattints a Hibajelentés gombra a találati oldalon (vagy a hibaképernyőn), és szólj nekünk. Minden jelentést átnézünk, és a valóban hiányzó szavakat visszavezetjük a rendszerbe.",
            ],
          },
          {
            id: "change-language",
            q: "Hogyan változtathatom meg a felület nyelvét?",
            a: [
              "Bármelyik oldal jobb felső sarkában látsz egy kis zászló ikont (vagy a jelenlegi nyelved nevét). Koppints rá, és válassz a több mint 30 nyelv közül: angol, görög, héber, arab, orosz, spanyol, portugál, francia, német, cseh, szlovák, olasz, japán, hindi, amhara, zulu.",
              "A választásod ezen az eszközön mentődik el. Minden újratöltődik az új nyelven: a felület, a menük, a jövőbeli szódefiníciók, a példák, a gyerekmagyarázatok, sőt az etimológia is. A régi nyelven már gyorsítótárazott találatok megmaradnak, amíg újra rá nem keresel azokra a szavakra.",
            ],
          },
        ],
      },
      {
        id: "partner",
        icon: "🤝",
        title: "Partnerprogram",
        items: [
          {
            id: "join-partner",
            q: "Hogyan lehetek Gadit-partner?",
            a: [
              "Bármelyik oldalról nyisd meg a /partners oldalt, és kattints a \"Legyél partner\" gombra. Regisztrálj a neveddel és az e-mail-címeddel, és az egyedi ajánlói linked, valamint egy irányítópult a kattintások és jutalékok követésére azonnal elkészül. Nincs várakozás jóváhagyásra.",
              "A csatlakozás ingyenes, és bárki számára nyitott. Nem kell Gadit-előfizetés ahhoz, hogy partner legyél.",
            ],
          },
          {
            id: "commission-model",
            q: "Hogyan számítjuk a jutalékot?",
            a: [
              "A szokásos feltétel az, hogy az ügyfél első évében tett minden fizetésének 25%-át kapod. Az első év után minden fizetés 10%-át kapod, amíg az ügyfél fizet.",
              "Ez a havi és az éves csomagoknál is ugyanígy működik, mert a jutalékot minden tényleges fizetés után számoljuk. Ha az ügyfél lemondja az előfizetést, a jutalékod az utolsó fizetésével megszűnik.",
              "A csapat egyes partnereknek eltérő mértéket is megállapíthat. A saját mértékeid mindig megjelennek a partner-irányítópultodon, amelyet a /partners oldalról érhetsz el.",
            ],
          },
          {
            id: "payout",
            q: "Mikor kapok kifizetést?",
            a: [
              "Havonta, amint az egyenleged meghaladja az $50-t. A partner-irányítópulton beállított kifizetési módot használjuk (banki átutalás, PayPal és így tovább). Az $50 a minimális küszöb, nem felső határ. Sokkal többet is kereshetsz, csak a kifizetést akkor kapod meg, amikor átléped a küszöböt.",
              "A jutalékok 30 nappal az előfizetési fizetés után szabadulnak fel, hogy legyen idő a visszatérítési időszakra. Így egy januári előfizetés jutaléka február elején szabadul fel, és a következő kifizetésedbe kerül, amint az egyenleged meghaladja az $50-t.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Csatlakoztam, de üres az irányítópultom.",
            a: [
              "A statisztikák a linkedre érkező első kattintás után jelennek meg. Az üres irányítópult csak annyit jelent, hogy még senki nem kattintott. Oszd meg a linket. Amint elindul az aktivitás, az irányítópult szinte valós időben frissül.",
              "Ha már megosztottad, és valaki regisztrált, de az irányítópult nem mutatja, írj nekünk a regisztráció hozzávetőleges időpontjával, és a csapat ellenőrzi a hozzárendelést.",
            ],
          },
          {
            id: "attribution-window",
            q: "Mennyi ideig követi az ajánlói linkem a látogatót?",
            a: [
              "Hatvan napig. Amikor egy látogató a linkedre kattint, beállítunk egy sütit, amely téged azonosít ajánlóként. Ha a következő 60 napban bármikor regisztrál és előfizet (akkor is, ha elhagyja az oldalt, és később egy Google-keresésen keresztül tér vissza), azt továbbra is neked számítjuk be.",
              "Sütik törlése: ha a látogató a regisztráció előtt törli a sütijeit, vagy böngészőt/eszközt vált, a hozzárendelés elveszhet. Erre nincs megoldás, de a 60 nap a legtöbb partnerprogramhoz képest bőkezű időszak.",
            ],
          },
          {
            id: "missing-commission",
            q: "Valaki a linkemen keresztül regisztrált, de nem látom a jutalékot.",
            a: [
              "Legtöbbször időzítésről van szó: a regisztráció perceken belül megjelenik az irányítópulton, de a jutalék csak akkor kerül könyvelésre, amikor az előfizetést ténylegesen kifizetik (ami napokkal később is lehet, ha ingyenes próbaidőszakot használnak). Nézz vissza a próbaidőszak vége után.",
              "Ha az előfizetést kifizették, de 48 óra után sem látod a jutalékot, írj nekünk a regisztráció hozzávetőleges időpontjával, valamint az előfizető e-mail-címével vagy hozzávetőleges nevével, ha tudod. A csapat utánajár a hozzárendelési láncnak, és kézzel pótol minden kimaradást.",
            ],
          },
        ],
      },
      {
        id: "general",
        icon: "❓",
        title: "Általános",
        items: [
          {
            id: "what-is-gadit",
            q: "Mi az a Gadit?",
            a: [
              "Egy többnyelvű szótár, amely arra készült, hogy egy szó tényleg a helyére kerüljön, ne csak egy egysoros definíciót adjon. Minden szó az összes jelentésével nyílik meg, valódi példákkal minden jelentéshez, szólásokkal, etimológiával, egy választható képpel, és (a Clear és a Deep csomaggal) gyerekbarát magyarázattal, saját mondat írásával és visszajelzéssel, valamint kvízekkel.",
              "Jelenleg több mint 30 felületi nyelv. A csapaton belül ezt úgy hívjuk, hogy GAD-olni egy szót: a szót egészen a mélyéig megérteni, nem csak lefordítani.",
            ],
          },
          {
            id: "languages",
            q: "Milyen nyelveket támogattok?",
            a: [
              "Felület: angol, görög, héber, arab, orosz, spanyol, portugál, francia, német, cseh, szlovák, olasz, japán, zulu.",
              "Bármelyik nyelven kikereshetsz egy szót, és a definíciót, a példákat és minden mást a választott felületi nyelven kapod meg. A héber és az arab teljesen jobbról balra (RTL) jelenik meg, és a saját betűtípusaikat használja.",
            ],
          },
          {
            id: "kid-safety",
            q: "Biztonságos a Gadit gyerekeknek?",
            a: [
              "A Gadit úgy készült, hogy a szülő biztonságosan használhassa a gyerekével együtt. A Gyerek mód egyszerű, konkrét és életkornak megfelelő magyarázatokat ad (nagyjából 5-10 éves szinten), ugyanazzal a motorral, amely a felnőtt tartalmat is készíti, de kifejezett utasítással az egyszerűsítésre. Felhasználók által létrehozott tartalom soha nem jelenik meg a gyerekeknek.",
              "Irányelveinkkel és a világszerte érvényes gyermekadatvédelmi szabályokkal összhangban önálló fiókot 13 éves kortól lehet birtokolni. A szokásos megoldás egy szülői fiók, amelyet a szülő a gyerekével együtt használ, és pontosan erre készült a Gyerek mód.",
            ],
          },
          {
            id: "data",
            q: "Hol tároljátok az adataimat? Eladjátok őket?",
            a: [
              "A fiók, az előzmények, a füzet és a létrehozott képek biztonságosan, titkosítva tárolódnak a Firebase-ben. Az adataidat senkinek nem adjuk el. Csak azt osztjuk meg, ami a Gadit működtetéséhez szükséges (tárolás, fizetés, tartalomszolgáltatók), ahogy az Adatvédelmi szabályzat részletezi.",
              "A füzetedet bármikor exportálhatod, vagy törölheted a fiókodat a Fiók oldalon.",
            ],
          },
          {
            id: "contact-direct",
            q: "Hogyan érhetlek el benneteket közvetlenül?",
            a: [
              "Használd az oldal alján lévő e-mail gombot. Egyenesen a csapat postafiókjába érkezik. Minden üzenetet elolvasunk, és 24-48 órán belül válaszolunk (gyakran hamarabb).",
              "Támogatáshoz az e-mail jobb, mint a chat: lehetőséget ad a csapatnak, hogy figyelmesen elolvassa, és átgondoltan válaszoljon. Telefonos támogatást egyelőre nem kínálunk.",
            ],
          },
        ],
      },
    ],
  },
};
