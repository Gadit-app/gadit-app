import type { HelpContent } from "./help-i18n";
import type { Lang } from "./i18n";

/** Help Center in vi, fil, af, sw, da, hu (2026-10-10 i18n sweep). Same ids, order and meaning as the English block in help-i18n.ts. */
export const HELP_MORE_4: Partial<Record<Lang, HelpContent>> = {
  vi: {
    eyebrow: "Trung tâm trợ giúp",
    heading: "Tìm câu trả lời thật nhanh",
    lede: "Các câu hỏi thường gặp và cách khắc phục từng bước, sắp xếp theo chủ đề. Nếu bạn không thấy vấn đề của mình, hãy liên hệ với đội ngũ ở cuối trang.",
    stillNeedHelpHeading: "Vẫn chưa giải quyết được?",
    stillNeedHelpBody: "Hãy viết trực tiếp cho chúng tôi. Mọi tin nhắn đều được đội ngũ đọc và thường được trả lời trong vòng một hoặc hai ngày.",
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
              "Bạn có thể chuyển sang thẻ mới trong chưa đầy một phút mà không cần hủy. Gói đăng ký hiện tại của bạn vẫn tiếp tục, chỉ là chuyển sang thẻ mới.",
              "1. Đăng nhập tại gadit.app và mở \"Tài khoản\" từ menu tài khoản. 2. Nhấn \"Quản lý thanh toán\". 3. Một trang Stripe bảo mật sẽ mở ra. Hãy thêm thẻ mới làm phương thức thanh toán và đặt làm mặc định. 4. Nếu muốn, bạn có thể xóa thẻ cũ.",
              "Từ kỳ thanh toán tiếp theo trở đi, mọi khoản phí sẽ được tính vào thẻ mới. Khoản thanh toán trước đó, đã thu rồi, vẫn nằm trên thẻ cũ. Việc đổi thẻ không chuyển khoản phí đó và cũng không thay đổi ngày thanh toán tiếp theo của bạn.",
            ],
          },
          {
            id: "cancel",
            q: "Làm sao để hủy gói đăng ký?",
            a: [
              "Bạn tự làm được, bất cứ lúc nào. Đăng nhập, mở Tài khoản và nhấn Hủy gói đăng ký dưới gói của bạn.",
              "Nếu bạn mua gói đăng ký trong ứng dụng trên iPhone hoặc iPad, hãy hủy trong phần cài đặt gói đăng ký của Apple. Liên kết \"Quản lý gói đăng ký\" trên trang Tài khoản sẽ đưa bạn tới đó.",
              "Với gói trả phí, bạn vẫn được sử dụng đến hết kỳ đã thanh toán. Sau đó tài khoản chuyển về Basic, miễn phí. Các từ đã lưu và lịch sử của bạn vẫn được giữ an toàn.",
              "Trong 14 ngày dùng thử miễn phí, việc hủy sẽ kết thúc bản dùng thử ngay lập tức và bạn sẽ không bị tính phí gì. Nếu điều bạn lo chỉ là khoản phí tự động, hãy chọn lý do đó trong cửa sổ hủy, khi đó bạn có thể tắt gia hạn thay vì hủy, và vẫn giữ bản dùng thử đến ngày cuối cùng.",
              "Nếu bạn lỡ hủy gói trả phí hoặc đổi ý, bạn có thể tiếp tục lại từ chính trang đó trước khi kỳ hiện tại kết thúc.",
            ],
          },
          {
            id: "switch-plan",
            q: "Làm sao để chuyển giữa Individual và Family?",
            a: [
              "Để chuyển sang Family, hãy mở trang Tài khoản và nhấn \"Chuyển sang gói Family\". Gói đăng ký hiện tại của bạn được cập nhật trên cùng thẻ, không cần nhập lại.",
              "Stripe tính phần chênh lệch theo số ngày còn lại của kỳ hiện tại, nên bạn chỉ trả phần chênh lệch. Để chuyển từ Family về Individual, hãy viết cho chúng tôi từ trang này và đội ngũ sẽ chuyển giúp bạn.",
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
              "Có, trong vòng 14 ngày kể từ khoản thanh toán đầu tiên trên tài khoản của bạn, hoặc từ lần gia hạn năm. Hãy viết tới support@gadit.app từ địa chỉ email của tài khoản, và chúng tôi sẽ hoàn lại toàn bộ khoản thanh toán đó. Bạn không cần nêu lý do. Việc hoàn tiền cũng sẽ chấm dứt gói đăng ký, và tiền sẽ được trả về thẻ bạn đã dùng để thanh toán, thường trong vòng 5 đến 10 ngày làm việc.",
              "Sau 14 ngày, các khoản thanh toán sẽ không được hoàn lại, trừ khi bạn bị tính phí nhầm hoặc luật nơi bạn sống yêu cầu điều đó. Bạn có thể hủy bất kỳ lúc nào để gói đăng ký không gia hạn nữa, và vẫn tiếp tục dùng đến hết thời hạn bạn đã thanh toán.",
              "Mua trong ứng dụng trên iPhone hoặc iPad? Apple xử lý các khoản hoàn tiền đó tại reportaproblem.apple.com.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Khoản phí này trên thẻ của tôi là gì?",
            a: [
              "Các khoản phí hiển thị là GADIT hoặc GADIT.APP. Số tiền khớp với gói của bạn (Individual hoặc Family, hằng tháng hoặc hằng năm) bằng đơn vị tiền tệ của quốc gia bạn, như trên trang bảng giá. Các gói đăng ký bắt đầu trước tháng 10 năm 2026 vẫn giữ mức giá ban đầu. Nếu số tiền không khớp, có thể đó là khoản phí từ một dịch vụ khác.",
              "Nếu bạn chắc chắn đó không phải khoản phí của mình, đừng vội khiếu nại qua ngân hàng. Hãy viết trực tiếp cho chúng tôi trước, kèm ngày và số tiền. Đội ngũ sẽ tìm ra khoản phí, giải thích đó là gì và hoàn tiền nếu cần. Khiếu nại qua ngân hàng có thể khiến việc thanh toán sau này khó khăn hơn, nên giải quyết qua bộ phận hỗ trợ thường nhanh và an toàn hơn.",
            ],
          },
          {
            id: "failed-payment",
            q: "Thanh toán của tôi bị thất bại. Tôi nên làm gì?",
            a: [
              "Stripe sẽ tự động thử lại các khoản thanh toán thất bại vài lần trong những ngày tiếp theo. Phần lớn trường hợp sẽ tự được giải quyết khi ngân hàng gỡ giữ tiền hoặc thẻ có đủ số dư.",
              "Một thanh thông báo ở đầu trang sẽ cho biết khoản thanh toán chưa thành công, và quyền truy cập của bạn vẫn được giữ thêm vài ngày. Hãy nhấn \"Cập nhật thẻ\" ở đó, nhập một thẻ dùng được, và chúng tôi sẽ thử thanh toán ngay trên thẻ đó. Nếu gói đăng ký của bạn đã chuyển về Basic, bạn có thể đăng ký lại từ trang Bảng giá và sổ tay của bạn vẫn còn nguyên.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Basic, Individual và Family khác nhau thế nào?",
            a: [
              "Basic (miễn phí): tối đa 10 lượt tra từ mỗi ngày, mọi nghĩa, ví dụ, thành ngữ, nguồn gốc của từ, nghĩa đúng theo câu và sổ tay tối đa 30 từ.",
              "Individual: cho một người, đủ mọi công cụ học. Tra cứu không giới hạn, hình ảnh cho mọi nghĩa, thêm ví dụ và câu hỏi cho mọi từ, đặt câu và nhận nhận xét, Mọi từ, Nói thử, giọng đọc tự nhiên và tìm kiếm bằng giọng nói, dùng ngoại tuyến, trò chơi, câu đố và đấu từ, cùng luyện tập thông minh với ôn thi và chính tả.",
              "Family: mọi thứ trong Individual cho tối đa 5 trẻ em và cha mẹ, thêm chế độ trẻ em, không gian riêng cho từng trẻ, hỗ trợ bài tập về nhà và bảng điều khiển cho phụ huynh với thông báo cho mỗi từ. Trường học có gói riêng. Giá cho quốc gia của bạn và 14 ngày dùng thử miễn phí có trên trang bảng giá.",
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
            q: "Tôi không nhận được email xác minh",
            a: [
              "Trước tiên hãy kiểm tra thư mục spam và quảng cáo. Gmail và Outlook đôi khi chuyển email tài khoản vào đó cho đến khi bạn đánh dấu một email là \"Không phải spam\".",
              "Nếu không có ở đó, có thể email đã bị gõ sai khi đăng ký. Hãy thử đăng ký lại và kiểm tra kỹ địa chỉ. Nếu bạn đăng ký bằng Google thì không cần email xác minh.",
            ],
          },
          {
            id: "forgot-password",
            q: "Tôi quên mật khẩu",
            a: [
              "Trong cửa sổ đăng nhập, nhập email của bạn rồi nhấn \"Quên mật khẩu?\". Liên kết đặt lại thường sẽ đến hộp thư của bạn trong vòng một hoặc hai phút. Bạn cũng có thể nhấn \"Gửi cho tôi liên kết đăng nhập qua email\" để đăng nhập mà không cần mật khẩu.",
              "Nếu email không đến, hãy kiểm tra thư mục spam. Nếu vẫn không thấy, có thể bạn đã đăng ký bằng Google thay vì email và mật khẩu. Hãy thử nút \"Tiếp tục với Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Tôi chắc chắn mật khẩu đúng nhưng hệ thống báo \"Sai email hoặc mật khẩu\"",
            a: [
              "Có ba điều cần kiểm tra. Thứ nhất, phím Caps Lock. Thứ hai, khoảng trắng thừa ở cuối sau khi sao chép và dán. Thứ ba, có thể bạn đã đăng ký bằng Google chứ không phải bằng mật khẩu, lúc đó hãy dùng \"Tiếp tục với Google\".",
              "Vẫn chưa được? Trong chính thông báo đó, hãy nhấn \"Gửi cho tôi liên kết đăng nhập qua email\" để vào mà không cần mật khẩu, hoặc \"Chọn mật khẩu mới\".",
            ],
          },
          {
            id: "google-fails",
            q: "Đăng nhập bằng Google không hoạt động",
            a: [
              "Bên trong các ứng dụng như Instagram, Facebook hoặc TikTok, nút Google sẽ bị ẩn. Hãy mở liên kết trong trình duyệt thông thường của bạn, hoặc đăng nhập bằng email. Nếu bạn đã đăng ký bằng Google, hãy nhập đúng email đó và nhấn \"Gửi cho tôi liên kết đăng nhập qua email\".",
              "Trong cửa sổ riêng tư, chặn cookie có thể khiến đăng nhập bằng Google không hoạt động, nên hãy thử bằng cửa sổ bình thường.",
            ],
          },
          {
            id: "change-email",
            q: "Làm sao để thay đổi email của tài khoản?",
            a: [
              "Việc đổi email tài khoản sẽ do đội ngũ thực hiện. Hãy gửi email cho chúng tôi từ địa chỉ hiện tại của bạn và ghi địa chỉ mới trong thư. Đội ngũ sẽ cập nhật giúp bạn, còn gói đăng ký, lịch sử và sổ tay vẫn giữ nguyên.",
            ],
          },
          {
            id: "delete-account",
            q: "Làm sao để xóa tài khoản?",
            a: [
              "Ở cuối trang \"Tài khoản\", nhấn \"Xóa tài khoản\" và nhập email của tài khoản để xác nhận. Thao tác này là vĩnh viễn, gói đăng ký của bạn sẽ bị hủy, sổ tay và lịch sử sẽ bị xóa, và email đó sẽ được giải phóng để đăng ký mới.",
              "Ngoại lệ duy nhất là gói đăng ký mua trong App Store, xóa tài khoản sẽ không hủy gói đó, nên hãy hủy trước trong phần cài đặt gói đăng ký của Apple.",
              "Thông tin về các khoản thanh toán trước đây vẫn được giữ lại, vì pháp luật yêu cầu chúng tôi lưu lại cho mục đích kế toán.",
            ],
          },
          {
            id: "share-account",
            q: "Người bạn đời hoặc con tôi có thể dùng chung tài khoản của tôi không?",
            a: [
              "Mỗi tài khoản chỉ có một người đăng nhập tại một thời điểm. Với cả gia đình, gói Family được tạo ra cho việc này: tối đa 5 trẻ em và cha mẹ, mỗi người có không gian riêng, sổ tay và tiến độ riêng, cùng chế độ trẻ em cho các con và bảng điều khiển cho phụ huynh.",
              "Với một người lớn dùng riêng, gói Individual dành cho một người với đủ mọi công cụ học. Hãy so sánh các gói và giá cho quốc gia của bạn trên trang bảng giá.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Hình như tôi lỡ tạo hai tài khoản. Giờ phải làm sao?",
            a: [
              "Điều này thường xảy ra khi ai đó đăng ký một lần bằng Google và một lần bằng email và mật khẩu với cùng một địa chỉ, hoặc khi bạn đăng ký hai lần bằng hai địa chỉ email khác nhau. Mỗi lần đăng ký tạo ra một tài khoản Gadit riêng, với sổ tay, lịch sử và trạng thái gói đăng ký riêng.",
              "Hãy gửi email cho chúng tôi từ một trong hai địa chỉ đó, và ghi địa chỉ còn lại cùng với tài khoản bạn muốn giữ. Đội ngũ sẽ gộp sổ tay và lịch sử vào tài khoản bạn chọn, rồi đóng tài khoản kia gọn gàng. Không mất dữ liệu nào.",
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
              "Bên cạnh mỗi nghĩa, và trên các thẻ thành ngữ và nguồn gốc từ, đều có một biểu tượng lá cờ nhỏ. Hãy nhấn vào đó, chọn chỗ có vấn đề, và nếu muốn thì thêm một ghi chú ngắn. Báo cáo sẽ được gửi thẳng đến đội ngũ, và mọi báo cáo đều được xem xét.",
              "Đừng ngại nếu bạn thấy mình quá khắt khe. Từ điển được cải thiện nhờ kiểu phản hồi này nhanh hơn bất cứ điều gì khác.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Chế độ trẻ em không thay đổi phần giải thích",
            a: [
              "Chế độ trẻ em chỉ đổi phần văn bản khi từ đó đã có sẵn lời giải thích phù hợp cho trẻ em. Với một từ bạn vừa tra lần đầu, hãy đợi 10 đến 15 giây trong lúc phiên bản cho trẻ em được chuẩn bị.",
              "Chế độ trẻ em là một phần của gói Family. Ở Individual, bạn sẽ thấy nút gạt \"Bằng lời đơn giản\" thay vào đó, để hiện lời giải thích đơn giản hơn cho từng nghĩa. Ở Basic hoặc khi chưa có tài khoản thì sẽ không có nút gạt. Những người đã đăng ký Clear hoặc Deep trước tháng 10 năm 2026 vẫn giữ Chế độ trẻ em. Để có tính năng này, hãy xem gói Family trên trang bảng giá.",
            ],
          },
          {
            id: "voice-fails",
            q: "Tìm kiếm bằng giọng nói không hoạt động",
            a: [
              "Tìm kiếm bằng giọng nói cần quyền truy cập micrô. Hầu hết trình duyệt sẽ hỏi một lần cho mỗi trang web. Nếu bạn lỡ chặn, hãy nhấn vào biểu tượng bên cạnh gadit.app trên thanh địa chỉ rồi cho phép micrô trong phần quyền của trang web.",
              "Trên iPhone và iPad, bạn cũng cần cho phép micrô cho Safari trong ứng dụng Cài đặt của thiết bị. Tìm kiếm bằng giọng nói là một phần của gói Individual và Family, nên ở Basic và khi chưa có tài khoản thì nút micrô sẽ không xuất hiện. Để nâng cấp, hãy mở trang bảng giá.",
            ],
          },
          {
            id: "no-image",
            q: "Tôi không lấy được hình ảnh cho từ",
            a: [
              "Hình ảnh là một phần của gói Individual và Family, với tối đa 100 hình mới mỗi tháng. Hình đã có sẵn cho nghĩa đó sẽ mở ra mà không bị tính. Gói Clear cũ có 30 hình mỗi tháng, còn Basic không bao gồm hình ảnh. Khi dùng hết số hình của tháng, bạn sẽ thấy thông báo, và số lượt được tính lại từ đầu vào đầu mỗi tháng.",
              "Nếu bạn chưa dùng hết hạn mức mà vẫn gặp lỗi, thường đó chỉ là lỗi tạm thời. Hãy thử lại sau 30 giây. Lỗi kéo dài là một lỗi hệ thống. Vui lòng báo cáo từ trang của từ đó.",
            ],
          },
          {
            id: "save-word",
            q: "Làm sao để lưu một từ vào sổ tay?",
            a: [
              "Bạn không cần làm gì cả. Khi bạn đã đăng nhập, mọi từ bạn tra đều tự động được lưu vào sổ tay. Ở Basic, sổ tay chứa tối đa 30 từ. Ở Individual và Family, sổ tay không giới hạn và có luyện tập thông minh, giúp đưa các từ của bạn quay lại để ôn đúng lúc.",
              "Ở Individual và Family, các từ bạn tra cũng được giữ trên thiết bị, nên chúng mở được cả khi không có internet. Để xem các từ của bạn, hãy mở sổ tay từ menu.",
            ],
          },
          {
            id: "offline",
            q: "Chế độ ngoại tuyến hoạt động thế nào?",
            a: [
              "Dùng ngoại tuyến là một phần của gói Individual và Family. Mọi từ bạn tra đều được giữ trên thiết bị, nên lần sau chúng mở lại ngay lập tức mà không cần internet. Bạn cũng có thể nhấn \"Tải gói ngoại tuyến\" trên trang Tài khoản để lưu các từ trong từ điển của chúng tôi bằng ngôn ngữ của bạn trên thiết bị này.",
              "Tra một từ hoàn toàn mới vẫn cần kết nối mạng, vì Gadit phải chuẩn bị đầy đủ kết quả cho từ đó. Bản ngoại tuyến chỉ bao gồm những từ đã có trên thiết bị của bạn. Nếu bạn đang dùng Basic, hãy xem các gói trên trang bảng giá.",
            ],
          },
          {
            id: "slow",
            q: "Ứng dụng có vẻ chậm",
            a: [
              "Lần tra đầu tiên của một từ là chậm nhất vì Gadit tạo toàn bộ kết quả từ đầu: thường mất vài giây, đôi khi lâu hơn với những từ phức tạp. Những lần tra sau của cùng từ đó hiện ra ngay lập tức, lấy từ bộ nhớ đệm.",
              "Nếu mọi thứ đều chậm, hãy thử làm mới hoàn toàn: Cmd+Shift+R trên Mac, Ctrl+Shift+R trên Windows. Nếu tình trạng chậm vẫn kéo dài trên nhiều trang, vui lòng gửi email cho chúng tôi kèm quốc gia và trình duyệt của bạn để đội ngũ kiểm tra đường truyền mạng từ khu vực của bạn đến máy chủ của chúng tôi.",
            ],
          },
          {
            id: "word-not-found",
            q: "Tôi tìm một từ nhưng không có kết quả. Chuyện gì vậy?",
            a: [
              "Trước tiên, hãy kiểm tra chính tả. Nếu có lỗi gõ, Gadit thường sẽ hiện từ đã được sửa, kèm một liên kết để vẫn tìm đúng thứ bạn đã gõ.",
              "Những từ rất hiếm hoặc tiếng lóng không phải lúc nào cũng có kết quả. Nếu bạn chắc chắn từ đó có thật, hãy viết cho chúng tôi từ chính trang này và đội ngũ sẽ kiểm tra.",
            ],
          },
          {
            id: "change-language",
            q: "Làm sao để thay đổi ngôn ngữ giao diện?",
            a: [
              "Ở đầu trang có một biểu tượng hình địa cầu kèm ngôn ngữ hiện tại. Hãy nhấn vào đó và chọn ngôn ngữ.",
              "Lựa chọn của bạn được lưu trên thiết bị này. Mọi thứ sẽ tải lại bằng ngôn ngữ mới, giao diện, các menu, các định nghĩa từ bạn tra sau này, ví dụ, phần giải thích cho trẻ em, thậm chí cả nguồn gốc của từ. Những từ bạn đã tra trước đó bằng ngôn ngữ cũ vẫn sẽ hiển thị như vậy cho đến khi bạn tra lại.",
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
              "Hãy vào gadit.app/partners và nhấn \"Tham gia miễn phí\". Nhập tên và email của bạn, rồi nhấn \"Nhận mã đối tác của tôi\". Liên kết cá nhân và bảng điều khiển đối tác của bạn, với lượt nhấp và hoa hồng, sẽ có ngay lập tức, không cần chờ duyệt. Mã và liên kết cũng sẽ được gửi qua email cho bạn.",
              "Việc tham gia là miễn phí và mở cho tất cả mọi người. Bạn không cần gói đăng ký Gadit để trở thành đối tác.",
            ],
          },
          {
            id: "commission-model",
            q: "Hoa hồng được tính như thế nào?",
            a: [
              "Điều khoản tiêu chuẩn là 25% của mỗi khoản thanh toán mà khách hàng thực hiện trong năm đầu tiên. Sau năm đầu tiên đó, bạn nhận 10% của mỗi khoản thanh toán miễn là khách hàng còn tiếp tục trả tiền. Nếu bạn mang về 5 khách hàng trả phí, phần của bạn sau năm đầu tiên sẽ tăng lên 15% trọn đời.",
              "Cách tính này giống nhau cho gói tháng và gói năm, vì hoa hồng được tính trên từng khoản thanh toán thực tế. Nếu khách hàng hủy, hoa hồng của bạn sẽ dừng ở khoản thanh toán cuối cùng của họ.",
              "Đội ngũ có thể đặt mức khác cho một số đối tác cụ thể. Mức hoa hồng của riêng bạn luôn hiển thị trong bảng điều khiển đối tác.",
            ],
          },
          {
            id: "payout",
            q: "Khi nào tôi được thanh toán?",
            a: [
              "Mỗi tháng một lần, không có mức tối thiểu. Mỗi khoản hoa hồng sẽ được trả sau 30 ngày kể từ khi khách hàng thanh toán, và mọi khoản đến hạn sẽ được gửi trong đợt chi trả hàng tháng tiếp theo tới tài khoản PayPal mà bạn đã đặt trong bảng điều khiển đối tác.",
              "Chúng tôi thanh toán bằng đúng loại tiền mà khách hàng đã trả khi PayPal có thể gửi loại tiền đó, còn nếu không thì bằng đô la Mỹ, theo tỷ giá vào ngày chúng tôi thanh toán.",
              "Hoa hồng chờ 30 ngày vì hoàn tiền, nếu khoản thanh toán của khách hàng được hoàn lại thì hoa hồng từ khoản đó sẽ bị hủy. Vì vậy, hoa hồng từ một khoản thanh toán trong tháng Một sẽ đến hạn trong tháng Hai và được gửi trong đợt chi trả hàng tháng tiếp theo.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Tôi đã tham gia nhưng bảng điều khiển trống trơn",
            a: [
              "Số liệu sẽ hiển thị sau lượt nhấp đầu tiên vào liên kết của bạn. Trống chỉ có nghĩa là chưa có ai nhấp. Hãy chia sẻ liên kết. Bảng điều khiển cập nhật gần như theo thời gian thực khi có hoạt động.",
              "Nếu bạn đã chia sẻ và có người đăng ký nhưng bảng điều khiển không phản ánh điều đó, hãy viết cho chúng tôi kèm thời gian đăng ký ước chừng, đội ngũ sẽ kiểm tra xem lượt đăng ký đó đến từ đâu.",
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
            q: "Có người đăng ký qua liên kết của tôi nhưng tôi không thấy hoa hồng",
            a: [
              "Thường đây là vấn đề thời gian, lượt đăng ký hiện trong bảng điều khiển trong vòng vài phút, nhưng hoa hồng chỉ được ghi nhận khi gói đăng ký thực sự được thanh toán, việc này có thể muộn hơn vài ngày nếu họ đang dùng thử miễn phí. Hãy kiểm tra lại sau khi thời gian dùng thử kết thúc.",
              "Nếu gói đăng ký đã được thanh toán mà sau 48 giờ bạn vẫn không thấy hoa hồng, hãy viết cho chúng tôi kèm thời gian đăng ký ước chừng và email hoặc tên gần đúng của người đăng ký nếu bạn biết. Đội ngũ sẽ kiểm tra lượt đăng ký đó đến từ đâu và sửa thủ công nếu có ghi nhận bị sót.",
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
              "Gadit giúp bạn hiểu mọi từ đến tận cùng, không chỉ nhận một định nghĩa một dòng. Mỗi từ mở ra với tất cả các nghĩa, ví dụ thực tế cho từng nghĩa, thành ngữ và nguồn gốc của từ. Các gói trả phí có thêm hình ảnh cho mọi nghĩa, luyện tập, trò chơi và nhiều hơn nữa, còn Family có thêm chế độ trẻ em và không gian riêng cho từng trẻ.",
              "Gadit hoạt động bằng 41 ngôn ngữ. Trong nội bộ, đội ngũ gọi đó là GAD một từ: hiểu một từ đến tận cùng, không chỉ dịch nó. Để xem mỗi gói gồm những gì, hãy mở trang bảng giá.",
            ],
          },
          {
            id: "languages",
            q: "Các bạn hỗ trợ những ngôn ngữ nào?",
            a: [
              "Gadit hoạt động bằng 41 ngôn ngữ, trong đó có tiếng Anh, tiếng Do Thái, tiếng Ả Rập, tiếng Tây Ban Nha, tiếng Pháp, tiếng Đức, tiếng Nga, tiếng Trung, tiếng Nhật, tiếng Hindi, tiếng Zulu, tiếng Xhosa và tiếng Afrikaans.",
              "Bạn có thể tra một từ bằng bất kỳ ngôn ngữ nào trong số đó và nhận các nghĩa, ví dụ và mọi thứ khác bằng ngôn ngữ bạn đã chọn cho giao diện. Tiếng Do Thái, tiếng Ả Rập và tiếng Ba Tư được đọc từ phải sang trái, với phông chữ riêng. Để đổi ngôn ngữ, hãy nhấn nút ngôn ngữ ở đầu bất kỳ trang nào.",
            ],
          },
          {
            id: "kid-safety",
            q: "Gadit có an toàn cho trẻ em không?",
            a: [
              "Gadit được thiết kế để cha mẹ sử dụng an toàn cùng với con. Chế độ trẻ em tạo ra các phần giải thích đơn giản, cụ thể và phù hợp với lứa tuổi, khoảng mức 5 đến 10 tuổi, dùng cùng công cụ tạo nội dung cho người lớn với hướng dẫn rõ ràng để đơn giản hóa. Nội dung do người dùng tạo không bao giờ được hiển thị cho trẻ em.",
              "Tài khoản riêng chỉ dành cho người lớn, từ 18 tuổi trở lên. Trẻ em và thanh thiếu niên dùng Gadit thông qua một người lớn. Ở nhà, cha mẹ thêm từng con trên trang Family, mỗi trẻ có không gian riêng với Chế độ trẻ em, và bảng điều khiển của phụ huynh cho thấy những từ mỗi trẻ tra. Ở trường, lớp học nhận một liên kết từ giáo viên, và học sinh tham gia mà không cần tài khoản hoặc địa chỉ email.",
            ],
          },
          {
            id: "data",
            q: "Dữ liệu của tôi được lưu ở đâu? Các bạn có bán nó không?",
            a: [
              "Tài khoản, lịch sử, sổ tay và hình ảnh đã tạo được lưu trữ an toàn trên Firebase, được mã hóa khi lưu trữ. Chúng tôi không bán dữ liệu của bạn cho bất kỳ ai. Chúng tôi chỉ chia sẻ những gì cần thiết để vận hành Gadit (lưu trữ, thanh toán, nhà cung cấp nội dung), như đã nêu rõ trong Chính sách quyền riêng tư.",
              "Bạn có thể xóa tài khoản bất cứ lúc nào từ trang Tài khoản. Để nhận bản sao sổ tay hoặc bất kỳ dữ liệu nào khác mà chúng tôi lưu giữ, hãy viết cho chúng tôi từ trang này.",
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
    heading: "Hanapin ang sagot, nang mabilis",
    lede: "Mga karaniwang tanong at sunud-sunod na solusyon, nakaayos ayon sa paksa. Kung hindi mo makita ang problema mo, makipag-ugnayan sa team sa ibaba.",
    stillNeedHelpHeading: "May problema pa rin?",
    stillNeedHelpBody: "Sumulat ka sa amin nang direkta. Binabasa ng team ang bawat mensahe at karaniwang sinasagot ito sa loob ng isa o dalawang araw.",
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
              "1. Mag-sign in sa gadit.app at buksan ang \"Account\" mula sa account menu. 2. I-click ang \"Pamahalaan ang pagsingil\". 3. Magbubukas ang isang secure na page ng Stripe. Idagdag ang bagong card bilang payment method at gawin itong default. 4. Kung gusto mo, alisin ang lumang card.",
              "Simula sa susunod na billing cycle, sa bagong card na mapupunta ang lahat. Mananatili sa lumang card ang naunang singil, na nakolekta na. Ang pagpapalit ng card ay hindi naglilipat ng singil na iyon at hindi rin binabago ang susunod mong billing date.",
            ],
          },
          {
            id: "cancel",
            q: "Paano ko ika-cancel ang subscription ko?",
            a: [
              "Kaya mo itong gawin mismo, anumang oras. Mag-sign in, buksan ang Account, at i-tap ang Cancel subscription sa ilalim ng plan mo.",
              "Binili mo ba ang subscription mo sa iPhone o iPad app? Kanselahin ito sa Apple subscription settings mo. Dadalhin ka roon ng link na \"Pamahalaan ang subscription\" sa page na Account mo.",
              "Sa bayad na subscription, tuloy ang access mo hanggang matapos ang period na nabayaran mo na. Pagkatapos noon, lilipat ang account sa Basic, na libre. Ligtas pa rin ang mga na-save mong salita at history.",
              "Sa loob ng 14 na araw na libreng trial, kapag nag-cancel ka, matatapos agad ang trial at walang sisingilin. Kung ang awtomatikong singil lang ang inaalala mo, piliin ang dahilang iyon sa cancel window at puwede mong i-off na lang ang renewal, para tuloy ang trial hanggang sa huling araw nito.",
              "Kung na-cancel mo ang bayad na subscription nang hindi sinasadya o nagbago ang isip mo, puwede mo itong ituloy ulit mula sa parehong page bago matapos ang period.",
            ],
          },
          {
            id: "switch-plan",
            q: "Paano lumipat sa pagitan ng Individual at Family?",
            a: [
              "Para lumipat sa Family, buksan ang page ng Account mo at i-tap ang \"Lumipat sa Family\". Ia-update ang kasalukuyan mong subscription sa parehong card, nang hindi na ito ilalagay ulit.",
              "Kinukuwenta ng Stripe ang diperensya para sa mga araw na natitira sa kasalukuyang period, kaya ang diperensya lang ang babayaran mo. Para lumipat mula Family papuntang Individual, sumulat sa amin mula sa page na ito at ang team na ang maglilipat para sa iyo.",
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
              "Oo, sa loob ng 14 na araw mula sa unang bayad sa account mo, o mula sa taunang renewal. Sumulat sa support@gadit.app gamit ang email address ng account mo at ibabalik namin nang buo ang bayad na iyon. Hindi mo kailangang magbigay ng dahilan. Tinatapos din ng refund ang subscription, at ibinabalik ang pera sa card na ginamit mo sa pagbayad, karaniwan sa loob ng 5 hanggang 10 business days.",
              "Pagkalipas ng 14 na araw, hindi na nire-refund ang mga bayad, maliban kung nagka-charge nang mali o kung kailangan ito ng batas sa lugar kung saan ka nakatira. Puwede kang mag-cancel anumang oras para hindi na mag-renew ang subscription, at mananatili ito hanggang sa dulo ng panahong binayaran mo.",
              "Bumili sa iPhone o iPad app? Apple ang humahawak ng mga refund na iyon sa reportaproblem.apple.com.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Ano ang singil na ito sa card ko?",
            a: [
              "Lumalabas ang mga singil bilang GADIT o GADIT.APP. Tugma ang halaga sa plan mo (Individual o Family, buwanan o taunan) sa currency ng bansa mo, gaya ng nasa page ng pricing. Ang mga subscription na nagsimula bago ang Oktubre 2026 ay mananatili sa presyong sinimulan nila. Kung hindi tugma ang halaga, baka galing ito sa ibang serbisyo.",
              "Kung sigurado kang hindi sa iyo ito, huwag munang mag-dispute sa bangko mo. Sumulat muna sa amin nang direkta, kasama ang petsa at halaga. Hahanapin ito ng team, ipapaliwanag kung ano ito, at magre-refund kung kailangan. Puwedeng pahirapan ng bank dispute ang mga susunod na billing, kaya kadalasang mas mabilis at mas ligtas na ayusin ito sa pamamagitan ng support.",
            ],
          },
          {
            id: "failed-payment",
            q: "Nag-fail ang bayad ko. Ano ang dapat kong gawin?",
            a: [
              "Awtomatikong sinusubukan ulit ng Stripe ang mga nag-fail na bayad nang ilang beses sa mga susunod na araw. Karamihan ng failure ay kusang naaayos kapag inalis na ng bangko ang hold o may sapat nang balanse ang card.",
              "May bar sa itaas ng page na magsasabing hindi natuloy ang singil, at mananatili ang access mo nang ilang araw pa. I-tap ang \"I-update ang card\" doon, maglagay ng gumaganang card, at susubukan namin agad ang singil sa card na iyon. Kung bumalik na sa Basic ang subscription mo, puwede kang mag-subscribe ulit mula sa Pricing page at buo pa rin ang notebook mo.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Ano ang pagkakaiba ng Basic, Individual, at Family?",
            a: [
              "Basic (libre): hanggang 10 word lookup kada araw, lahat ng kahulugan, mga halimbawa, mga idyoma, pinagmulan ng salita, ang tamang kahulugan mula sa isang pangungusap, at kwaderno na may hanggang 30 salita.",
              "Individual: isang tao, lahat ng learning tool. Walang limitasyong lookup, larawan sa bawat kahulugan, mas maraming halimbawa at tanong sa bawat salita, pagbuo ng pangungusap na may feedback, Bawat salita, Sabihin, natural na boses sa pagbasa nang malakas at voice search, offline na gamit, mga laro, quiz at word duel, at smart na practice na may test prep at dictation.",
              "Family: lahat ng nasa Individual para sa hanggang 5 bata at mga magulang, dagdag pa ang Kids mode, sariling espasyo para sa bawat bata, tulong sa takdang-aralin, at board ng magulang na may alerto sa bawat salita. May sariling plan ang mga paaralan. Nasa page ng pricing ang mga presyo para sa bansa mo at ang 14 na araw na libreng trial.",
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
            q: "Hindi ko natanggap ang verification email ko",
            a: [
              "Tingnan muna ang spam at promotions folder. Minsan napupunta roon ang mga email ng account sa Gmail at Outlook hanggang markahan mo ang isa bilang \"Not spam\".",
              "Kung wala roon, baka mali ang pagkaka-type ng email noong nag-sign up ka. Subukang mag-sign up ulit at i-double check ang address. Kung Google sign-up ang ginamit mo, hindi kailangan ng verification email.",
            ],
          },
          {
            id: "forgot-password",
            q: "Nakalimutan ko ang password ko",
            a: [
              "Sa sign-in window, i-type ang email mo, tapos i-tap ang \"Nakalimutan ang password?\". Karaniwan, dumarating ang reset link sa inbox mo sa loob ng isa o dalawang minuto. Puwede mo ring i-tap ang \"Padalhan ako ng link para mag-sign in\" at mag-sign in nang walang password.",
              "Kung hindi dumating ang email, tingnan ang spam. Kung wala pa rin, baka sa Google ka nag-sign up sa halip na email at password. Subukan ang button na \"Magpatuloy gamit ang Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Sigurado akong tama ang password ko pero sinasabing hindi tugma ang email at password",
            a: [
              "Tatlong bagay ang dapat i-check. Una, ang Caps Lock. Pangalawa, may sobrang space sa dulo pagkatapos mag-copy-paste. Pangatlo, baka sa Google ka nag-sign up at hindi gamit ang password, kaya \"Magpatuloy gamit ang Google\" ang gamitin mo.",
              "May problema pa rin? Sa parehong mensahe, i-tap ang \"Padalhan ako ng link para mag-sign in\" para makapasok nang walang password, o ang \"Pumili ng bagong password\".",
            ],
          },
          {
            id: "google-fails",
            q: "Hindi gumagana ang Google sign-in",
            a: [
              "Sa loob ng mga app tulad ng Instagram, Facebook, o TikTok, nakatago ang Google button. Buksan ang link sa regular mong browser, o mag-sign in gamit ang email mo. Kung sumali ka gamit ang Google, i-type ang email na iyon at i-tap ang \"Padalhan ako ng link para mag-sign in\".",
              "Sa private o incognito window, puwedeng pigilan ng blocked cookies ang Google sign-in, kaya subukan ang normal na window.",
            ],
          },
          {
            id: "change-email",
            q: "Paano ko papalitan ang email sa account ko?",
            a: [
              "Ang team ang nagpapalit ng email ng account. Mag-email sa amin mula sa kasalukuyan mong address at isulat ang bagong address sa mensahe. Ia-update ito ng team, at mananatili ang subscription, history, at notebook mo gaya ng dati.",
            ],
          },
          {
            id: "delete-account",
            q: "Paano ko buburahin ang account ko?",
            a: [
              "Sa ibaba ng page na Account, i-tap ang \"Burahin ang account\" at i-type ang email ng account mo para makumpirma. Permanente ito, makakansela ang subscription mo, mabubura ang notebook at history mo, at magiging puwede ulit ang email para sa bagong sign-up.",
              "Ang isang exception ay subscription na binili sa App Store. Hindi ito nakokansela kapag binura ang account, kaya kanselahin mo muna ito sa Apple subscription settings mo.",
              "Mananatili ang mga record ng mga nakaraang singil, dahil kailangan naming itago ang mga ito ayon sa batas para sa accounting.",
            ],
          },
          {
            id: "share-account",
            q: "Puwede bang gamitin ng partner o anak ko ang account ko?",
            a: [
              "Isang tao lang ang naka-sign in sa bawat account sa isang pagkakataon. Para sa isang pamilya, ginawa para dito ang Family plan: hanggang 5 bata at ang mga magulang, bawat isa ay may sariling espasyo, sariling kwaderno at progreso, dagdag pa ang Kids mode para sa mga bata at board ng magulang.",
              "Para sa isang adult na mag-isa, sakop ng Individual ang isang tao na may lahat ng learning tool. Ikumpara ang mga plan at ang mga presyo para sa bansa mo sa page ng pricing.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Sa tingin ko may dalawa akong account nang hindi sinasadya. Ano ngayon?",
            a: [
              "Karaniwang nangyayari ito kapag may nag-sign up nang isang beses gamit ang Google at isang beses gamit ang email at password sa parehong address, o kapag nag-sign up ka nang dalawang beses gamit ang magkaibang email address. Bawat sign-up ay gumagawa ng hiwalay na Gadit account na may sariling notebook, history, at estado ng subscription.",
              "Mag-email sa amin mula sa isa sa dalawang address, at isulat ang isa pang address at kung aling account ang gusto mong panatilihin. Pagsasamahin ng team ang notebook at history sa account na pipiliin mo, tapos maayos na isasara ang isa. Walang mawawalang data.",
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
              "Sa tabi ng bawat kahulugan, at sa mga card ng idyoma at pinagmulan ng salita, may maliit na icon ng bandila. I-tap ito, piliin kung ano ang mali, at magdagdag ng maikling tala kung gusto mo. Diretso itong napupunta sa team, at nirerepaso ang bawat report.",
              "Huwag mag-alala kung pakiramdam mo ay masyado kang mapili. Mas mabilis gumaganda ang diksyunaryo dahil sa ganitong feedback kaysa sa kahit ano pa.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Hindi binabago ng Kids mode ang paliwanag",
            a: [
              "Binabago lang ng Kids Mode ang teksto kapag may pambatang paliwanag na ang salita. Para sa salitang kaka-lookup mo lang sa unang pagkakataon, maghintay ng 10 hanggang 15 segundo habang inihahanda ang pambatang bersyon.",
              "Bahagi ng Family plan ang Kids Mode. Sa Individual, makikita mo sa halip ang switch na \"Sa simpleng salita\", na nagbibigay ng mas simpleng paliwanag sa bawat kahulugan. Sa Basic o kapag walang account, walang switch. Ang mga subscriber na sumali sa Clear o Deep bago ang October 2026 ay mananatiling may Kids Mode. Para makuha ito, tingnan ang Family sa pricing page.",
            ],
          },
          {
            id: "voice-fails",
            q: "Hindi gumagana ang voice search",
            a: [
              "Kailangan ng voice search ng pahintulot sa mikropono. Karamihan ng browser ay nagtatanong nang isang beses bawat site. Kung na-block mo ito nang hindi sinasadya, i-tap ang icon sa tabi ng gadit.app sa address bar at payagan ang mikropono sa site permissions.",
              "Sa iPhone at iPad, kailangan ding payagan ang mikropono para sa Safari sa Settings app ng device. Bahagi ng Individual at Family plan ang voice search, kaya sa Basic at kapag walang account, hindi lumalabas ang microphone button. Para mag-upgrade, buksan ang pricing page.",
            ],
          },
          {
            id: "no-image",
            q: "Hindi ako makakuha ng larawan para sa salita",
            a: [
              "Bahagi ng Individual at Family plan ang mga larawan, na may hanggang 100 bagong larawan kada buwan. Hindi nabibilang ang larawang mayroon na para sa kahulugang iyon. May 30 kada buwan ang lumang Clear plan, at walang kasamang larawan ang Basic. Kapag naubos na ang mga larawan para sa buwan, may lalabas na abiso, at magsisimula ulit ang bilang sa simula ng bawat buwan.",
              "Kung hindi mo pa naaabot ang quota at may failure pa rin, kadalasan ay pansamantala lang ito. Subukan ulit pagkalipas ng 30 segundo. Bug na kapag paulit-ulit ang failure. Paki-report mula sa page ng salita.",
            ],
          },
          {
            id: "save-word",
            q: "Paano mag-save ng salita sa notebook ko?",
            a: [
              "Hindi mo na kailangan. Kapag naka-sign in ka, kusang nase-save sa kwaderno mo ang bawat salitang hinahanap mo. Sa Basic, hanggang 30 salita ang laman ng kwaderno. Sa Individual at Family, walang limitasyon ito at may kasamang smart na practice, na ibinabalik ang mga salita mo para sa review sa tamang oras.",
              "Sa Individual at Family, nakatago rin sa device mo ang mga salitang hinanap mo, kaya bumubukas ang mga ito kahit walang internet. Para makita ang mga salita mo, buksan ang Kwaderno mula sa menu.",
            ],
          },
          {
            id: "offline",
            q: "Paano gumagana ang offline mode?",
            a: [
              "Bahagi ng Individual at Family plan ang offline na gamit. Nakatago sa device mo ang bawat salitang hinahanap mo, kaya bumubukas ulit ito agad kahit walang internet. Puwede mo ring i-tap ang \"I-download ang offline pack\" sa page ng Account mo para i-save sa device na ito ang mga salita ng aming diksyunaryo sa wika mo.",
              "Kailangan pa rin ng koneksyon para mag-lookup ng ganap na bagong salita, dahil kailangang ihanda ng Gadit ang buong resulta para dito. Sakop ng offline na kopya ang mga salitang nasa device mo na. Kung Basic ka, tingnan ang mga plan sa pricing page.",
            ],
          },
          {
            id: "slow",
            q: "Parang mabagal ang app",
            a: [
              "Pinakamabagal ang unang lookup ng isang salita dahil binubuo ng Gadit ang buong resulta mula sa simula: kadalasan ilang segundo, minsan mas matagal para sa mga komplikadong salita. Agad-agad na ang mga susunod na lookup ng parehong salita, mula na sa cache.",
              "Kung mabagal ang lahat, subukan ang hard refresh: Cmd+Shift+R sa Mac, Ctrl+Shift+R sa Windows. Kung patuloy ang pagbagal sa iba't ibang page, paki-email kami kasama ang bansa at browser mo para ma-check ng team ang network route papunta sa mga server namin mula sa rehiyon mo.",
            ],
          },
          {
            id: "word-not-found",
            q: "Nag-search ako ng salita at walang lumabas na resulta. Ano'ng nangyayari?",
            a: [
              "Una, i-check ang spelling. Kung may typo, karaniwang ipinapakita ng Gadit ang itinamang salita, kasama ang link para hanapin pa rin ang tinype mo.",
              "Hindi palaging may resulta ang napakabihirang mga salita o slang. Kung sigurado kang totoong salita ito, sumulat sa amin mula sa page na ito at susuriin ito ng team.",
            ],
          },
          {
            id: "change-language",
            q: "Paano palitan ang wika ng interface?",
            a: [
              "Sa itaas ng page, may globe icon kasama ang kasalukuyan mong wika. I-tap ito at pumili ng wika.",
              "Naka-save ang pinili mo sa device na ito. Magre-reload ang lahat sa bagong wika, ang interface, mga menu, mga susunod na depinisyon ng salita, mga halimbawa, mga pambatang paliwanag, pati ang pinagmulan ng salita. Ang mga salitang na-search mo na sa lumang wika ay mananatiling ganoon hanggang hanapin mo ulit ang mga iyon.",
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
              "Pumunta sa gadit.app/partners at i-tap ang \"Sumali nang libre\". Ilagay ang pangalan at email mo, tapos i-tap ang \"Kunin ang partner code ko\". Handa agad ang personal mong link at partner dashboard, kasama ang clicks at commissions, at walang hihintaying approval. Darating din ang code at link sa email mo.",
              "Libre ang pagsali at bukas sa lahat. Hindi mo kailangan ng Gadit subscription para maging partner.",
            ],
          },
          {
            id: "commission-model",
            q: "Paano kinukuwenta ang mga komisyon?",
            a: [
              "Ang standard na terms ay 25% ng bawat bayad na ginagawa ng customer sa unang taon niya. Pagkatapos ng unang taon na iyon, kikita ka ng 10% ng bawat bayad hangga't patuloy na nagbabayad ang customer. Kapag nakapagdala ka ng 5 nagbabayad na customer, tataas sa 15% habambuhay ang bahagi mo pagkatapos ng unang taon.",
              "Pareho ito para sa monthly at annual plan, dahil binibilang ang komisyon sa bawat aktwal na bayad. Kung mag-cancel ang customer, titigil ang komisyon mo sa huli niyang bayad.",
              "Puwedeng magtakda ang team ng ibang rate para sa ilang partner. Laging makikita ang sarili mong mga rate sa partner dashboard mo.",
            ],
          },
          {
            id: "payout",
            q: "Kailan ako mababayaran?",
            a: [
              "Minsan bawat buwan, walang minimum. Ang bawat komisyon ay puwedeng bayaran 30 araw pagkatapos ng bayad ng customer, at ang lahat ng puwede nang bayaran ay ipinapadala sa susunod na buwanang payout sa PayPal account na itinakda mo sa partner dashboard mo.",
              "Nagbabayad kami sa currency na ginamit ng customer kung kaya itong ipadala ng PayPal, at kung hindi, sa US dollars, ayon sa exchange rate sa araw ng bayad.",
              "Naghihintay nang 30 araw ang mga komisyon dahil sa mga refund. Kapag ni-refund ang bayad ng customer, makakansela rin ang komisyon para rito. Kaya ang komisyon para sa bayad noong Enero ay puwede nang bayaran sa Pebrero at ipinapadala sa susunod na buwanang payout.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Sumali ako pero walang laman ang dashboard ko",
            a: [
              "Lalabas ang stats pagkatapos ng unang click sa link mo. Kapag walang laman, ibig sabihin lang ay wala pang nagki-click. I-share mo na ang link. Halos real time ang update ng dashboard kapag nagsimula na ang aktibidad.",
              "Kung na-share mo na at may nag-sign up pero hindi ito makikita sa dashboard, sumulat sa amin kasama ang tantiyang oras ng sign-up at susuriin ng team kung saan nanggaling ang sign-up.",
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
            q: "May nag-sign up gamit ang link ko pero hindi ko makita ang komisyon",
            a: [
              "Kadalasan, usapin ito ng timing. Lumalabas ang sign-up sa dashboard sa loob ng ilang minuto, pero naitatala lang ang komisyon kapag talagang nabayaran na ang subscription, na puwedeng ilang araw pa kung naka-free trial sila. Balikan ito pagkatapos ng trial.",
              "Kung nabayaran na ang subscription pero wala ka pa ring nakikitang komisyon pagkalipas ng 48 oras, sumulat sa amin kasama ang tantiyang oras ng sign-up at ang email o tantiyang pangalan ng subscriber kung alam mo. Susuriin ng team kung saan nanggaling ang sign-up at mano-manong aayusin ang anumang nakaligtaan.",
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
              "Tinutulungan ka ng Gadit na maintindihan ang bawat salita nang buong-buo, hindi lang makakuha ng isang linyang depinisyon. Bumubukas ang bawat salita kasama ang lahat ng kahulugan nito, mga totoong halimbawa sa bawat kahulugan, mga idyoma, at pinagmulan ng salita. Nagdadagdag ang mga bayad na plan ng larawan sa bawat kahulugan, practice, mga laro, at iba pa, at nagdadagdag ang Family ng Kids mode at sariling espasyo para sa bawat bata.",
              "Gumagana ang Gadit sa 41 na wika. Sa loob ng team, tinatawag namin itong pag-GAD sa isang salita: maintindihan ang isang salita nang buong-buo, hindi lang isalin ito. Para makita kung ano ang kasama sa bawat plan, buksan ang page ng pricing.",
            ],
          },
          {
            id: "languages",
            q: "Anong mga wika ang sinusuportahan ninyo?",
            a: [
              "Gumagana ang Gadit sa 41 na wika, kasama ang Ingles, Hebreo, Arabe, Espanyol, Pranses, Aleman, Ruso, Tsino, Hapon, Hindi, isiZulu, isiXhosa, at Afrikaans.",
              "Puwede kang mag-lookup ng salita sa alinman sa mga wikang ito at makuha ang mga kahulugan, mga halimbawa, at lahat ng iba pa sa wikang pinili mo para sa interface. Binabasa mula kanan pakaliwa ang Hebreo, Arabe, at Persyano, gamit ang sarili nilang mga font. Para magpalit, i-tap ang language button sa itaas ng kahit anong page.",
            ],
          },
          {
            id: "kid-safety",
            q: "Ligtas ba ang Gadit para sa mga bata?",
            a: [
              "Dinisenyo ang Gadit para ligtas na magamit ng magulang kasama ang anak. Gumagawa ang Kids mode ng mga paliwanag na simple, kongkreto, at angkop sa edad, mga nasa antas ng 5 hanggang 10 taong gulang, gamit ang parehong engine na nagpapatakbo ng content para sa mga adult na may tahasang instruksyon na gawing simple. Hindi kailanman ipinapakita sa mga bata ang anumang content na gawa ng mga user.",
              "Ang sariling account ay para sa mga adult, edad 18 pataas. Ginagamit ng mga bata at teenager ang Gadit sa pamamagitan ng isang adult. Sa bahay, idinadagdag ng magulang ang bawat bata sa Family page, may sariling espasyo ang bawat bata na may Kids Mode, at ipinapakita ng board ng magulang ang mga salitang hinahanap ng bawat bata. Sa paaralan, nakakakuha ang klase ng link mula sa teacher, at sumasali ang mga estudyante nang walang account o email address.",
            ],
          },
          {
            id: "data",
            q: "Saan naka-store ang data ko? Ibinebenta ba ninyo ito?",
            a: [
              "Ang account, history, notebook, at mga nagawang larawan ay ligtas na naka-store sa Firebase, naka-encrypt sa storage. Hindi namin ibinebenta ang data mo kaninuman. Ibinabahagi lang namin ang kailangan para patakbuhin ang Gadit (storage, bayad, mga content provider), gaya ng nakasaad sa Privacy Policy.",
              "Puwede mong burahin ang account mo anumang oras mula sa Account page. Para makakuha ng kopya ng notebook mo o ng anumang ibang data na hawak namin, sumulat sa amin mula sa page na ito.",
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
    heading: "Kry vinnig 'n antwoord",
    lede: "Algemene vrae en stap-vir-stap oplossings, volgens onderwerp georden. As jy nie jou probleem sien nie, kontak die span onderaan.",
    stillNeedHelpHeading: "Steeds vas?",
    stillNeedHelpBody: "Skryf direk aan ons. Die span lees elke boodskap en antwoord gewoonlik binne 'n dag of twee.",
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
              "1. Meld aan by gadit.app en maak \"Rekening\" oop vanaf die rekeningkieslys. 2. Klik op \"Bestuur fakturering\". 3. 'n Veilige Stripe-bladsy maak oop. Voeg die nuwe kaart as 'n betaalmetode by en merk dit as die verstek. 4. Verwyder opsioneel die ou kaart.",
              "Vanaf die volgende faktuursiklus gaan alles na die nuwe kaart. Die vorige heffing, wat reeds ingevorder is, bly op die ou kaart. Om die kaart te verander skuif nie daardie heffing nie en verander nie jou volgende faktuurdatum nie.",
            ],
          },
          {
            id: "cancel",
            q: "Hoe kanselleer ek my intekening?",
            a: [
              "Jy doen dit self, enige tyd. Meld aan, maak Rekening oop, en tik op Kanselleer intekening onder jou plan.",
              "Het jy jou intekening in die iPhone- of iPad-app gekoop? Kanselleer dit in jou Apple-intekeninginstellings. Die \"Bestuur intekening\"-skakel op jou Rekening-bladsy neem jou soontoe.",
              "Op 'n betaalde intekening duur jou toegang voort tot aan die einde van die tydperk waarvoor jy reeds betaal het. Daarna skuif die rekening na Basic, gratis. Jou gestoorde woorde en geskiedenis bly veilig.",
              "Tydens die gratis proeftydperk van 14 dae beëindig kansellering die proeftydperk dadelik, en niks word gehef nie. As die outomatiese heffing jou enigste bekommernis is, kies daardie rede in die kansellasievenster, dan kan jy eerder die hernuwing afskakel en die proeftydperk tot die laaste dag hou.",
              "As jy 'n betaalde intekening per ongeluk kanselleer of van plan verander, kan jy dit op dieselfde bladsy hervat voordat die tydperk eindig.",
            ],
          },
          {
            id: "switch-plan",
            q: "Hoe skakel ek tussen Individual en Family oor?",
            a: [
              "Om na Family oor te skakel, maak jou Rekening-bladsy oop en tik op \"Skakel oor na Family\". Jou huidige intekening word op dieselfde kaart opgedateer, sonder om dit weer in te voer.",
              "Stripe werk die verskil uit vir die dae wat in die huidige tydperk oor is, so jy betaal net die verskil. Om van Family na Individual oor te skakel, skryf aan ons vanaf hierdie bladsy en die span skakel dit vir jou om.",
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
              "Ja, binne 14 dae ná die eerste betaling op jou rekening, of ná 'n jaarlikse hernuwing. Skryf aan support@gadit.app vanaf jou rekening se e-posadres en ons betaal daardie betaling volledig terug. Jy hoef nie 'n rede te gee nie. Die terugbetaling beëindig ook die intekening, en die geld gaan terug na die kaart waarmee jy betaal het, gewoonlik binne 5 tot 10 werksdae.",
              "Ná 14 dae word betalings nie terugbetaal nie, tensy jy per fout gehef is of die wet waar jy woon dit vereis. Jy kan enige tyd kanselleer sodat die intekening nie hernu nie, en jy hou dit tot aan die einde van die tydperk waarvoor jy betaal het.",
              "In die iPhone- of iPad-app gekoop? Apple hanteer daardie terugbetalings by reportaproblem.apple.com.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Wat is hierdie heffing op my kaart?",
            a: [
              "Heffings verskyn as GADIT of GADIT.APP. Die bedrag stem ooreen met jou plan (Individual of Family, maandeliks of jaarliks) in jou land se geldeenheid, soos op die prysblad gewys. Intekeninge wat voor Oktober 2026 begin het, behou die prys waarmee hulle begin het. As die bedrag nie ooreenstem nie, kan dit van 'n ander diens wees.",
              "As jy seker is dit is nie joune nie, moet dit nog nie deur jou bank betwis nie. Skryf eers direk aan ons met die datum en bedrag. Die span sal dit opspoor, verduidelik wat dit is en terugbetaal indien nodig. 'n Bankgeskil kan toekomstige betalings moeiliker maak, so om dit deur ondersteuning op te los is gewoonlik vinniger en veiliger.",
            ],
          },
          {
            id: "failed-payment",
            q: "My betaling het misluk. Wat moet ek doen?",
            a: [
              "Stripe probeer mislukte betalings outomaties 'n paar keer oor die volgende dae weer. Die meeste mislukkings los vanself op sodra die bank die blokkering ophef of die kaart genoeg saldo het.",
              "Boaan die bladsy sal daar 'n balk wees wat sê die heffing het nie deurgegaan nie, en jou toegang bly nog 'n paar dae behoue. Tik daar op \"Werk kaart by\", voer 'n werkende kaart in, en ons sal die heffing dadelik daarop probeer. As jou intekening reeds na Basic teruggeskuif het, kan jy weer vanaf die Pryse-bladsy inteken en jou notaboek bly ongeskonde.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Wat is die verskil tussen Basic, Individual en Family?",
            a: [
              "Basic (gratis): tot 10 woordsoektogte per dag, elke betekenis, voorbeelde, idiome, die woord se oorsprong, die regte betekenis uit 'n sin, en 'n notaboek van tot 30 woorde.",
              "Individual: een persoon, elke leerhulpmiddel. Onbeperkte soektogte, 'n prent vir elke betekenis, meer voorbeelde en vrae oor elke woord, skryf 'n sin met terugvoer, Elke woord, Sê dit, 'n natuurlike voorleesstem en stemsoektog, vanlyn gebruik, speletjies, vasvrae en woordduelle, en slim oefening met toetsvoorbereiding en diktee.",
              "Family: alles in Individual vir tot 5 kinders en die ouers, plus Kindermodus, 'n eie plek vir elke kind, huiswerkhulp, en die ouerpaneel met 'n waarskuwing vir elke woord. Skole het hul eie plan. Die pryse vir jou land en die gratis proeftydperk van 14 dae is op die prysblad.",
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
            q: "Ek het nie my verifikasie-e-pos ontvang nie",
            a: [
              "Kyk eers in jou strooipos- en promosiesvouers. Gmail en Outlook stuur soms rekening-e-posse soontoe totdat jy een as \"Nie strooipos nie\" merk.",
              "As dit nie daar is nie, is die e-posadres dalk verkeerd getik by registrasie. Probeer weer registreer en kontroleer die adres noukeurig. As jy met Google geregistreer het, is geen verifikasie-e-pos nodig nie.",
            ],
          },
          {
            id: "forgot-password",
            q: "Ek het my wagwoord vergeet",
            a: [
              "Tik jou e-posadres in die aanmeldvenster in, en tik dan op \"Wagwoord vergeet?\". 'n Herstelskakel kom gewoonlik binne 'n minuut of twee in jou inkassie aan. Jy kan ook op \"Stuur vir my 'n aanmeldskakel per e-pos\" tik en sonder 'n wagwoord aanmeld.",
              "As die e-pos nie aankom nie, kyk in strooipos. As dit steeds nie aankom nie, het jy dalk met Google geregistreer in plaas van met e-pos en wagwoord. Probeer die \"Gaan voort met Google\"-knoppie.",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Ek is seker my wagwoord is reg, maar dit sê die e-posadres en wagwoord pas nie",
            a: [
              "Drie dinge om na te gaan. Eerstens, Caps Lock. Tweedens, 'n ekstra spasie aan die einde nadat jy gekopieer en geplak het. Derdens, jy het dalk met Google geregistreer eerder as met 'n wagwoord, gebruik dan eerder \"Gaan voort met Google\".",
              "Steeds vas? Tik in dieselfde boodskap op \"Stuur vir my 'n aanmeldskakel per e-pos\" om sonder 'n wagwoord in te kom, of op \"Kies 'n nuwe wagwoord\".",
            ],
          },
          {
            id: "google-fails",
            q: "Aanmelding met Google werk nie",
            a: [
              "Binne apps soos Instagram, Facebook of TikTok is die Google-knoppie versteek. Maak die skakel in jou gewone blaaier oop, of meld met jou e-posadres aan. As jy met Google aangesluit het, tik daardie e-posadres in en tik op \"Stuur vir my 'n aanmeldskakel per e-pos\".",
              "In 'n private venster kan geblokkeerde cookies Google-aanmelding keer, so probeer 'n gewone venster.",
            ],
          },
          {
            id: "change-email",
            q: "Hoe verander ek die e-posadres op my rekening?",
            a: [
              "Die span verander jou rekening se e-posadres. Stuur vir ons 'n e-pos vanaf jou huidige adres en skryf die nuwe adres in die boodskap. Die span sal dit opdateer, en jou intekening, geskiedenis en notaboek bly soos dit is.",
            ],
          },
          {
            id: "delete-account",
            q: "Hoe skrap ek my rekening?",
            a: [
              "Onderaan die Rekening-bladsy, tik op \"Skrap rekening\" en tik jou rekening se e-posadres in om te bevestig. Dit is permanent. Jou intekening word gekanselleer, jou notaboek en geskiedenis word uitgevee, en die e-posadres word vrygestel vir 'n nuwe registrasie.",
              "Die een uitsondering is 'n intekening wat in die App Store gekoop is. Om die rekening te skrap kanselleer dit nie, so kanselleer dit eers in jou Apple-intekeninginstellings.",
              "Rekords van vorige heffings bly, want die wet vereis dat ons dit vir rekeningkunde hou.",
            ],
          },
          {
            id: "share-account",
            q: "Kan my lewensmaat of kind my rekening deel?",
            a: [
              "Elke rekening het een persoon op 'n slag aangemeld. Vir 'n huishouding is die Family-plan juis hiervoor gebou: tot 5 kinders en die ouers, elkeen met 'n eie plek, 'n eie notaboek en vordering, plus Kindermodus vir die kinders en 'n ouerpaneel.",
              "Vir een volwassene alleen dek Individual een persoon met elke leerhulpmiddel. Vergelyk die planne en die pryse vir jou land op die prysblad.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Ek dink ek het per ongeluk twee rekeninge. Wat nou?",
            a: [
              "Dit gebeur gewoonlik wanneer iemand een keer met Google en een keer met e-pos en wagwoord registreer met dieselfde adres, of wanneer jy twee keer met verskillende e-posadresse registreer. Elke registrasie skep 'n aparte Gadit-rekening met sy eie notaboek, geskiedenis en intekeningstatus.",
              "Stuur vir ons 'n e-pos vanaf een van die twee adresse, en skryf die ander adres en watter rekening jy wil hou. Die span sal die notaboeke en geskiedenis saamvoeg op die rekening wat jy kies, en dan die ander een netjies sluit. Geen data gaan verlore nie.",
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
              "Langs elke betekenis, en op die idiome- en woordoorsprong-kaarte, is daar 'n klein vlagikoon. Tik daarop, kies wat verkeerd is, en voeg 'n kort nota by as jy wil. Dit gaan reguit na die span, en elke verslag word nagegaan.",
              "Moenie bekommerd wees dat jy te puntenerig is nie. Die woordeboek verbeter vinniger deur hierdie terugvoer as deur enigiets anders.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Kindermodus verander nie die verduideliking nie",
            a: [
              "Kindermodus verander net die teks waar die woord reeds 'n kindervriendelike verduideliking het. Vir 'n woord wat jy pas vir die eerste keer opgesoek het, gee dit 10 tot 15 sekondes terwyl die kindervriendelike weergawe voorberei word.",
              "Kindermodus is deel van die Family-plan. Op Individual sal jy eerder 'n \"In eenvoudige woorde\"-skakelaar sien, wat 'n eenvoudiger verduideliking van elke betekenis gee. Op Basic of sonder 'n rekening is daar geen skakelaar nie. Intekenaars wat voor Oktober 2026 by Clear of Deep aangesluit het, behou Kindermodus. Om dit te kry, kyk na Family op die prysblad.",
            ],
          },
          {
            id: "voice-fails",
            q: "Stemsoektog werk nie",
            a: [
              "Stemsoektog het mikrofoontoestemming nodig. Die meeste blaaiers vra een keer per webwerf. As jy dit per ongeluk geblokkeer het, tik op die ikoon langs gadit.app in die adresbalk en laat die mikrofoon in die werftoestemmings toe.",
              "Op iPhone en iPad moet jy ook die mikrofoon vir Safari in die toestel se Instellings-app toelaat. Stemsoektog is deel van die Individual- en Family-planne, so op Basic en sonder 'n rekening verskyn die mikrofoonknoppie nie. Om op te gradeer, maak die prysblad oop.",
            ],
          },
          {
            id: "no-image",
            q: "Ek kan nie 'n prent vir die woord kry nie",
            a: [
              "Prente is deel van die Individual- en Family-planne, met tot 100 nuwe prente per maand. 'n Prent wat reeds vir daardie betekenis bestaan, maak oop sonder om te tel. Die ouer Clear-plan het 30 per maand, en Basic sluit nie prente in nie. Wanneer die maand se prente opgebruik is, sien jy 'n kennisgewing, en die telling begin weer aan die begin van elke maand.",
              "As jy onder die kwota is en steeds mislukkings sien, is dit gewoonlik tydelik. Probeer weer oor 30 sekondes. Aanhoudende mislukkings is 'n fout. Rapporteer dit asseblief vanaf die woordbladsy.",
            ],
          },
          {
            id: "save-word",
            q: "Hoe stoor ek 'n woord in my notaboek?",
            a: [
              "Dit hoef jy nie te doen nie. Wanneer jy aangemeld is, word elke woord wat jy opsoek vanself in jou notaboek gestoor. Op Basic hou die notaboek tot 30 woorde. Op Individual en Family is daar geen beperking nie, en dit sluit slim oefening in, wat jou woorde op die regte tyd terugbring vir hersiening.",
              "Op Individual en Family word die woorde wat jy opsoek ook op jou toestel gehou, so hulle maak sonder internet oop. Om jou woorde te sien, maak die notaboek vanuit die kieslys oop.",
            ],
          },
          {
            id: "offline",
            q: "Hoe gebruik ek Gadit vanlyn?",
            a: [
              "Vanlyn gebruik is deel van die Individual- en Family-planne. Elke woord wat jy opsoek, word op jou toestel gehou, so dit maak weer onmiddellik sonder internet oop. Jy kan ook op \"Laai vanlyn-pak af\" op jou Rekening-bladsy tik om ons woordeboek se woorde in jou taal op hierdie toestel te stoor.",
              "Om 'n splinternuwe woord op te soek, vereis steeds 'n verbinding, want Gadit moet die volledige resultaat daarvoor voorberei. Die vanlyn kopie dek die woorde wat reeds op jou toestel is. As jy op Basic is, kyk na die planne op die prysblad.",
            ],
          },
          {
            id: "slow",
            q: "Die toep voel stadig",
            a: [
              "Die eerste soektog van 'n woord is die stadigste omdat Gadit die volledige resultaat van nuuts af skep: gewoonlik 'n paar sekondes, soms langer vir komplekse woorde. Latere soektogte van dieselfde woord is onmiddellik, uit die kas bedien.",
              "As alles stadig voel, probeer 'n harde herlaai: Cmd+Shift+R op Mac, Ctrl+Shift+R op Windows. As die stadigheid oor verskeie bladsye voortduur, e-pos ons asseblief met jou land en blaaier sodat die span die netwerkroete van jou streek na ons bedieners kan nagaan.",
            ],
          },
          {
            id: "word-not-found",
            q: "Ek het 'n woord gesoek en geen resultaat gekry nie. Wat gaan aan?",
            a: [
              "Kontroleer eers die spelling. As daar 'n tikfout was, wys Gadit gewoonlik die reggestelde woord, met 'n skakel om tog te soek vir wat jy getik het.",
              "Baie skaars woorde of slengwoorde kry nie altyd 'n resultaat nie. As jy seker is die woord bestaan, skryf vir ons vanaf hierdie bladsy en die span sal dit nagaan.",
            ],
          },
          {
            id: "change-language",
            q: "Hoe verander ek die koppelvlaktaal?",
            a: [
              "Boaan die bladsy is daar 'n aardbol-ikoon met jou huidige taal. Tik daarop en kies 'n taal.",
              "Jou keuse word op hierdie toestel gestoor. Alles herlaai in die nuwe taal: die koppelvlak, die kieslyste, toekomstige woorddefinisies, voorbeelde, kinderverduidelikings, selfs die woord se oorsprong. Woorde wat jy reeds in die ou taal opgesoek het, wys daarin totdat jy weer daarvoor soek.",
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
              "Gaan na gadit.app/partners en tik op \"Sluit gratis aan\". Vul jou naam en e-posadres in, en tik dan op \"Kry my vennootkode\". Jou persoonlike skakel en vennootpaneelbord, met klikke en kommissies, is dadelik gereed, sonder wagtyd vir goedkeuring. Die kode en skakel kom ook per e-pos aan.",
              "Aansluiting is gratis en oop vir enigiemand. Jy het nie 'n Gadit-intekening nodig om 'n vennoot te word nie.",
            ],
          },
          {
            id: "commission-model",
            q: "Hoe word kommissies bereken?",
            a: [
              "Die standaardvoorwaardes is 25% van elke betaling wat 'n kliënt in hul eerste jaar maak. Na daardie eerste jaar verdien jy 10% van elke betaling solank die kliënt aanhou betaal. Bring 5 betalende kliënte in en jou aandeel na die eerste jaar styg lewenslank na 15%.",
              "Dit werk dieselfde vir maandelikse en jaarlikse planne, want kommissie word op elke werklike betaling bereken. As 'n kliënt kanselleer, stop jou kommissie met hul laaste betaling.",
              "Die span kan ander tariewe vir spesifieke vennote stel. Jou eie tariewe verskyn altyd op jou vennootpaneelbord.",
            ],
          },
          {
            id: "payout",
            q: "Wanneer word ek betaal?",
            a: [
              "Een keer per maand, sonder 'n minimum. Elke kommissie word 30 dae ná die klant se betaling betaalbaar, en alles wat betaalbaar is, word in die volgende maandelikse uitbetaling gestuur na die PayPal-rekening wat jy in jou vennootpaneelbord ingestel het.",
              "Ons betaal in die geldeenheid waarin die klant betaal het wanneer PayPal dit kan stuur, en andersins in Amerikaanse dollars, teen die wisselkoers op die dag wat ons betaal.",
              "Kommissies wag 30 dae weens terugbetalings: as 'n klant se betaling terugbetaal word, word die kommissie daarop gekanselleer. Dus word 'n kommissie op 'n Januarie-betaling in Februarie betaalbaar en gaan dit uit in die volgende maandelikse uitbetaling.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Ek het aangesluit, maar my paneelbord is leeg",
            a: [
              "Statistieke verskyn na die eerste klik op jou skakel. Leeg beteken net dat nog niemand geklik het nie. Gaan deel die skakel. Die paneelbord werk byna intyds by sodra daar aktiwiteit is.",
              "As jy gedeel het en iemand geregistreer het, maar die paneelbord wys dit nie, skryf aan ons met die benaderde tyd van registrasie en die span sal nagaan waar die registrasie vandaan gekom het.",
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
            q: "Iemand het deur my skakel geregistreer, maar ek sien nie die kommissie nie",
            a: [
              "Meestal gaan dit oor tydsberekening. Die registrasie verskyn binne minute op die paneelbord, maar die kommissie word eers geboek wanneer die intekening werklik betaal is, wat dae later kan wees as hulle op 'n gratis proeftydperk is. Kyk weer nadat die proeftydperk verby is.",
              "As die intekening betaal is, maar jy sien ná 48 uur steeds nie die kommissie nie, skryf aan ons met die benaderde registrasietyd en die e-posadres of benaderde naam van die intekenaar as jy dit weet. Die span sal nagaan waar die registrasie vandaan gekom het en enige gemis handmatig regstel.",
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
              "Gadit help jou om elke woord deur en deur te verstaan, nie net 'n eenreël-definisie te kry nie. Elke woord maak oop met al sy betekenisse, regte voorbeelde vir elke betekenis, idiome en die woord se oorsprong. Die betaalde planne voeg 'n prent vir elke betekenis, oefening, speletjies en meer by, en Family voeg Kindermodus en 'n eie plek vir elke kind by.",
              "Gadit werk in 41 tale. Intern noem die span dit om 'n woord te GAD: om 'n woord deur en deur te verstaan, nie net te vertaal nie. Om te sien wat elke plan insluit, maak die prysblad oop.",
            ],
          },
          {
            id: "languages",
            q: "Watter tale ondersteun julle?",
            a: [
              "Gadit werk in 41 tale, onder meer Engels, Hebreeus, Arabies, Spaans, Frans, Duits, Russies, Chinees, Japannees, Hindi, isiZulu, isiXhosa en Afrikaans.",
              "Jy kan 'n woord in enige van hierdie tale opsoek en die betekenisse, voorbeelde en alles anders kry in die taal wat jy vir die koppelvlak gekies het. Hebreeus, Arabies en Persies lees van regs na links, met hul eie lettertipes. Om te verander, tik op die taalknoppie bo-aan enige bladsy.",
            ],
          },
          {
            id: "kid-safety",
            q: "Is Gadit veilig vir kinders?",
            a: [
              "Gadit is ontwerp sodat 'n ouer dit veilig saam met 'n kind kan gebruik. Kindermodus lewer verduidelikings wat eenvoudig, konkreet en ouderdomsgepas is, rondom die vlak van 5 tot 10 jaar oud, met dieselfde enjin wat volwasse inhoud aandryf, maar met uitdruklike instruksies om te vereenvoudig. Geen gebruikersgegenereerde inhoud word ooit aan kinders gewys nie.",
              "'n Rekening van jou eie is vir volwassenes, 18 en ouer. Kinders en tieners gebruik Gadit deur 'n volwassene. By die huis voeg 'n ouer elke kind op die Family-bladsy by, elke kind kry 'n eie plek met Kindermodus, en die ouerpaneel wys die woorde wat elke kind opsoek. By die skool kry die klas 'n skakel van die onderwyser, en leerders sluit aan sonder 'n rekening of 'n e-posadres.",
            ],
          },
          {
            id: "data",
            q: "Waar word my data gestoor? Verkoop julle dit?",
            a: [
              "Rekening, geskiedenis, notaboek en geskepte prente word veilig in Firebase gestoor, geënkripteer in berging. Ons verkoop nie jou data aan enigiemand nie. Ons deel net wat nodig is om Gadit te bedryf (berging, betalings, inhoudverskaffers), soos uiteengesit in die Privaatheidsbeleid.",
              "Jy kan jou rekening enige tyd vanaf die Rekening-bladsy skrap. Om 'n kopie van jou notaboek of enige ander data wat ons hou te kry, skryf aan ons vanaf hierdie bladsy.",
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
    heading: "Pata jibu, haraka",
    lede: "Maswali ya kawaida na suluhisho hatua kwa hatua, yamepangwa kwa maeneo. Ikiwa huoni tatizo lako, wasiliana na timu chini ya ukurasa.",
    stillNeedHelpHeading: "Bado umekwama?",
    stillNeedHelpBody: "Tuandikie moja kwa moja. Kila ujumbe husomwa na timu na kwa kawaida hujibiwa ndani ya siku moja au mbili.",
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
              "Unaweza kuhamia kadi mpya kwa chini ya dakika moja bila kughairi. Usajili wako wa sasa unaendelea tu, ila kwa kadi mpya.",
              "1. Ingia kwenye gadit.app na ufungue \"Akaunti\" kutoka kwenye menyu ya akaunti. 2. Bofya \"Dhibiti malipo\". 3. Ukurasa salama wa Stripe utafunguka. Ongeza kadi mpya kama njia ya malipo na uiweke kama chaguo-msingi. 4. Ukipenda, ondoa kadi ya zamani.",
              "Kuanzia mzunguko ujao wa malipo, kila kitu kitaenda kwenye kadi mpya. Malipo ya awali, ambayo tayari yamekusanywa, yanabaki kwenye kadi ya zamani. Kubadilisha kadi hakuahamishi malipo hayo wala hakubadilishi tarehe yako ijayo ya malipo.",
            ],
          },
          {
            id: "cancel",
            q: "Ninaghairi vipi usajili wangu?",
            a: [
              "Unaweza kufanya mwenyewe, wakati wowote. Ingia, fungua Akaunti, kisha gusa Ghairi usajili chini ya mpango wako.",
              "Ulinunua usajili wako katika programu ya iPhone au iPad? Ughairi kwenye mipangilio yako ya usajili ya Apple. Kiungo cha \"Dhibiti usajili\" kwenye ukurasa wako wa Akaunti kinakupeleka huko.",
              "Kwenye usajili unaolipiwa, ufikiaji wako unaendelea hadi mwisho wa kipindi ulicholipia tayari. Baada ya hapo akaunti inahamia Basic, bila malipo. Maneno uliyohifadhi na historia yako vinabaki salama.",
              "Wakati wa jaribio la bure la siku 14, kughairi kunamaliza jaribio papo hapo na hakuna malipo yoyote. Kama wasiwasi wako pekee ni malipo ya kiotomatiki, chagua sababu hiyo kwenye dirisha la kughairi na badala yake unaweza kuzima usasishaji, ukiendelea na jaribio hadi siku yake ya mwisho.",
              "Ukighairi usajili unaolipiwa kwa makosa au ukibadilisha nia, unaweza kuuendeleza kutoka ukurasa huo huo kabla kipindi hakijaisha.",
            ],
          },
          {
            id: "switch-plan",
            q: "Ninahamaje kati ya Individual na Family?",
            a: [
              "Ili kuhamia Family, fungua ukurasa wako wa Akaunti kisha uguse \"Badili hadi Family\". Usajili wako wa sasa unasasishwa kwenye kadi hiyo hiyo, bila kuiingiza tena.",
              "Stripe hukokotoa tofauti kwa siku zilizobaki kwenye kipindi cha sasa, kwa hivyo unalipa tofauti tu. Ili kuhama kutoka Family kwenda Individual, tuandikie kutoka ukurasa huu na timu itakuhamisha.",
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
              "Ndiyo, ndani ya siku 14 tangu malipo ya kwanza kwenye akaunti yako, au tangu usasishaji wa mwaka. Tuandikie kwa support@gadit.app kutoka kwenye barua pepe ya akaunti yako na tutarejesha malipo hayo yote. Huhitaji kutoa sababu. Marejesho pia husitisha usajili, na pesa hurudi kwenye kadi uliyolipia, kwa kawaida ndani ya siku 5 hadi 10 za kazi.",
              "Baada ya siku 14, malipo hayarejeshwi, isipokuwa ulitozwa kimakosa au sheria ya mahali unapoishi inahitaji hivyo. Unaweza kughairi wakati wowote ili usajili usijisasishe, na utaendelea nao hadi mwisho wa kipindi ulicholipia.",
              "Ulinunua kwenye programu ya iPhone au iPad? Apple hushughulikia marejesho hayo kwenye reportaproblem.apple.com.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Malipo haya kwenye kadi yangu ni ya nini?",
            a: [
              "Malipo huonekana kama GADIT au GADIT.APP. Kiasi kinalingana na mpango wako (Individual au Family, kila mwezi au kila mwaka) kwa sarafu ya nchi yako, kama inavyoonyeshwa kwenye ukurasa wa bei. Usajili ulioanza kabla ya Oktoba 2026 unaendelea na bei uliyoanza nayo. Kama kiasi hakilingani, huenda ni cha huduma nyingine.",
              "Ikiwa una uhakika si yako, usiyapinge kupitia benki yako bado. Tuandikie moja kwa moja kwanza ukitaja tarehe na kiasi. Timu itayatafuta, itaeleza ni nini, na itarejesha pesa ikihitajika. Mgogoro wa benki unaweza kufanya malipo ya baadaye kuwa magumu zaidi, kwa hiyo kutatua kupitia huduma kwa wateja kwa kawaida ni haraka na salama zaidi.",
            ],
          },
          {
            id: "failed-payment",
            q: "Malipo yangu yameshindikana. Nifanye nini?",
            a: [
              "Stripe hujaribu tena malipo yaliyoshindikana kiotomatiki mara kadhaa katika siku zinazofuata. Mara nyingi tatizo hujitatua lenyewe benki inapoondoa kizuizi au kadi inapokuwa na salio la kutosha.",
              "Utaona ujumbe juu ya ukurasa ukisema malipo hayakupita, na ufikiaji wako utaendelea kwa siku chache zaidi. Gusa \"Sasisha kadi\" hapo, weka kadi inayofanya kazi, na tutajaribu malipo hapo hapo. Ikiwa usajili wako tayari umerudi kwenye Basic, unaweza kujisajili tena kutoka ukurasa wa Bei na daftari lako litabaki salama.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Kuna tofauti gani kati ya Basic, Individual na Family?",
            a: [
              "Basic (bila malipo): hadi utafutaji 10 wa maneno kwa siku, kila maana, mifano, nahau, chimbuko la neno, maana sahihi kutoka kwenye sentensi, na daftari la hadi maneno 30.",
              "Individual: mtu mmoja, kila zana ya kujifunza. Utafutaji bila kikomo, picha kwa kila maana, mifano na maswali zaidi kuhusu kila neno, tunga sentensi ukipata maoni, Kila neno, Sema, sauti ya asili ya kusoma kwa sauti na utafutaji kwa sauti, matumizi bila intaneti, michezo, majaribio na duwa za maneno, na mazoezi mahiri yenye maandalizi ya mitihani na imla.",
              "Family: kila kitu cha Individual kwa hadi watoto 5 na wazazi, pamoja na Hali ya Watoto, nafasi binafsi kwa kila mtoto, msaada wa kazi ya nyumbani, na ubao wa mzazi wenye arifa kwa kila neno. Shule zina mpango wao wenyewe. Bei za nchi yako na jaribio la bure la siku 14 ziko kwenye ukurasa wa bei.",
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
            q: "Sikupokea barua pepe ya uthibitisho",
            a: [
              "Angalia kwanza folda za barua taka na matangazo. Gmail na Outlook wakati mwingine hupeleka barua pepe za akaunti huko hadi utakapoweka alama kwenye moja kuwa \"Si barua taka\".",
              "Ikiwa haipo huko, huenda barua pepe iliandikwa vibaya wakati wa kujisajili. Jaribu kujisajili tena na uhakiki anwani kwa makini. Ikiwa ulijisajili kwa Google, hakuna haja ya barua pepe ya uthibitisho.",
            ],
          },
          {
            id: "forgot-password",
            q: "Nimesahau nenosiri langu",
            a: [
              "Kwenye dirisha la kuingia, andika barua pepe yako, kisha gusa \"Umesahau nywila?\". Kiungo cha kuweka upya kwa kawaida hufika kwenye kikasha chako ndani ya dakika moja au mbili. Unaweza pia kugusa \"Nitumie kiungo cha kuingia kwa barua pepe\" na kuingia bila nenosiri.",
              "Ikiwa barua pepe haifiki, angalia barua taka. Ikiwa bado haifiki, huenda ulijisajili kwa Google badala ya barua pepe na nenosiri. Jaribu kitufe cha \"Endelea na Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Nina uhakika nenosiri langu ni sahihi, lakini inasema barua pepe na nenosiri havilingani",
            a: [
              "Mambo matatu ya kukagua. Kwanza, Caps Lock. Pili, nafasi ya ziada mwishoni baada ya kunakili na kubandika. Tatu, huenda ulijisajili kwa Google badala ya nenosiri, tumia \"Endelea na Google\" badala yake.",
              "Bado umekwama? Kwenye ujumbe huo huo gusa \"Nitumie kiungo cha kuingia kwa barua pepe\" ili kuingia bila nenosiri, au \"Chagua nenosiri jipya\".",
            ],
          },
          {
            id: "google-fails",
            q: "Kuingia kwa Google hakufanyi kazi",
            a: [
              "Ndani ya programu kama Instagram, Facebook au TikTok, kitufe cha Google hufichwa. Fungua kiungo kwenye kivinjari chako cha kawaida, au ingia kwa barua pepe yako. Ikiwa ulijiunga kwa Google, andika barua pepe hiyo na uguse \"Nitumie kiungo cha kuingia kwa barua pepe\".",
              "Kwenye dirisha la faragha, incognito, cookies zilizozuiwa zinaweza kuzuia kuingia kwa Google, kwa hiyo jaribu dirisha la kawaida.",
            ],
          },
          {
            id: "change-email",
            q: "Ninabadilishaje barua pepe kwenye akaunti yangu?",
            a: [
              "Kubadilisha barua pepe ya akaunti yako hufanywa na timu. Tutumie barua pepe kutoka kwenye anwani yako ya sasa na uandike anwani mpya kwenye ujumbe. Timu itaisasisha, na usajili wako, historia na daftari vitabaki kama vilivyo.",
            ],
          },
          {
            id: "delete-account",
            q: "Ninafutaje akaunti yangu?",
            a: [
              "Chini ya ukurasa wa \"Akaunti\", gusa \"Futa akaunti\" na uandike barua pepe ya akaunti yako ili kuthibitisha. Hii ni ya kudumu, usajili wako unaghairiwa, daftari na historia yako vinafutwa, na barua pepe inaachiliwa kwa ajili ya usajili mpya.",
              "Isipokuwa moja ni usajili ulionunuliwa katika App Store, kufuta akaunti hakughairi usajili huo, kwa hiyo ughairi kwanza kwenye mipangilio yako ya usajili ya Apple.",
              "Kumbukumbu za malipo ya zamani zinabaki, kwa sababu sheria inatutaka tuzihifadhi kwa ajili ya uhasibu.",
            ],
          },
          {
            id: "share-account",
            q: "Je, mwenzi wangu au mtoto wangu anaweza kutumia akaunti yangu pamoja nami?",
            a: [
              "Kila akaunti ina mtu mmoja aliyeingia kwa wakati mmoja. Kwa familia, mpango wa Family umejengwa kwa ajili ya hili: hadi watoto 5 na wazazi, kila mmoja akiwa na nafasi yake binafsi, daftari na maendeleo yake, pamoja na Hali ya Watoto kwa watoto na ubao wa mzazi.",
              "Kwa mtu mzima mmoja peke yake, Individual inamhudumia mtu mmoja kwa kila zana ya kujifunza. Linganisha mipango na bei za nchi yako kwenye ukurasa wa bei.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Nadhani nina akaunti mbili kwa makosa. Sasa nifanye nini?",
            a: [
              "Hii kwa kawaida hutokea mtu anapojisajili mara moja kwa Google na mara moja kwa barua pepe na nenosiri akitumia anwani ile ile, au unapojisajili mara mbili kwa anwani tofauti za barua pepe. Kila usajili huunda akaunti tofauti ya Gadit yenye daftari, historia na hali ya usajili yake.",
              "Tutumie barua pepe kutoka kwenye mojawapo ya anwani hizo mbili, na uandike anwani nyingine pamoja na akaunti ungependa kubaki nayo. Timu itaunganisha madaftari na historia kwenye akaunti utakayochagua, kisha itafunga nyingine vizuri. Hakuna data itakayopotea.",
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
              "Kando ya kila maana, na pia kwenye kadi za nahau na chimbuko la neno, kuna aikoni ndogo ya bendera. Iguse, chagua kisicho sahihi, na ukitaka ongeza maelezo mafupi. Inafika moja kwa moja kwa timu, na kila ripoti hupitiwa.",
              "Usijali kuwa makini kupita kiasi. Kamusi huboreka kutokana na maoni haya haraka kuliko kitu kingine chochote.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Hali ya Watoto haibadilishi maelezo",
            a: [
              "Hali ya Watoto hubadilisha maandishi tu pale ambapo neno tayari lina maelezo yanayofaa watoto. Kwa neno ambalo umelitafuta sasa hivi kwa mara ya kwanza, subiri sekunde 10 hadi 15 wakati toleo linalofaa watoto linaandaliwa.",
              "Hali ya Watoto ni sehemu ya mpango wa Family. Kwenye Individual utaona swichi ya \"Kwa maneno rahisi\" badala yake, ambayo huonyesha maelezo rahisi zaidi ya kila maana. Kwenye Basic au bila akaunti hakuna swichi. Waliojisajili kwenye Clear au Deep kabla ya Oktoba 2026 wanaendelea kuwa na Hali ya Watoto. Ili kuipata, angalia Family kwenye ukurasa wa bei.",
            ],
          },
          {
            id: "voice-fails",
            q: "Utafutaji kwa sauti haufanyi kazi",
            a: [
              "Utafutaji kwa sauti unahitaji ruhusa ya kipaza sauti. Vivinjari vingi huuliza mara moja kwa kila tovuti. Ikiwa uliizuia kwa bahati mbaya, gusa aikoni iliyo kando ya gadit.app kwenye upau wa anwani na uruhusu kipaza sauti kwenye ruhusa za tovuti.",
              "Kwenye iPhone na iPad, pia ruhusu kipaza sauti kwa Safari kwenye programu ya Mipangilio ya kifaa. Utafutaji kwa sauti ni sehemu ya mipango ya Individual na Family, kwa hiyo kwenye Basic na bila akaunti kitufe cha kipaza sauti hakionekani. Ili kuboresha, fungua ukurasa wa bei.",
            ],
          },
          {
            id: "no-image",
            q: "Siwezi kupata picha ya neno",
            a: [
              "Picha ni sehemu ya mipango ya Individual na Family, zikiwa hadi picha mpya 100 kwa mwezi. Picha ambayo tayari ipo kwa maana hiyo hufunguka bila kuhesabiwa. Mpango wa zamani wa Clear una picha 30 kwa mwezi, na Basic haina picha. Picha za mwezi zikiisha utaona taarifa, na hesabu huanza upya mwanzoni mwa kila mwezi.",
              "Ikiwa hujafikia kiwango na bado unaona hitilafu, kwa kawaida ni ya muda tu. Jaribu tena baada ya sekunde 30. Hitilafu zinazoendelea ni kasoro ya mfumo. Tafadhali ripoti kutoka ukurasa wa neno.",
            ],
          },
          {
            id: "save-word",
            q: "Ninahifadhije neno kwenye daftari langu?",
            a: [
              "Huhitaji kufanya hivyo. Ukiwa umeingia, kila neno unalotafuta huhifadhiwa kwenye daftari lako lenyewe. Kwenye Basic daftari linabeba hadi maneno 30. Kwenye Individual na Family halina kikomo na lina mazoezi mahiri, yanayorudisha maneno yako ili uyapitie kwa wakati unaofaa.",
              "Kwenye Individual na Family, maneno unayotafuta pia huwekwa kwenye kifaa chako, kwa hivyo hufunguka bila intaneti. Ili kuona maneno yako, fungua daftari kutoka kwenye menyu.",
            ],
          },
          {
            id: "offline",
            q: "Hali ya nje ya mtandao inafanyaje kazi?",
            a: [
              "Matumizi bila intaneti ni sehemu ya mipango ya Individual na Family. Kila neno unalotafuta huwekwa kwenye kifaa chako, kwa hivyo hufunguka tena papo hapo bila intaneti. Unaweza pia kugusa \"Pakua kifurushi cha nje ya mtandao\" kwenye ukurasa wako wa Akaunti ili kuhifadhi maneno ya kamusi yetu katika lugha yako kwenye kifaa hiki.",
              "Kutafuta neno jipya kabisa bado kunahitaji muunganisho, kwa sababu Gadit lazima iandae matokeo kamili ya neno hilo. Nakala ya nje ya mtandao inajumuisha maneno ambayo tayari yako kwenye kifaa chako. Kama uko kwenye Basic, angalia mipango kwenye ukurasa wa bei.",
            ],
          },
          {
            id: "slow",
            q: "Programu inaonekana kuwa polepole",
            a: [
              "Utafutaji wa kwanza wa neno ndio wa polepole zaidi kwa sababu Gadit huunda matokeo kamili kuanzia mwanzo: kwa kawaida sekunde chache, wakati mwingine zaidi kwa maneno magumu. Utafutaji unaofuata wa neno hilo hilo ni wa papo hapo, kutoka kwenye akiba.",
              "Ikiwa kila kitu kiko polepole, jaribu kupakia upya kikamilifu: Cmd+Shift+R kwenye Mac, Ctrl+Shift+R kwenye Windows. Ikiwa hali hiyo inaendelea kwenye kurasa nyingi, tafadhali tutumie barua pepe ukitaja nchi yako na kivinjari ili timu ikague njia ya mtandao kutoka eneo lako hadi kwenye seva zetu.",
            ],
          },
          {
            id: "word-not-found",
            q: "Nilitafuta neno na sikupata matokeo. Kuna nini?",
            a: [
              "Kwanza, kagua tahajia. Ikiwa kulikuwa na kosa la kuandika, Gadit kwa kawaida huonyesha neno lililosahihishwa, pamoja na kiungo cha kutafuta tena ulichoandika.",
              "Maneno adimu sana au ya misimu hayapati matokeo kila wakati. Ikiwa una uhakika neno lipo, tuandikie kutoka kwenye ukurasa huu na timu itakagua.",
            ],
          },
          {
            id: "change-language",
            q: "Ninabadilishaje lugha ya kiolesura?",
            a: [
              "Juu ya ukurasa kuna aikoni ya duara la dunia yenye lugha yako ya sasa. Iguse na uchague lugha.",
              "Chaguo lako huhifadhiwa kwenye kifaa hiki. Kila kitu hupakia upya kwa lugha mpya, kiolesura, menyu, maana za maneno za baadaye, mifano, maelezo ya watoto, hata chimbuko la neno. Maneno ambayo tayari ulitafuta kwa lugha ya zamani yataendelea kuonekana hivyo mpaka uyatafute tena.",
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
              "Nenda kwenye gadit.app/partners na ubofye \"Jiunge bure\". Weka jina lako na barua pepe, kisha ubofye \"Pata msimbo wangu wa mshirika\". Kiungo chako binafsi na dashibodi ya mshirika, yenye mibofyo na kamisheni, vitakuwa tayari papo hapo, bila kusubiri idhini. Msimbo na kiungo pia vitatumwa kwa barua pepe.",
              "Kujiunga ni bure na kuko wazi kwa yeyote. Huhitaji usajili wa Gadit ili kuwa mshirika.",
            ],
          },
          {
            id: "commission-model",
            q: "Kamisheni hukokotolewa vipi?",
            a: [
              "Masharti ya kawaida ni 25% ya kila malipo ambayo mteja hufanya katika mwaka wake wa kwanza. Baada ya mwaka huo wa kwanza, unapata 10% ya kila malipo kwa muda wote ambao mteja anaendelea kulipa. Ukileta wateja 5 wanaolipa, sehemu yako baada ya mwaka wa kwanza inapanda hadi 15% maisha yote.",
              "Hii inafanya kazi vivyo hivyo kwa mipango ya kila mwezi na ya kila mwaka, kwa sababu kamisheni huhesabiwa kwa kila malipo halisi. Mteja akighairi, kamisheni yako inakoma na malipo yake ya mwisho.",
              "Timu inaweza kuweka viwango tofauti kwa washirika fulani. Viwango vyako mwenyewe huonekana kila wakati kwenye dashibodi yako ya mshirika.",
            ],
          },
          {
            id: "payout",
            q: "Ninalipwa lini?",
            a: [
              "Mara moja kwa mwezi, bila kiwango cha chini. Kila kamisheni hulipwa siku 30 baada ya malipo ya mteja, na kila kinachostahili hulipwa kwenye malipo ya kila mwezi yanayofuata kwenda kwenye akaunti ya PayPal uliyoweka kwenye dashibodi yako ya mshirika.",
              "Tunalipa kwa sarafu ambayo mteja alilipa nayo wakati PayPal inaweza kuituma, na vinginevyo kwa dola za Marekani, kwa kiwango cha ubadilishaji cha siku tunayolipa.",
              "Kamisheni husubiri siku 30 kwa sababu ya marejesho ya pesa. Ikiwa malipo ya mteja yanarejeshwa, kamisheni yake hubatilishwa. Kwa hiyo kamisheni ya malipo ya Januari hulipwa Februari na hutumwa kwenye malipo ya kila mwezi yanayofuata.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Nimejiunga lakini dashibodi yangu haina kitu",
            a: [
              "Takwimu huonekana baada ya mbofyo wa kwanza kwenye kiungo chako. Kuwa tupu kunamaanisha tu kwamba bado hakuna aliyebofya. Nenda ukashiriki kiungo. Dashibodi husasishwa karibu papo hapo shughuli zikianza.",
              "Ikiwa umeshiriki na mtu amejisajili lakini dashibodi haionyeshi hivyo, tuandikie ukitaja muda wa takriban wa kujisajili na timu itakagua kilikotoka kujisajili.",
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
            q: "Mtu amejisajili kupitia kiungo changu lakini sioni kamisheni",
            a: [
              "Mara nyingi ni suala la muda. Usajili huonekana kwenye dashibodi ndani ya dakika chache, lakini kamisheni hurekodiwa tu usajili unapolipiwa kweli, jambo ambalo linaweza kuwa siku kadhaa baadaye ikiwa wako kwenye kipindi cha majaribio bila malipo. Angalia tena baada ya kipindi cha majaribio kuisha.",
              "Ikiwa usajili umelipiwa lakini bado huoni kamisheni baada ya saa 48, tuandikie ukitaja muda wa takriban wa kujisajili na barua pepe au jina la takriban la mteja ikiwa unalijua. Timu itakagua usajili ulitoka wapi na kurekebisha kosa lolote kwa mikono.",
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
              "Gadit inakusaidia kuelewa kila neno hadi mwisho, si kupata tu maana ya mstari mmoja. Kila neno hufunguka likiwa na maana zake zote, mifano halisi kwa kila maana, nahau na chimbuko la neno. Mipango ya kulipia inaongeza picha kwa kila maana, mazoezi, michezo na zaidi, na Family inaongeza Hali ya Watoto na nafasi binafsi kwa kila mtoto.",
              "Gadit inafanya kazi katika lugha 41. Ndani ya timu tunaita hivi kufanya GAD kwa neno: kuelewa neno hadi mwisho, si kulitafsiri tu. Ili kuona kila mpango unajumuisha nini, fungua ukurasa wa bei.",
            ],
          },
          {
            id: "languages",
            q: "Mnaunga mkono lugha zipi?",
            a: [
              "Gadit inafanya kazi katika lugha 41, zikiwemo Kiingereza, Kiebrania, Kiarabu, Kihispania, Kifaransa, Kijerumani, Kirusi, Kichina, Kijapani, Kihindi, isiZulu, isiXhosa na Kiafrikana.",
              "Unaweza kutafuta neno katika lugha yoyote kati ya hizi na kupata maana, mifano na kila kitu kingine katika lugha uliyochagua kwa kiolesura. Kiebrania, Kiarabu na Kiajemi husomwa kutoka kulia kwenda kushoto, kwa fonti zake. Ili kubadilisha, gusa kitufe cha lugha juu ya ukurasa wowote.",
            ],
          },
          {
            id: "kid-safety",
            q: "Je, Gadit ni salama kwa watoto?",
            a: [
              "Gadit imeundwa ili mzazi aitumie kwa usalama pamoja na mtoto. Hali ya Watoto hutoa maelezo rahisi, ya moja kwa moja, na yanayofaa umri, karibu kiwango cha watoto wa miaka 5 hadi 10, ikitumia injini ile ile inayoendesha maudhui ya watu wazima ikiwa na maagizo ya wazi ya kurahisisha. Maudhui yanayoundwa na watumiaji hayaonyeshwi kamwe kwa watoto.",
              "Akaunti yako mwenyewe ni ya watu wazima, wenye miaka 18 na zaidi. Watoto na vijana hutumia Gadit kupitia mtu mzima. Nyumbani, mzazi humwongeza kila mtoto kwenye ukurasa wa Family, kila mtoto anapata nafasi yake mwenyewe yenye Hali ya Watoto, na ubao wa mzazi unaonyesha maneno ambayo kila mtoto anatafuta. Shuleni, darasa hupata kiungo kutoka kwa mwalimu, na wanafunzi hujiunga bila akaunti wala barua pepe.",
            ],
          },
          {
            id: "data",
            q: "Data yangu inahifadhiwa wapi? Je, mnaiuza?",
            a: [
              "Akaunti, historia, daftari, na picha zilizoundwa huhifadhiwa kwa usalama kwenye Firebase, zikiwa zimesimbwa fiche katika hifadhi. Hatuuzi data yako kwa mtu yeyote. Tunashiriki tu kile kinachohitajika kuendesha Gadit (hifadhi, malipo, watoa maudhui), kama ilivyoelezwa kwenye Sera ya Faragha.",
              "Unaweza kufuta akaunti yako wakati wowote kutoka ukurasa wa Akaunti. Ili kupata nakala ya daftari lako au data nyingine yoyote tuliyonayo, tuandikie kutoka ukurasa huu.",
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
    heading: "Find et svar, hurtigt",
    lede: "Almindelige spørgsmål og løsninger trin for trin, ordnet efter emne. Hvis du ikke kan se dit problem, så kontakt teamet nederst på siden.",
    stillNeedHelpHeading: "Sidder du stadig fast?",
    stillNeedHelpBody: "Skriv direkte til os. Teamet læser hver eneste besked og svarer som regel inden for en dag eller to.",
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
              "Du kan skifte til et nyt kort på under et minut uden at opsige. Dit nuværende abonnement fortsætter, bare på det nye kort.",
              "1. Log ind på gadit.app, og åbn \"Konto\" fra kontomenuen. 2. Klik på \"Administrer betaling\". 3. En sikker Stripe-side åbnes. Tilføj det nye kort som betalingsmetode, og markér det som standard. 4. Fjern eventuelt det gamle kort.",
              "Fra næste betalingsperiode går alt til det nye kort. Den tidligere opkrævning, som allerede er trukket, bliver på det gamle kort. At skifte kort flytter ikke den opkrævning og ændrer ikke din næste betalingsdato.",
            ],
          },
          {
            id: "cancel",
            q: "Hvordan opsiger jeg mit abonnement?",
            a: [
              "Du gør det selv, når som helst. Log ind, åbn Konto, og tryk på Opsig abonnement under din plan.",
              "Købte du dit abonnement i iPhone eller iPad appen? Opsig det i dine Apple abonnementsindstillinger. Linket \"Administrer abonnement\" på din Konto-side fører dig derhen.",
              "På et betalt abonnement fortsætter din adgang til udgangen af den periode, du allerede har betalt for. Derefter går kontoen over til Basic, gratis. Dine gemte ord og din historik forbliver sikre.",
              "I den gratis prøveperiode på 14 dage afslutter en opsigelse prøveperioden med det samme, og du bliver ikke opkrævet noget. Hvis det kun er den automatiske opkrævning, du er bekymret for, så vælg den grund i opsigelsesvinduet, så kan du i stedet slå fornyelsen fra og beholde prøveperioden til sidste dag.",
              "Hvis du opsiger et betalt abonnement ved en fejl eller fortryder, kan du genoptage det fra samme side, før perioden slutter.",
            ],
          },
          {
            id: "switch-plan",
            q: "Hvordan skifter jeg mellem Individual og Family?",
            a: [
              "For at skifte til Family skal du åbne siden Konto og trykke på \"Skift til Family\". Dit nuværende abonnement opdateres på det samme kort, uden at du skal indtaste det igen.",
              "Stripe regner forskellen ud for de dage, der er tilbage i den nuværende periode, så du kun betaler forskellen. For at skifte fra Family til Individual kan du skrive til os fra denne side, så skifter teamet det for dig.",
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
              "Ja, inden for 14 dage efter den første betaling på din konto eller efter en årlig fornyelse. Skriv til support@gadit.app fra den e-mailadresse, der hører til kontoen, så refunderer vi den betaling fuldt ud. Du behøver ikke at give en grund. Refusionen afslutter også abonnementet, og pengene går tilbage til det kort, du betalte med, som regel inden for 5 til 10 hverdage.",
              "Efter 14 dage refunderes betalinger ikke, medmindre du er blevet opkrævet ved en fejl, eller loven dér, hvor du bor, kræver det. Du kan når som helst opsige, så abonnementet ikke fornyes, og du beholder det indtil slutningen af den periode, du har betalt for.",
              "Har du købt i appen på iPhone eller iPad? Så håndterer Apple de refusioner på reportaproblem.apple.com.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Hvad er denne opkrævning på mit kort?",
            a: [
              "Opkrævninger vises som GADIT eller GADIT.APP. Beløbet svarer til dit abonnement (Individual eller Family, månedligt eller årligt) i dit lands valuta, som vist på prissiden. Abonnementer, der startede før oktober 2026, beholder den pris, de startede med. Hvis beløbet ikke passer, kan det være fra en anden tjeneste.",
              "Hvis du er sikker på, at den ikke er din, så lad være med at gøre indsigelse via din bank endnu. Skriv først direkte til os med dato og beløb. Teamet finder den, forklarer, hvad det er, og refunderer om nødvendigt. En indsigelse via banken kan gøre fremtidige betalinger sværere, så det er som regel hurtigere og sikrere at løse det via support.",
            ],
          },
          {
            id: "failed-payment",
            q: "Min betaling mislykkedes. Hvad skal jeg gøre?",
            a: [
              "Stripe prøver automatisk mislykkede betalinger igen et par gange i løbet af de følgende dage. De fleste fejl løser sig selv, når banken frigiver reservationen, eller kortet har nok dækning.",
              "En bjælke øverst på siden fortæller, at opkrævningen ikke gik igennem, og din adgang bliver bevaret nogle dage endnu. Tryk dér på \"Opdater kort\", indtast et kort, der virker, så prøver vi opkrævningen på det med det samme. Hvis dit abonnement allerede er faldet tilbage til Basic, kan du tegne abonnement igen fra prissiden, og din notesbog er intakt.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Hvad er forskellen på Basic, Individual og Family?",
            a: [
              "Basic (gratis): op til 10 ordopslag om dagen, alle betydninger, eksempler, udtryk, ordets oprindelse, den rigtige betydning ud fra en sætning og en notesbog med op til 30 ord.",
              "Individual: én person, alle læringsværktøjer. Ubegrænsede opslag, et billede til hver betydning, flere eksempler og spørgsmål til hvert ord, skriv en sætning med feedback, Hvert ord, Sig det, en naturlig oplæsningsstemme og stemmesøgning, offline brug, spil, quizzer og orddueller samt smart øvelse med testforberedelse og diktat.",
              "Family: alt i Individual for op til 5 børn og forældrene plus børnetilstand, et eget område til hvert barn, hjælp til lektier og forældrepanelet med en besked for hvert ord. Skoler har deres eget abonnement. Priserne for dit land og den gratis prøveperiode på 14 dage finder du på prissiden.",
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
            q: "Jeg har ikke fået min bekræftelsesmail",
            a: [
              "Tjek først mapperne for spam og kampagner. Gmail og Outlook sender nogle gange kontomails dertil, indtil du markerer en som \"Ikke spam\".",
              "Hvis den ikke er der, er e-mailen måske blevet stavet forkert ved tilmeldingen. Prøv at tilmelde dig igen, og dobbelttjek adressen. Hvis du tilmeldte dig med Google, er der ikke brug for en bekræftelsesmail.",
            ],
          },
          {
            id: "forgot-password",
            q: "Jeg har glemt min adgangskode",
            a: [
              "I login-vinduet skal du skrive din e-mail og derefter trykke på \"Glemt adgangskode?\". Et nulstillingslink kommer som regel i din indbakke inden for et minut eller to. Du kan også trykke på \"Send mig et login-link på mail\" og logge ind uden adgangskode.",
              "Hvis mailen ikke kommer, så tjek spam. Hvis den stadig ikke kommer, har du måske tilmeldt dig med Google i stedet for e-mail og adgangskode. Prøv knappen \"Fortsæt med Google\".",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Min adgangskode er rigtig, men der står, at e-mail og adgangskode ikke passer sammen",
            a: [
              "Tre ting at tjekke. For det første Caps Lock. For det andet et ekstra mellemrum til sidst efter kopiering og indsætning. For det tredje har du måske tilmeldt dig med Google i stedet for en adgangskode, så brug \"Fortsæt med Google\" i stedet.",
              "Sidder du stadig fast? I samme besked kan du trykke på \"Send mig et login-link på mail\" for at komme ind uden adgangskode, eller \"Vælg ny adgangskode\".",
            ],
          },
          {
            id: "google-fails",
            q: "Login med Google virker ikke",
            a: [
              "Inde i apps som Instagram, Facebook eller TikTok er Google-knappen skjult. Åbn linket i din almindelige browser, eller log ind med din e-mail. Hvis du tilmeldte dig med Google, så skriv den e-mail og tryk på \"Send mig et login-link på mail\".",
              "I et privat vindue kan blokerede cookies stoppe login med Google, så prøv et almindeligt vindue.",
            ],
          },
          {
            id: "change-email",
            q: "Hvordan ændrer jeg e-mailen på min konto?",
            a: [
              "Ændring af kontoens e-mail håndteres af teamet. Skriv til os fra din nuværende adresse, og skriv den nye adresse i beskeden. Teamet opdaterer den, og dit abonnement, din historik og din notesbog forbliver, som de er.",
            ],
          },
          {
            id: "delete-account",
            q: "Hvordan sletter jeg min konto?",
            a: [
              "Nederst på siden \"Konto\" skal du trykke på \"Slet konto\" og skrive kontoens e-mail for at bekræfte. Det er permanent. Dit abonnement bliver opsagt, din notesbog og historik bliver slettet, og e-mailen bliver frigivet til en ny tilmelding.",
              "Den eneste undtagelse er et abonnement købt i App Store. Sletning af kontoen opsiger det ikke, så opsig det først i dine Apple abonnementsindstillinger.",
              "Registreringer af tidligere opkrævninger bliver bevaret, fordi loven kræver, at vi gemmer dem til regnskab.",
            ],
          },
          {
            id: "share-account",
            q: "Kan min partner eller mit barn dele min konto?",
            a: [
              "Hver konto har én person logget ind ad gangen. Til en husstand er Family-abonnementet bygget til netop dette: op til 5 børn og forældrene, hver med sit eget område, sin egen notesbog og sine egne fremskridt, plus børnetilstand til børnene og et forældrepanel.",
              "Til én voksen alene dækker Individual én person med alle læringsværktøjer. Sammenlign abonnementerne og priserne for dit land på prissiden.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Jeg tror, jeg har to konti ved en fejl. Hvad nu?",
            a: [
              "Det sker typisk, når nogen tilmelder sig én gang med Google og én gang med e-mail og adgangskode med samme adresse, eller når du tilmelder dig to gange med forskellige e-mailadresser. Hver tilmelding opretter en separat Gadit-konto med sin egen notesbog, historik og abonnementsstatus.",
              "Skriv til os fra en af de to adresser, og skriv den anden adresse og hvilken konto du gerne vil beholde. Teamet samler notesbogen og historikken på den konto, du vælger, og lukker derefter den anden pænt. Ingen data går tabt.",
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
              "Ved siden af hver betydning, og på kortene for idiomer og ordets oprindelse, er der et lille flagikon. Tryk på det, vælg hvad der er galt, og tilføj en kort note, hvis du vil. Det går direkte til teamet, og hver rapport bliver gennemgået.",
              "Vær ikke bange for at være for kritisk. Ordbogen bliver hurtigere bedre af den feedback end af noget andet.",
            ],
          },
          {
            id: "kids-not-working",
            q: "Børnetilstand ændrer ikke forklaringen",
            a: [
              "Børnetilstand skifter kun teksten, når ordet allerede har en børnevenlig forklaring. For et ord, du lige har slået op for første gang, så giv det 10 til 15 sekunder, mens den børnevenlige version bliver gjort klar.",
              "Børnetilstand er en del af Family-abonnementet. På Individual ser du i stedet kontakten \"Med enkle ord\", som giver en enklere forklaring af hver betydning. På Basic eller uden konto er der ingen kontakt. Abonnenter, der tilmeldte sig Clear eller Deep før oktober 2026, beholder børnetilstand. For at få den skal du se Family på prissiden.",
            ],
          },
          {
            id: "voice-fails",
            q: "Stemmesøgning virker ikke",
            a: [
              "Stemmesøgning kræver adgang til mikrofonen. De fleste browsere spørger én gang pr. websted. Hvis du ved en fejl blokerede den, skal du trykke på ikonet ved siden af gadit.app i adresselinjen og tillade mikrofonen i webstedets tilladelser.",
              "På iPhone og iPad skal du også tillade mikrofonen for Safari i enhedens app Indstillinger. Stemmesøgning er en del af Individual- og Family-abonnementerne, så på Basic og uden konto vises mikrofonknappen ikke. For at opgradere skal du åbne prissiden.",
            ],
          },
          {
            id: "no-image",
            q: "Jeg kan ikke få et billede til ordet",
            a: [
              "Billeder er en del af Individual- og Family-abonnementerne med op til 100 nye billeder om måneden. Et billede, der allerede findes til den betydning, åbner uden at tælle med. Det ældre Clear-abonnement har 30 om måneden, og Basic indeholder ikke billeder. Når månedens billeder er brugt, ser du en besked, og optællingen starter forfra i begyndelsen af hver måned.",
              "Hvis du er under kvoten og stadig oplever fejl, er det som regel midlertidigt. Prøv igen om 30 sekunder. Vedvarende fejl er en fejl i systemet. Rapportér det venligst fra ordets side.",
            ],
          },
          {
            id: "save-word",
            q: "Hvordan gemmer jeg et ord i min notesbog?",
            a: [
              "Det behøver du ikke. Når du er logget ind, bliver hvert ord, du slår op, gemt i din notesbog af sig selv. På Basic kan notesbogen rumme op til 30 ord. På Individual og Family er der ingen grænse, og den indeholder smart øvelse, som bringer dine ord tilbage til repetition på det rigtige tidspunkt.",
              "På Individual og Family bliver de ord, du slår op, også gemt på din enhed, så de åbner uden internet. Du ser dine ord ved at åbne notesbogen fra menuen.",
            ],
          },
          {
            id: "offline",
            q: "Hvordan bruger jeg Gadit offline?",
            a: [
              "Offline brug er en del af Individual- og Family-abonnementerne. Hvert ord, du slår op, bliver gemt på din enhed, så det åbner igen med det samme uden internet. Du kan også trykke på \"Hent offline-pakke\" på din Konto-side for at gemme ordene fra vores ordbog på dit sprog på denne enhed.",
              "Et helt nyt ord kræver stadig forbindelse, fordi Gadit skal gøre hele resultatet klar til det. Offlinekopien dækker de ord, der allerede er på din enhed. Hvis du er på Basic, kan du se planerne på prissiden.",
            ],
          },
          {
            id: "slow",
            q: "Appen føles langsom",
            a: [
              "Det første opslag af et ord er det langsomste, fordi Gadit laver hele resultatet fra bunden: som regel et par sekunder, nogle gange længere for komplekse ord. Senere opslag af samme ord er øjeblikkelige og hentes fra cachen.",
              "Hvis alt føles langsomt, så prøv en hård genindlæsning: Cmd+Shift+R på Mac, Ctrl+Shift+R på Windows. Hvis langsommeligheden fortsætter på tværs af sider, så send os en e-mail med dit land og din browser, så teamet kan tjekke netværksruten fra din region til vores servere.",
            ],
          },
          {
            id: "word-not-found",
            q: "Jeg søgte efter et ord og fik intet resultat. Hvad sker der?",
            a: [
              "Tjek først stavningen. Hvis der var en tastefejl, viser Gadit som regel det rettede ord, med et link til alligevel at søge efter det, du skrev.",
              "Meget sjældne ord eller slangord giver ikke altid et resultat. Hvis du er sikker på, at ordet findes, så skriv til os fra denne side, så tjekker teamet det.",
            ],
          },
          {
            id: "change-language",
            q: "Hvordan skifter jeg sprog i brugerfladen?",
            a: [
              "Øverst på siden er der et globusikon med dit nuværende sprog. Tryk på det, og vælg et sprog.",
              "Dit valg bliver gemt på denne enhed. Alt indlæses igen på det nye sprog, brugerfladen, menuerne, fremtidige orddefinitioner, eksempler, børneforklaringer og endda ordets oprindelse. Ord, du allerede har slået op på det gamle sprog, vises i det, indtil du søger efter dem igen.",
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
              "Gå til gadit.app/partners og tryk på \"Deltag gratis\". Indtast dit navn og din e-mail, og tryk derefter på \"Få min partnerkode\". Dit personlige link og partnerdashboard, med klik og provision, er klar med det samme, uden ventetid på godkendelse. Koden og linket kommer også på mail.",
              "Det er gratis at være med og åbent for alle. Du behøver ikke et Gadit-abonnement for at blive partner.",
            ],
          },
          {
            id: "commission-model",
            q: "Hvordan beregnes provisionen?",
            a: [
              "Standardvilkårene er 25% af hver betaling, en kunde foretager i sit første år. Efter det første år tjener du 10% af hver betaling, så længe kunden bliver ved med at betale. Får du 5 betalende kunder, stiger din andel efter det første år til 15% for livet.",
              "Det fungerer på samme måde for månedlige og årlige planer, fordi provisionen beregnes af hver faktisk betaling. Hvis en kunde opsiger, stopper din provision med kundens sidste betaling.",
              "Teamet kan fastsætte andre satser for bestemte partnere. Dine egne satser vises altid på dit partnerdashboard.",
            ],
          },
          {
            id: "payout",
            q: "Hvornår får jeg udbetaling?",
            a: [
              "Én gang om måneden, uden minimumsbeløb. Hver provision kan udbetales 30 dage efter kundens betaling, og alt, der kan udbetales, sendes i den næste månedlige udbetaling til den PayPal-konto, du har angivet i dit partnerdashboard.",
              "Vi udbetaler i den valuta, kunden betalte i, når PayPal kan sende den, og ellers i amerikanske dollars efter valutakursen på den dag, vi udbetaler.",
              "Provisioner venter 30 dage på grund af refusioner. Hvis en kundes betaling refunderes, bliver provisionen på den annulleret. Så en provision på en betaling i januar kan udbetales i februar og sendes i den næste månedlige udbetaling.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Jeg er tilmeldt, men mit dashboard er tomt",
            a: [
              "Statistik vises efter det første klik på dit link. Tomt betyder bare, at ingen har klikket endnu. Gå ud og del linket. Dashboardet opdateres næsten i realtid, så snart der er aktivitet.",
              "Hvis du har delt linket, og nogen har tilmeldt sig, men dashboardet ikke viser det, så skriv til os med det omtrentlige tidspunkt for tilmeldingen, så tjekker teamet, hvor tilmeldingen kom fra.",
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
            q: "Nogen har tilmeldt sig via mit link, men jeg kan ikke se provisionen",
            a: [
              "Oftest handler det om timing. Tilmeldingen vises på dashboardet inden for få minutter, men provisionen bliver først bogført, når abonnementet faktisk er betalt, og det kan være dage senere, hvis de er på en gratis prøveperiode. Kig igen, når prøveperioden er slut.",
              "Hvis abonnementet er betalt, og du stadig ikke kan se provisionen efter 48 timer, så skriv til os med det omtrentlige tidspunkt for tilmeldingen og abonnentens e-mail eller omtrentlige navn, hvis du kender det. Teamet tjekker, hvor tilmeldingen kom fra, og retter manuelt eventuelle fejl.",
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
              "Gadit hjælper dig med at forstå hvert ord helt til bunds og ikke bare få en definition på én linje. Hvert ord åbner med alle sine betydninger, rigtige eksempler til hver betydning, udtryk og ordets oprindelse. De betalte abonnementer tilføjer et billede til hver betydning, øvelse, spil og mere, og Family tilføjer børnetilstand og et eget område til hvert barn.",
              "Gadit fungerer på 41 sprog. Internt kalder teamet det at GAD'e et ord: at forstå et ord helt til bunds, ikke bare oversætte det. Du kan se, hvad hvert abonnement indeholder, på prissiden.",
            ],
          },
          {
            id: "languages",
            q: "Hvilke sprog understøtter I?",
            a: [
              "Gadit fungerer på 41 sprog, blandt andet engelsk, hebraisk, arabisk, spansk, fransk, tysk, russisk, kinesisk, japansk, hindi, isiZulu, isiXhosa og afrikaans.",
              "Du kan slå et ord op på et hvilket som helst af disse sprog og få betydningerne, eksemplerne og alt det andet på det sprog, du har valgt til brugerfladen. Hebraisk, arabisk og persisk læses fra højre mod venstre med deres egne skrifttyper. Du skifter sprog ved at trykke på sprogknappen øverst på enhver side.",
            ],
          },
          {
            id: "kid-safety",
            q: "Er Gadit sikker for børn?",
            a: [
              "Gadit er designet, så en forælder trygt kan bruge den sammen med et barn. Børnetilstand giver forklaringer, der er enkle, konkrete og alderssvarende, omkring niveauet for 5 til 10 år, med den samme motor, der driver indholdet for voksne, men med klare instruktioner om at forenkle. Brugergenereret indhold bliver aldrig vist for børn.",
              "En selvstændig konto er for voksne på 18 år og derover. Børn og teenagere bruger Gadit gennem en voksen. Hjemme tilføjer en forælder hvert barn på Family-siden, hvert barn får sit eget område med Børnetilstand, og forældrepanelet viser de ord, hvert barn slår op. I skolen får klassen et link fra læreren, og eleverne deltager uden en konto eller en e-mailadresse.",
            ],
          },
          {
            id: "data",
            q: "Hvor bliver mine data gemt? Sælger I dem?",
            a: [
              "Konto, historik, notesbog og genererede billeder bliver opbevaret sikkert i Firebase, krypteret i lageret. Vi sælger ikke dine data til nogen. Vi deler kun det, der er nødvendigt for at drive Gadit (lagring, betalinger, indholdsleverandører), som beskrevet i privatlivspolitikken.",
              "Du kan slette din konto når som helst fra Konto-siden. Hvis du vil have en kopi af din notesbog eller andre data, vi har om dig, kan du skrive til os fra denne side.",
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
    heading: "Találd meg gyorsan a választ",
    lede: "Gyakori kérdések és lépésről lépésre megoldások, témák szerint rendezve. Ha nem látod a problémádat, lent felveheted a kapcsolatot a csapattal.",
    stillNeedHelpHeading: "Még mindig elakadtál?",
    stillNeedHelpBody: "Írj nekünk közvetlenül. A csapat minden üzenetet elolvas, és általában egy-két napon belül válaszol.",
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
              "Kevesebb mint egy perc alatt átválthatsz új kártyára lemondás nélkül. A jelenlegi előfizetésed tovább fut, csak az új kártyával.",
              "1. Jelentkezz be a gadit.app oldalon, és nyisd meg a fiók menüben a \"Fiók\" oldalt. 2. Kattints a \"Számlázás kezelése\" gombra. 3. Megnyílik egy biztonságos Stripe-oldal. Add hozzá az új kártyát fizetési módként, és állítsd be alapértelmezettnek. 4. Ha szeretnéd, töröld a régi kártyát.",
              "A következő számlázási ciklustól minden az új kártyára megy. Az előző terhelés, amit már beszedtünk, a régi kártyán marad. A kártyacsere ezt a terhelést nem helyezi át, és a következő számlázási dátumodat sem változtatja meg.",
            ],
          },
          {
            id: "cancel",
            q: "Hogyan mondhatom le az előfizetésemet?",
            a: [
              "Saját magad, bármikor. Jelentkezz be, nyisd meg a Fiók oldalt, és koppints a csomagod alatt az előfizetés lemondására.",
              "Az előfizetésedet iPhone vagy iPad appban vetted? Az Apple előfizetési beállításaiban mondd le. A Fiók oldalon az \"Előfizetés kezelése\" link oda visz.",
              "Fizetős előfizetésnél a hozzáférésed a már kifizetett időszak végéig megmarad. Utána a fiók Basic, ingyenes csomagra vált. A mentett szavaid és az előzményeid biztonságban maradnak.",
              "A 14 napos ingyenes próbaidőszak alatt a lemondás azonnal véget vet a próbaidőszaknak, és semmit sem terhelünk. Ha csak az automatikus terhelés miatt aggódsz, válaszd ezt az okot a lemondási ablakban, és inkább kikapcsolhatod a megújítást, így a próbaidőszak az utolsó napjáig megmarad.",
              "Ha véletlenül mondtad le a fizetős előfizetést, vagy meggondoltad magad, ugyanerről az oldalról újraindíthatod, mielőtt az időszak véget ér.",
            ],
          },
          {
            id: "switch-plan",
            q: "Hogyan válthatok az Individual és a Family között?",
            a: [
              "A Family csomagra váltáshoz nyisd meg a Fiók oldalt, és koppints erre: „Váltás a Family csomagra”. A mostani előfizetésed ugyanazon a kártyán frissül, nem kell újra megadnod.",
              "A Stripe kiszámolja a különbözetet az aktuális időszakból hátralévő napokra, így csak a különbözetet fizeted. Ha Family csomagról Individual csomagra váltanál, írj nekünk erről az oldalról, és a csapat átállítja neked.",
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
              "Igen, a fiókod első fizetésétől vagy egy éves megújítástól számított 14 napon belül. Írj a support@gadit.app címre a fiókod e-mail-címéről, és ezt a fizetést teljes egészében visszatérítjük. Nem kell indokot adnod. A visszatérítés az előfizetést is megszünteti, és a pénz arra a kártyára megy vissza, amellyel fizettél, általában 5-10 munkanapon belül.",
              "14 nap után a fizetéseket nem térítjük vissza, kivéve, ha tévedésből terheltünk meg, vagy ha a lakóhelyed szerinti törvény ezt előírja. Bármikor lemondhatod, hogy az előfizetés ne újuljon meg, és a már kifizetett időszak végéig megmarad.",
              "Az iPhone vagy iPad alkalmazásban vásároltál? Ezeket a visszatérítéseket az Apple kezeli a reportaproblem.apple.com oldalon.",
            ],
          },
          {
            id: "unknown-charge",
            q: "Mi ez a terhelés a kártyámon?",
            a: [
              "A terhelések GADIT vagy GADIT.APP néven jelennek meg. Az összeg megfelel a csomagodnak (Individual vagy Family, havi vagy éves) az országod pénznemében, ahogy az árak oldalon látható. A 2026 októbere előtt indult előfizetések megtartják az induló árukat. Ha az összeg nem egyezik, lehet, hogy egy másik szolgáltatástól származik.",
              "Ha biztos vagy benne, hogy nem a tiéd, még ne indíts reklamációt a bankodnál. Először írj nekünk közvetlenül a dátummal és az összeggel. A csapat megkeresi, elmagyarázza, mi ez, és szükség esetén visszatéríti. A banki reklamáció megnehezítheti a későbbi számlázást, ezért az ügyfélszolgálaton keresztüli rendezés általában gyorsabb és biztonságosabb.",
            ],
          },
          {
            id: "failed-payment",
            q: "Sikertelen volt a fizetésem. Mit tegyek?",
            a: [
              "A Stripe a következő napokban automatikusan többször újrapróbálja a sikertelen fizetéseket. A legtöbb hiba magától megoldódik, amikor a bank feloldja a zárolást, vagy lesz elég egyenleg a kártyán.",
              "Az oldal tetején egy sáv jelzi majd, hogy a terhelés nem ment át, és a hozzáférésed még néhány napig megmarad. Koppints ott a \"Kártya frissítése\" gombra, adj meg egy működő kártyát, és rögtön megpróbáljuk azon a terhelést. Ha az előfizetésed már Basic csomagra váltott, az árak oldalon újra előfizethetsz, és a füzeted érintetlen marad.",
            ],
          },
          {
            id: "plan-comparison",
            q: "Mi a különbség a Basic, az Individual és a Family között?",
            a: [
              "Basic (ingyenes): napi legfeljebb 10 szókeresés, minden jelentés, példák, szólások, a szó eredete, a helyes jelentés egy mondatból, és egy legfeljebb 30 szavas füzet.",
              "Individual: egy személynek, az összes tanulási eszközzel. Korlátlan keresés, kép minden jelentéshez, több példa és kérdés minden szóhoz, mondatírás visszajelzéssel, Minden szó, Mondd ki, természetes felolvasó hang és hangalapú keresés, offline használat, játékok, kvízek és szópárbajok, valamint okos gyakorlás dolgozatra készüléssel és diktálással.",
              "Family: minden, ami az Individual csomagban van, legfeljebb 5 gyereknek és a szülőknek, plusz Gyerek mód, saját tér minden gyereknek, segítség a házi feladathoz, és szülői panel értesítéssel minden szóról. Az iskoláknak saját csomagjuk van. Az országodra érvényes árakat és a 14 napos ingyenes próbaidőszakot az árak oldalon találod.",
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
            q: "Nem kaptam meg a megerősítő e-mailt",
            a: [
              "Először nézd meg a spam és a promóciók mappát. A Gmail és az Outlook néha oda irányítja a fiókkal kapcsolatos e-maileket, amíg egyet meg nem jelölsz \"Nem spam\" címkével.",
              "Ha ott sincs, lehet, hogy regisztrációkor elgépelted az e-mail-címet. Próbálj meg újra regisztrálni, és ellenőrizd alaposan a címet. Ha Google-fiókkal regisztráltál, nincs szükség megerősítő e-mailre.",
            ],
          },
          {
            id: "forgot-password",
            q: "Elfelejtettem a jelszavamat",
            a: [
              "A bejelentkezési ablakban írd be az e-mail-címedet, majd koppints az \"Elfelejtetted a jelszavad?\" lehetőségre. A visszaállító link általában egy-két percen belül megérkezik. Rákoppinthatsz a \"Küldjenek belépési linket e-mailben\" lehetőségre is, és jelszó nélkül beléphetsz.",
              "Ha az e-mail nem érkezik meg, nézd meg a spam mappát. Ha ott sincs, lehet, hogy Google-lel regisztráltál, nem e-maillel és jelszóval. Próbáld a \"Folytatás Google-fiókkal\" gombot.",
            ],
          },
          {
            id: "wrong-credentials",
            q: "Biztos vagyok benne, hogy jó a jelszavam, mégis azt írja, hogy az e-mail és a jelszó nem egyezik",
            a: [
              "Három dolgot érdemes ellenőrizni. Először a Caps Lockot. Másodszor a végén maradt plusz szóközt másolás és beillesztés után. Harmadszor azt, hogy nem Google-lel regisztráltál-e jelszó helyett, ilyenkor a \"Folytatás Google-fiókkal\" gombot használd.",
              "Még mindig nem megy? Ugyanebben az üzenetben koppints a \"Küldjenek belépési linket e-mailben\" lehetőségre, hogy jelszó nélkül belépj, vagy az \"Új jelszó választása\" lehetőségre.",
            ],
          },
          {
            id: "google-fails",
            q: "Nem működik a Google-bejelentkezés",
            a: [
              "Olyan appokon belül, mint az Instagram, Facebook vagy TikTok, a Google gomb rejtve van. Nyisd meg a linket a szokásos böngésződben, vagy lépj be az e-mail-címeddel. Ha Google-lel regisztráltál, írd be azt az e-mail-címet, és koppints a \"Küldjenek belépési linket e-mailben\" lehetőségre.",
              "Privát, inkognitó ablakban a letiltott cookie-k megakadályozhatják a Google-bejelentkezést, ezért próbáld normál ablakban.",
            ],
          },
          {
            id: "change-email",
            q: "Hogyan változtathatom meg a fiókom e-mail-címét?",
            a: [
              "A fiókod e-mail-címét a csapat módosítja. Írj nekünk a jelenlegi címedről, és az üzenetben add meg az új címet. A csapat frissíti, az előfizetésed, az előzményeid és a füzeted pedig változatlan marad.",
            ],
          },
          {
            id: "delete-account",
            q: "Hogyan törölhetem a fiókomat?",
            a: [
              "A Fiók oldal alján koppints a \"Fiók törlése\" gombra, majd az megerősítéshez írd be a fiókod e-mail-címét. Ez végleges. Az előfizetésed megszűnik, a füzeted és az előzményeid törlődnek, az e-mail-cím pedig felszabadul egy új regisztrációhoz.",
              "Egy kivétel van, a App Store-ban vásárolt előfizetés. A fiók törlése ezt nem mondja le, ezért előbb az Apple előfizetési beállításaiban mondd le.",
              "A korábbi terhelések adatai megmaradnak, mert a törvény kötelez minket, hogy könyvelési célból megőrizzük őket.",
            ],
          },
          {
            id: "share-account",
            q: "Használhatja a társam vagy a gyerekem is a fiókomat?",
            a: [
              "Egy fiókba egyszerre egy ember lehet bejelentkezve. Egy háztartásnak éppen erre készült a Family csomag: legfeljebb 5 gyerek és a szülők, mindenkinek saját térrel, saját füzettel és haladással, plusz Gyerek mód a gyerekeknek és szülői panel.",
              "Egyetlen felnőttnek az Individual csomag egy személyt fed le az összes tanulási eszközzel. Hasonlítsd össze a csomagokat és az országodra érvényes árakat az árak oldalon.",
            ],
          },
          {
            id: "multiple-accounts",
            q: "Azt hiszem, véletlenül két fiókom van. Most mi legyen?",
            a: [
              "Ez általában akkor történik, amikor valaki egyszer Google-lel, egyszer pedig e-maillel és jelszóval regisztrál ugyanazzal a címmel, vagy amikor két különböző e-mail-címmel kétszer regisztrálsz. Minden regisztráció külön Gadit-fiókot hoz létre saját füzettel, előzményekkel és előfizetési állapottal.",
              "Írj nekünk az egyik címről, és írd meg a másik címet is, valamint azt, melyik fiókot szeretnéd megtartani. A csapat a füzeteket és az előzményeket az általad választott fiókba vonja össze, majd rendben lezárja a másikat. Nem vész el adat.",
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
              "Minden jelentés mellett, valamint a szólások és a szóeredet kártyáin is van egy kis zászló ikon. Koppints rá, válaszd ki, mi a gond, és ha szeretnéd, írj rövid megjegyzést is. A jelentés egyenesen a csapathoz kerül, és mindegyiket átnézzük.",
              "Ne aggódj amiatt, hogy túl szigorú vagy. A szótár ebből a visszajelzésből gyorsabban fejlődik, mint bármi másból.",
            ],
          },
          {
            id: "kids-not-working",
            q: "A Gyerek mód nem változtatja meg a magyarázatot",
            a: [
              "A Gyerek mód csak ott változtatja meg a szöveget, ahol a szóhoz már van gyerekbarát magyarázat. Ha most kerestél rá először egy szóra, adj neki 10-15 másodpercet, amíg elkészül a gyerekbarát változat.",
              "A Gyerek mód a Family csomag része. Individual csomagban helyette az \"Egyszerűen\" kapcsolót látod, ami minden jelentéshez egyszerűbb magyarázatot ad. Basic csomagban vagy fiók nélkül nincs kapcsoló. Akik 2026 októbere előtt Clear vagy Deep csomagra fizettek elő, megtartják a Gyerek módot. Ha szeretnéd, nézd meg a Family csomagot az árak oldalon.",
            ],
          },
          {
            id: "voice-fails",
            q: "Nem működik a hangalapú keresés",
            a: [
              "A hangalapú kereséshez mikrofonengedély kell. A legtöbb böngésző webhelyenként egyszer kérdez rá. Ha véletlenül letiltottad, koppints a gadit.app melletti ikonra a címsorban, és engedélyezd a mikrofont a webhely jogosultságainál.",
              "iPhone-on és iPaden a Safari számára a készülék Beállítások appjában is engedélyezni kell a mikrofont. A hangalapú keresés az Individual és a Family csomag része, ezért Basic csomagban és fiók nélkül a mikrofon gomb nem jelenik meg. A váltáshoz nyisd meg az árak oldalt.",
            ],
          },
          {
            id: "no-image",
            q: "Nem kapok képet a szóhoz",
            a: [
              "A képek az Individual és a Family csomag részei, havonta legfeljebb 100 új képpel. Ha az adott jelentéshez már van kép, az beszámítás nélkül nyílik meg. A régebbi Clear csomagban havi 30 kép jár, a Basic pedig nem tartalmaz képeket. Ha elfogytak a hónap képei, értesítést látsz, és a számlálás minden hónap elején újraindul.",
              "Ha még a kereten belül vagy, és mégis hibát látsz, az általában átmeneti. Próbáld újra 30 másodperc múlva. A tartós hiba programhiba. Kérjük, jelentsd a szó oldaláról.",
            ],
          },
          {
            id: "save-word",
            q: "Hogyan menthetek el egy szót a füzetembe?",
            a: [
              "Nem kell külön mentened. Ha be vagy jelentkezve, minden kikeresett szó magától bekerül a füzetedbe. Basic csomaggal a füzetben legfeljebb 30 szó fér el. Individual és Family csomaggal nincs korlát, és okos gyakorlás is jár hozzá, amely a megfelelő időben hozza vissza a szavaidat ismétlésre.",
              "Individual és Family csomaggal a kikeresett szavak az eszközödön is megmaradnak, így internet nélkül is megnyílnak. A szavaidat a füzetben látod, amelyet a menüből nyithatsz meg.",
            ],
          },
          {
            id: "offline",
            q: "Hogyan használhatom a Gaditot offline?",
            a: [
              "Az offline használat az Individual és a Family csomag része. Minden szó, amit kikeresel, megmarad az eszközödön, így internet nélkül is azonnal újra megnyílik. A Fiók oldalon az \"Offline csomag letöltése\" lehetőségre is koppinthatsz, hogy a szótárad nyelvének szavai erre az eszközre lementődjenek.",
              "Egy teljesen új szó kikereséséhez továbbra is kapcsolat kell, mert a Gaditnak el kell készítenie hozzá a teljes találatot. Az offline másolat azokat a szavakat fedi le, amelyek már ott vannak az eszközödön. Ha Basic csomagban vagy, nézd meg a csomagokat az árak oldalon.",
            ],
          },
          {
            id: "slow",
            q: "Lassúnak tűnik az alkalmazás",
            a: [
              "Egy szó első keresése a leglassabb, mert a Gadit a nulláról készíti el a teljes találatot: általában néhány másodperc, összetett szavaknál néha több. Ugyanannak a szónak a későbbi keresései azonnaliak, a gyorsítótárból jönnek.",
              "Ha minden lassúnak tűnik, próbálj meg egy teljes frissítést: Cmd+Shift+R Macen, Ctrl+Shift+R Windowson. Ha a lassúság több oldalon is megmarad, írj nekünk e-mailt az országoddal és a böngésződdel, hogy a csapat ellenőrizhesse a hálózati útvonalat a régiódból a szervereinkig.",
            ],
          },
          {
            id: "word-not-found",
            q: "Rákerestem egy szóra, de nem kaptam találatot. Mi történik?",
            a: [
              "Először ellenőrizd a helyesírást. Ha elírás volt benne, a Gadit általában megmutatja a javított szót, és ad egy linket ahhoz is, hogy mégis arra keress rá, amit beírtál.",
              "A nagyon ritka vagy szleng szavakra nem mindig van találat. Ha biztos vagy benne, hogy a szó létezik, írj nekünk erről az oldalról, és a csapat megnézi.",
            ],
          },
          {
            id: "change-language",
            q: "Hogyan változtathatom meg a felület nyelvét?",
            a: [
              "Az oldal tetején van egy földgömb ikon az aktuális nyelveddel. Koppints rá, és válassz nyelvet.",
              "A választásod ezen az eszközön mentődik el. Minden újratöltődik az új nyelven, a felület, a menük, a jövőbeli szódefiníciók, a példák, a gyerekmagyarázatok, sőt még a szó eredete is. Azok a szavak, amelyekre már rákerestél a régi nyelven, addig azon maradnak, amíg újra rájuk nem keresel.",
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
              "Nyisd meg a gadit.app/partners oldalt, és koppints a \"Csatlakozz ingyen\" gombra. Add meg a nevedet és az e-mail-címedet, majd koppints a \"Kérem a partnerkódomat\" gombra. A személyes linked és a partner-irányítópultod, a kattintásokkal és a jutalékokkal, azonnal elkészül, nincs várakozás jóváhagyásra. A kódot és a linket e-mailben is megkapod.",
              "A csatlakozás ingyenes, és mindenki előtt nyitott. Nem kell Gadit-előfizetés ahhoz, hogy partner legyél.",
            ],
          },
          {
            id: "commission-model",
            q: "Hogyan számítjuk a jutalékot?",
            a: [
              "A szokásos feltételek szerint az ügyfél első évében minden fizetésének 25%-át kapod. Az első év után minden fizetés 10%-át kapod addig, amíg az ügyfél tovább fizet. Ha 5 fizető ügyfelet hozol, az első év utáni részesedésed életre szólóan 15%-ra nő.",
              "Ez ugyanígy működik havi és éves csomagoknál is, mert a jutalékot minden tényleges fizetés után számoljuk. Ha az ügyfél lemondja az előfizetést, a jutalékod az utolsó fizetésével megáll.",
              "A csapat bizonyos partnereknek eltérő arányokat is beállíthat. A saját arányaid mindig látszanak a partner-irányítópultodon.",
            ],
          },
          {
            id: "payout",
            q: "Mikor kapok kifizetést?",
            a: [
              "Havonta egyszer, minimumösszeg nélkül. Minden jutalék a vevő fizetése után 30 nappal válik kifizethetővé, és minden kifizethető összeget a következő havi kifizetéssel küldünk el arra a PayPal-fiókra, amelyet a partneri irányítópultodon beállítottál.",
              "Abban a pénznemben fizetünk, amelyben a vevő fizetett, amikor a PayPal ezt tudja küldeni, egyébként amerikai dollárban, a kifizetés napján érvényes árfolyamon.",
              "A jutalékok 30 napot várnak a visszatérítések miatt: ha egy vevő fizetését visszatérítjük, az ahhoz tartozó jutalékot töröljük. Ezért egy januári fizetés jutaléka februárban válik kifizethetővé, és a következő havi kifizetéssel megy ki.",
            ],
          },
          {
            id: "empty-dashboard",
            q: "Csatlakoztam, de üres az irányítópultom",
            a: [
              "A statisztikák az első kattintás után jelennek meg a linkeden. Az üres csak annyit jelent, hogy még senki sem kattintott rá. Oszd meg a linket. Az irányítópult szinte valós időben frissül, amint elindul az aktivitás.",
              "Ha már megosztottad, és valaki regisztrált, de ez nem látszik az irányítópulton, írj nekünk a regisztráció hozzávetőleges időpontjával, és a csapat megnézi, honnan jött a regisztráció.",
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
            q: "Valaki a linkemen keresztül regisztrált, de nem látom a jutalékot",
            a: [
              "Legtöbbször ez időzítés kérdése. A regisztráció perceken belül megjelenik az irányítópulton, de a jutalék csak akkor könyvelődik, amikor az előfizetést ténylegesen kifizetik, ami napokkal később is lehet, ha ingyenes próbaidőszakon vannak. Nézz vissza a próbaidőszak vége után.",
              "Ha az előfizetést már kifizették, de 48 óra után sem látod a jutalékot, írj nekünk a regisztráció hozzávetőleges időpontjával, valamint az előfizető e-mail-címével vagy hozzávetőleges nevével, ha tudod. A csapat megnézi, honnan jött a regisztráció, és kézzel javít minden kimaradást.",
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
              "A Gadit segít minden szót egészen a mélyéig megérteni, nem csak egy egysoros definíciót kapni. Minden szó az összes jelentésével nyílik meg, valódi példákkal minden jelentéshez, szólásokkal és a szó eredetével. A fizetős csomagokkal kép jár minden jelentéshez, gyakorlás, játékok és még sok más, a Family pedig Gyerek módot és saját teret ad minden gyereknek.",
              "A Gadit 41 nyelven működik. A csapaton belül ezt úgy hívjuk, hogy GAD-olni egy szót: a szót egészen a mélyéig megérteni, nem csak lefordítani. Hogy melyik csomag mit tartalmaz, azt az árak oldalon látod.",
            ],
          },
          {
            id: "languages",
            q: "Milyen nyelveket támogattok?",
            a: [
              "A Gadit 41 nyelven működik, köztük angolul, héberül, arabul, spanyolul, franciául, németül, oroszul, kínaiul, japánul, valamint hindi, zulu, xhosa és afrikaans nyelven.",
              "Bármelyik nyelven kikereshetsz egy szót, és a jelentéseket, a példákat és minden mást azon a nyelven kapod meg, amelyet a felülethez választottál. A héber, az arab és a perzsa jobbról balra olvasható, saját betűtípussal. A váltáshoz koppints a nyelvválasztó gombra bármelyik oldal tetején.",
            ],
          },
          {
            id: "kid-safety",
            q: "Biztonságos a Gadit gyerekeknek?",
            a: [
              "A Gadit úgy készült, hogy a szülő biztonságosan használhassa a gyerekével együtt. A Gyerek mód egyszerű, konkrét és életkornak megfelelő magyarázatokat ad, nagyjából az 5-10 éves korosztály szintjén, ugyanazzal a motorral, amely a felnőtt tartalmat is készíti, csak kifejezett utasításokkal az egyszerűsítésre. Felhasználók által létrehozott tartalom soha nem jelenik meg a gyerekeknek.",
              "A saját fiók felnőtteknek való, 18 éves kortól. A gyerekek és a tinédzserek a Gaditot egy felnőttön keresztül használják. Otthon a szülő a Family oldalon adja hozzá a gyerekeket, minden gyerek saját teret kap Gyerek móddal, a szülői panel pedig megmutatja, milyen szavakat keres ki az egyes gyerek. Az iskolában az osztály egy linket kap a tanártól, és a diákok fiók és e-mail-cím nélkül csatlakoznak.",
            ],
          },
          {
            id: "data",
            q: "Hol tároljátok az adataimat? Eladjátok őket?",
            a: [
              "A fiók, az előzmények, a füzet és a létrehozott képek biztonságosan, titkosítva tárolódnak a Firebase-ben. Az adataidat senkinek nem adjuk el. Csak azt osztjuk meg, ami a Gadit működtetéséhez szükséges (tárolás, fizetés, tartalomszolgáltatók), ahogy az Adatvédelmi szabályzat részletezi.",
              "A fiókodat bármikor törölheted a Fiók oldalon. Ha másolatot szeretnél a füzetedről vagy bármely más adatról, amelyet tárolunk rólad, írj nekünk erről az oldalról.",
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
