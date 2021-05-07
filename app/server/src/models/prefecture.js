const mongoose = require('mongoose')
const Schema = mongoose.Schema

const prefectureSchema = Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      // type: Schema.Types.ObjectID,
      type: String,
      required: true,
      ref: 'Area',
    },
  }
)

exports.Prefecture = mongoose.model('Prefecture', prefectureSchema)

exports.prefectures = {"北海道": {"id": 1, "name": "北海道", "slug": "HOKKAIDO"}, "青森県": {"id": 2, "name": "青森県", "slug": "AOMORI KEN"}, "岩手県": {"id": 3, "name": "岩手県", "slug": "IWATE KEN"}, "宮城県": {"id": 4, "name": "宮城県", "slug": "MIYAGI KEN"}, "秋田県": {"id": 5, "name": "秋田県", "slug": "AKITA KEN"}, "山形県": {"id": 6, "name": "山形県", "slug": "YAMAGATA KEN"}, "福島県": {"id": 7, "name": "福島県", "slug": "FUKUSHIMA KEN"}, "茨城県": {"id": 8, "name": "茨城県", "slug": "IBARAKI KEN"}, "栃木県": {"id": 9, "name": "栃木県", "slug": "TOCHIGI KEN"}, "群馬県": {"id": 10, "name": "群馬県", "slug": "GUMMA KEN"}, "埼玉県": {"id": 11, "name": "埼玉県", "slug": "SAITAMA KEN"}, "千葉県": {"id": 12, "name": "千葉県", "slug": "CHIBA KEN"}, "東京都": {"id": 13, "name": "東京都", "slug": "TOKYO TO"}, "神奈川県": {"id": 14, "name": "神奈川県", "slug": "KANAGAWA KEN"}, "新潟県": {"id": 15, "name": "新潟県", "slug": "NIIGATA KEN"}, "富山県": {"id": 16, "name": "富山県", "slug": "TOYAMA KEN"}, "石川県": {"id": 17, "name": "石川県", "slug": "ISHIKAWA KEN"}, "福井県": {"id": 18, "name": "福井県", "slug": "FUKUI KEN"}, "山梨県": {"id": 19, "name": "山梨県", "slug": "YAMANASHI KEN"}, "長野県": {"id": 20, "name": "長野県", "slug": "NAGANO KEN"}, "岐阜県": {"id": 21, "name": "岐阜県", "slug": "GIFU KEN"}, "静岡県": {"id": 22, "name": "静岡県", "slug": "SHIZUOKA KEN"}, "愛知県": {"id": 23, "name": "愛知県", "slug": "AICHI KEN"}, "三重県": {"id": 24, "name": "三重県", "slug": "MIE KEN"}, "滋賀県": {"id": 25, "name": "滋賀県", "slug": "SHIGA KEN"}, "京都府": {"id": 26, "name": "京都府", "slug": "KYOTO FU"}, "大阪府": {"id": 27, "name": "大阪府", "slug": "OSAKA FU"}, "兵庫県": {"id": 28, "name": "兵庫県", "slug": "HYOGO KEN"}, "奈良県": {"id": 29, "name": "奈良県", "slug": "NARA KEN"}, "和歌山県": {"id": 30, "name": "和歌山県", "slug": "WAKAYAMA KEN"}, "鳥取県": {"id": 31, "name": "鳥取県", "slug": "TOTTORI KEN"}, "島根県": {"id": 32, "name": "島根県", "slug": "SHIMANE KEN"}, "岡山県": {"id": 33, "name": "岡山県", "slug": "OKAYAMA KEN"}, "広島県": {"id": 34, "name": "広島県", "slug": "HIROSHIMA KEN"}, "山口県": {"id": 35, "name": "山口県", "slug": "YAMAGUCHI KEN"}, "徳島県": {"id": 36, "name": "徳島県", "slug": "TOKUSHIMA KEN"}, "香川県": {"id": 37, "name": "香川県", "slug": "KAGAWA KEN"}, "愛媛県": {"id": 38, "name": "愛媛県", "slug": "EHIME KEN"}, "高知県": {"id": 39, "name": "高知県", "slug": "KOCHI KEN"}, "福岡県": {"id": 40, "name": "福岡県", "slug": "FUKUOKA KEN"}, "佐賀県": {"id": 41, "name": "佐賀県", "slug": "SAGA KEN"}, "長崎県": {"id": 42, "name": "長崎県", "slug": "NAGASAKI KEN"}, "熊本県": {"id": 43, "name": "熊本県", "slug": "KUMAMOTO KEN"}, "大分県": {"id": 44, "name": "大分県", "slug": "OITA KEN"}, "宮崎県": {"id": 45, "name": "宮崎県", "slug": "MIYAZAKI KEN"}, "鹿児島県": {"id": 46, "name": "鹿児島県", "slug": "KAGOSHIMA KEN"}, "沖縄県": {"id": 47, "name": "沖縄県", "slug": "OKINAWA KEN"}}