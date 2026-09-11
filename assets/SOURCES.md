# RWS 牌图来源与核验

本 Demo 的牌图集合已从 12 张扩充到 78 张。全部来自 Wikimedia Commons 的 [TaionWC 扫描集合](https://commons.wikimedia.org/wiki/Category:Rider-Waite-Smith_tarot_deck_(TaionWC))。该分类页明确说明这是 Pam-A 版本的同一套扫描，包含 78 个文件；每张文件页也分别标注 1910 年、Pam-A、Pamela Colman Smith，上游来源为 muzendo.jp/blog。没有混用现代重绘、重新上色或生成式牌面。

## 来源核查

`source-evidence.json` 保存 78 个实际读取的来源页的卡名、尺寸、版本、作者、授权标记、文件历史及页面修订永久链接。核查日期为 2026-09-11。来源页由 web 工具逐页读取；本机对 Commons 描述页的请求曾返回 403，不能将该请求视为核查成功。图片从对应的 Wikimedia 原图 URL 获取，遇到 429 后改为串行、慢速与退避；三张网络握手超时的图片随后从同一来源重试成功。

各文件页的 Licensing 栏标注 Public domain，并列有 PD-old-80-expired 与 CC-PD-Mark。这是对来源页面权利声明的记录，不延伸为对所有地区、未来商业发行的法律审查。代码和原创教学内容不继承图片的权利状态。

## 本地资产

下载原图保留在 `originals/`。Demo 使用 `cards/` 内的 WebP：长边 900px、quality 90，仅等比例缩放与编码，不裁切、重新上色或重绘。`manifest.json` 分别记录原图与输出的 SHA-256、尺寸、来源和核查项。六张已有的 Commons 结构化 SHA-1 继续校对；其余记录 null，不虚构来源端校验值。

最初 12 张图片的原图与 WebP 字节均保持不变，基线保存在 `demo-original-hashes.json`。78 张输出 WebP 共 15,074,952 字节，原 JPEG 共 69,581,943 字节。`cards.sha256` 提供完整输出哈希列表。

## 视觉身份核查

已通过 view_image 实际查看六张分组联系表：两组大阿尔克纳及四个花色。逐一检查编号/标题、区分性人物或物件、完整画面与固定 ID 对应。`visual-review.json` 为每张牌保存观察记录及本次实际查看的 WebP 哈希；manifest 的视觉核查标记与此记录关联。

## 核验命令

维护者需要重建资产时运行 `python tools/prepare_assets.py`；普通使用者无需联网下载。已有 manifest 资产如哈希变化，脚本会报错并拒绝覆盖。任何一张下载或尺寸校验失败，均不会写入一个冒充完整牌组的 manifest。未看过的新增图仍标记 pending。

发布前运行 `python tools/verify_assets.py`。检查 78 个固定 ID、文件数量、未知文件、原图及输出解码、尺寸、哈希、重复图、来源证据、视觉证据及原 12 张字节基线。本轮已通过该命令。

牌图完整不代表 78 张牌均已有同等深度的教学单元；教学内容覆盖以应用声明为准。资产核验也不等同于浏览器、iPhone 渲染或长期离线验收。

## 逐牌来源

- `m00` 愚人 / The Fool: [RWS_Tarot_00_Fool.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_00_Fool.jpg)
- `m01` 魔术师 / The Magician: [RWS_Tarot_01_Magician.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_01_Magician.jpg)
- `m02` 女祭司 / The High Priestess: [RWS_Tarot_02_High_Priestess.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_02_High_Priestess.jpg)
- `m03` 皇后 / The Empress: [RWS_Tarot_03_Empress.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_03_Empress.jpg)
- `m04` 皇帝 / The Emperor: [RWS_Tarot_04_Emperor.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_04_Emperor.jpg)
- `m05` 教皇 / The Hierophant: [RWS_Tarot_05_Hierophant.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_05_Hierophant.jpg)
- `m06` 恋人 / The Lovers: [RWS_Tarot_06_Lovers.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_06_Lovers.jpg)
- `m07` 战车 / The Chariot: [RWS_Tarot_07_Chariot.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_07_Chariot.jpg)
- `m08` 力量 / Strength: [RWS_Tarot_08_Strength.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_08_Strength.jpg)
- `m09` 隐士 / The Hermit: [RWS_Tarot_09_Hermit.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_09_Hermit.jpg)
- `m10` 命运之轮 / Wheel of Fortune: [RWS_Tarot_10_Wheel_of_Fortune.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_10_Wheel_of_Fortune.jpg)
- `m11` 正义 / Justice: [RWS_Tarot_11_Justice.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_11_Justice.jpg)
- `m12` 倒吊人 / The Hanged Man: [RWS_Tarot_12_Hanged_Man.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_12_Hanged_Man.jpg)
- `m13` 死神 / Death: [RWS_Tarot_13_Death.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_13_Death.jpg)
- `m14` 节制 / Temperance: [RWS_Tarot_14_Temperance.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_14_Temperance.jpg)
- `m15` 恶魔 / The Devil: [RWS_Tarot_15_Devil.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_15_Devil.jpg)
- `m16` 高塔 / The Tower: [RWS_Tarot_16_Tower.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_16_Tower.jpg)
- `m17` 星星 / The Star: [RWS_Tarot_17_Star.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_17_Star.jpg)
- `m18` 月亮 / The Moon: [RWS_Tarot_18_Moon.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_18_Moon.jpg)
- `m19` 太阳 / The Sun: [RWS_Tarot_19_Sun.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_19_Sun.jpg)
- `m20` 审判 / Judgement: [RWS_Tarot_20_Judgement.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_20_Judgement.jpg)
- `m21` 世界 / The World: [RWS_Tarot_21_World.jpg](https://commons.wikimedia.org/wiki/File:RWS_Tarot_21_World.jpg)
- `w01` 权杖王牌 / Ace of Wands: [Wands01.jpg](https://commons.wikimedia.org/wiki/File:Wands01.jpg)
- `w02` 权杖二 / Two of Wands: [Wands02.jpg](https://commons.wikimedia.org/wiki/File:Wands02.jpg)
- `w03` 权杖三 / Three of Wands: [Wands03.jpg](https://commons.wikimedia.org/wiki/File:Wands03.jpg)
- `w04` 权杖四 / Four of Wands: [Wands04.jpg](https://commons.wikimedia.org/wiki/File:Wands04.jpg)
- `w05` 权杖五 / Five of Wands: [Wands05.jpg](https://commons.wikimedia.org/wiki/File:Wands05.jpg)
- `w06` 权杖六 / Six of Wands: [Wands06.jpg](https://commons.wikimedia.org/wiki/File:Wands06.jpg)
- `w07` 权杖七 / Seven of Wands: [Wands07.jpg](https://commons.wikimedia.org/wiki/File:Wands07.jpg)
- `w08` 权杖八 / Eight of Wands: [Wands08.jpg](https://commons.wikimedia.org/wiki/File:Wands08.jpg)
- `w09` 权杖九 / Nine of Wands: [Wands09.jpg](https://commons.wikimedia.org/wiki/File:Wands09.jpg)
- `w10` 权杖十 / Ten of Wands: [Wands10.jpg](https://commons.wikimedia.org/wiki/File:Wands10.jpg)
- `w11` 权杖侍从 / Page of Wands: [Wands11.jpg](https://commons.wikimedia.org/wiki/File:Wands11.jpg)
- `w12` 权杖骑士 / Knight of Wands: [Wands12.jpg](https://commons.wikimedia.org/wiki/File:Wands12.jpg)
- `w13` 权杖王后 / Queen of Wands: [Wands13.jpg](https://commons.wikimedia.org/wiki/File:Wands13.jpg)
- `w14` 权杖国王 / King of Wands: [Wands14.jpg](https://commons.wikimedia.org/wiki/File:Wands14.jpg)
- `c01` 圣杯王牌 / Ace of Cups: [Cups01.jpg](https://commons.wikimedia.org/wiki/File:Cups01.jpg)
- `c02` 圣杯二 / Two of Cups: [Cups02.jpg](https://commons.wikimedia.org/wiki/File:Cups02.jpg)
- `c03` 圣杯三 / Three of Cups: [Cups03.jpg](https://commons.wikimedia.org/wiki/File:Cups03.jpg)
- `c04` 圣杯四 / Four of Cups: [Cups04.jpg](https://commons.wikimedia.org/wiki/File:Cups04.jpg)
- `c05` 圣杯五 / Five of Cups: [Cups05.jpg](https://commons.wikimedia.org/wiki/File:Cups05.jpg)
- `c06` 圣杯六 / Six of Cups: [Cups06.jpg](https://commons.wikimedia.org/wiki/File:Cups06.jpg)
- `c07` 圣杯七 / Seven of Cups: [Cups07.jpg](https://commons.wikimedia.org/wiki/File:Cups07.jpg)
- `c08` 圣杯八 / Eight of Cups: [Cups08.jpg](https://commons.wikimedia.org/wiki/File:Cups08.jpg)
- `c09` 圣杯九 / Nine of Cups: [Cups09.jpg](https://commons.wikimedia.org/wiki/File:Cups09.jpg)
- `c10` 圣杯十 / Ten of Cups: [Cups10.jpg](https://commons.wikimedia.org/wiki/File:Cups10.jpg)
- `c11` 圣杯侍从 / Page of Cups: [Cups11.jpg](https://commons.wikimedia.org/wiki/File:Cups11.jpg)
- `c12` 圣杯骑士 / Knight of Cups: [Cups12.jpg](https://commons.wikimedia.org/wiki/File:Cups12.jpg)
- `c13` 圣杯王后 / Queen of Cups: [Cups13.jpg](https://commons.wikimedia.org/wiki/File:Cups13.jpg)
- `c14` 圣杯国王 / King of Cups: [Cups14.jpg](https://commons.wikimedia.org/wiki/File:Cups14.jpg)
- `s01` 宝剑王牌 / Ace of Swords: [Swords01.jpg](https://commons.wikimedia.org/wiki/File:Swords01.jpg)
- `s02` 宝剑二 / Two of Swords: [Swords02.jpg](https://commons.wikimedia.org/wiki/File:Swords02.jpg)
- `s03` 宝剑三 / Three of Swords: [Swords03.jpg](https://commons.wikimedia.org/wiki/File:Swords03.jpg)
- `s04` 宝剑四 / Four of Swords: [Swords04.jpg](https://commons.wikimedia.org/wiki/File:Swords04.jpg)
- `s05` 宝剑五 / Five of Swords: [Swords05.jpg](https://commons.wikimedia.org/wiki/File:Swords05.jpg)
- `s06` 宝剑六 / Six of Swords: [Swords06.jpg](https://commons.wikimedia.org/wiki/File:Swords06.jpg)
- `s07` 宝剑七 / Seven of Swords: [Swords07.jpg](https://commons.wikimedia.org/wiki/File:Swords07.jpg)
- `s08` 宝剑八 / Eight of Swords: [Swords08.jpg](https://commons.wikimedia.org/wiki/File:Swords08.jpg)
- `s09` 宝剑九 / Nine of Swords: [Swords09.jpg](https://commons.wikimedia.org/wiki/File:Swords09.jpg)
- `s10` 宝剑十 / Ten of Swords: [Swords10.jpg](https://commons.wikimedia.org/wiki/File:Swords10.jpg)
- `s11` 宝剑侍从 / Page of Swords: [Swords11.jpg](https://commons.wikimedia.org/wiki/File:Swords11.jpg)
- `s12` 宝剑骑士 / Knight of Swords: [Swords12.jpg](https://commons.wikimedia.org/wiki/File:Swords12.jpg)
- `s13` 宝剑王后 / Queen of Swords: [Swords13.jpg](https://commons.wikimedia.org/wiki/File:Swords13.jpg)
- `s14` 宝剑国王 / King of Swords: [Swords14.jpg](https://commons.wikimedia.org/wiki/File:Swords14.jpg)
- `p01` 星币王牌 / Ace of Pentacles: [Pents01.jpg](https://commons.wikimedia.org/wiki/File:Pents01.jpg)
- `p02` 星币二 / Two of Pentacles: [Pents02.jpg](https://commons.wikimedia.org/wiki/File:Pents02.jpg)
- `p03` 星币三 / Three of Pentacles: [Pents03.jpg](https://commons.wikimedia.org/wiki/File:Pents03.jpg)
- `p04` 星币四 / Four of Pentacles: [Pents04.jpg](https://commons.wikimedia.org/wiki/File:Pents04.jpg)
- `p05` 星币五 / Five of Pentacles: [Pents05.jpg](https://commons.wikimedia.org/wiki/File:Pents05.jpg)
- `p06` 星币六 / Six of Pentacles: [Pents06.jpg](https://commons.wikimedia.org/wiki/File:Pents06.jpg)
- `p07` 星币七 / Seven of Pentacles: [Pents07.jpg](https://commons.wikimedia.org/wiki/File:Pents07.jpg)
- `p08` 星币八 / Eight of Pentacles: [Pents08.jpg](https://commons.wikimedia.org/wiki/File:Pents08.jpg)
- `p09` 星币九 / Nine of Pentacles: [Pents09.jpg](https://commons.wikimedia.org/wiki/File:Pents09.jpg)
- `p10` 星币十 / Ten of Pentacles: [Pents10.jpg](https://commons.wikimedia.org/wiki/File:Pents10.jpg)
- `p11` 星币侍从 / Page of Pentacles: [Pents11.jpg](https://commons.wikimedia.org/wiki/File:Pents11.jpg)
- `p12` 星币骑士 / Knight of Pentacles: [Pents12.jpg](https://commons.wikimedia.org/wiki/File:Pents12.jpg)
- `p13` 星币王后 / Queen of Pentacles: [Pents13.jpg](https://commons.wikimedia.org/wiki/File:Pents13.jpg)
- `p14` 星币国王 / King of Pentacles: [Pents14.jpg](https://commons.wikimedia.org/wiki/File:Pents14.jpg)
