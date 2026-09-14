# Tarot Pocket · 塔罗随身学

**Learn to read the cards. Remember why they mean something.**

A bilingual, image-first tarot learning companion. Recall, compare, find evidence, and read a spread — with taps instead of typing. Take the complete 78-card deck and the current lessons with you in a single offline HTML file.

[**Start learning →**](https://georgelu-creator.github.io/tarot-pocket/?lang=en) · [**Download the offline edition**](https://github.com/georgelu-creator/tarot-pocket/releases/download/v1.1.0/tarot-pocket-v1.1.0.html) · [简体中文](README.zh-CN.md) · [Roadmap](docs/ROADMAP.md)

![Tarot Pocket — practice, remember, and read](docs/images/hero.png)

![v1.1.0](https://img.shields.io/badge/release-v1.1.0-60465C)
![Languages](https://img.shields.io/badge/languages-English_%2F_简体中文-60465C)
[![Code license](https://img.shields.io/badge/code-MIT-60465C)](LICENSE)
[![Content license](https://img.shields.io/badge/content-CC_BY--SA_4.0-60465C)](CONTENT_LICENSE.md)

v1.1.0 provides **freely selectable, continuous learning for all 78 cards**, per-skill spaced review, and a separate pocket reading table. Open it on your phone; prepare offline content and add it to your home screen for travel. [Experience design and full learning plan](docs/EXPERIENCE_V1_1.md).

**Used an earlier version?** Open [Update while keeping records](https://georgelu-creator.github.io/tarot-pocket/update.html?lang=en), download the verified update, then choose to enter it. Do not clear site data.

## A small lesson that stays with you

A keyword flashcard might say “Four of Pentacles = holding on.” Tarot Pocket takes you through the picture: locate the hands and feet, recall the idea before seeing an answer, compare nearby meanings, connect Earth and Four, and try the card in a different position.

You choose both an interpretation and its evidence. Feedback tells you clearly when an answer is wrong and explains the difference. Quiet recall is recorded as self-assessment; an open reading is not graded as an objective prediction.

Tap **Start learning** on Home to meet your next card, or choose any card in **Learn**. Each card has seven stages: introduction, image evidence, close meanings, silent recall, a near-card comparison, contextual application, and reversals. Continue directly to the next card, or pause and return. Switching cards preserves each unfinished place.

<img src="docs/images/practice.png" width="390" alt="Practice: look closely, make a judgment, and find evidence">

## What you can do now

| Experience | Current version |
| --- | --- |
| Learn from real artwork | 78 historical Rider–Waite–Smith cards from one Pam-A scan set, with individual sources and checksums |
| Practice beyond recognition | 78 seven-stage card lessons, plus 56 further lesson steps and 24 earlier practice questions |
| Build a mental framework | Elements, numbers, visual evidence, similar-card distinctions, position changes, and contextual reversals |
| Learn how spreads work | 7 sourced spread structures and a daily draw, with compact guides and exact position definitions |
| Change the question | Love, career, and study contexts; the same card can play different roles |
| Draw without a physical deck | Optionally write a question, shuffle all 78 cards, cut the deck, pick without replacement, reveal cards, and optionally include reversals |
| Review by performance | Six skills follow SM-2 intervals; immediate retries do not count as delayed recall |
| Keep your place | Local progress, a resumable card table, up to 40 saved readings, and JSON export/import |
| Switch language | English and Simplified Chinese interface and learning content |

Browse **love, work, study, life, self-reflection and choices**. Each spread displays its layout and every position before shuffling, cutting and drawing. A separate **daily tarot draw** keeps the same card when revisited that day.

<img src="docs/images/reading.png" width="390" alt="Reading: review visual spread scope before entering your own question">
<img src="docs/images/ritual-cut.png" width="280" alt="Cut the deck / 切牌"><img src="docs/images/ritual-fan.png" width="280" alt="Choose from the fan / 扇形选牌">


## Built for a trip with patchy internet

The recommended phone entry is the public website:

1. Open [Tarot Pocket](https://georgelu-creator.github.io/tarot-pocket/?lang=en) in Safari.
2. Go to **Records → Check offline content and installation**, then download the complete offline content. Keep the page open until validation finishes.
3. In Safari’s Share menu, choose **Add to Home Screen**. Open the installed site and check its offline status again.
4. Before travel, test airplane mode, closing/reopening, an unfamiliar card, and saved progress on the actual phone.

Readiness reflects real download and inventory checks. Failed updates keep the previous complete release and do not force a reload during learning. A [single-file HTML edition](https://github.com/georgelu-creator/tarot-pocket/releases/download/v1.1.0/tarot-pocket-v1.1.0.html) remains available for browsers that support local JavaScript.

**Content and personal records are different.** Browsers can evict site data. Export JSON before switching devices or browsers. Git transfers source, never private questions or learning records. Learning and drawing need no account, external fonts or analytics. Optional AI interpretation sends only the current question and drawn cards to the configured service after an explicit request; provider keys remain server-side. See [AI service](docs/AI_SERVICE.md).

## Capabilities and limits

- All 78 cards have authored visual mnemonics, near-card distinctions, and three plausible distractors within a complete shared learning flow.
- Records distinguish encounters, first lessons, self-ratings, objective application, and delayed reviews. Marking a card read never means mastery.
- Six skills use SM-2 interval rules, with a 24-hour guard against repeated same-day promotion and immediate retries erasing a lapse. This is not FSRS, and product-specific long-term effectiveness is not claimed.
- Offline references are labeled as basic references. The optional DeepSeek/OpenAI service analyzes the written question and the whole spread; saved answers remain available offline. Quizzes do not interrupt readings. See [spread sources](docs/SPREAD_SOURCES.md).
- Content and translations still need independent tarot-teacher review. Automated checks do not replace expert review, physical iPhone tests, phone-restart tests, or extended offline travel. See [Handoff](docs/HANDOFF.md) for exact evidence.
- This release is an installable mobile website, not a native App Store application.

## Run it locally

Use **Python 3.10+** and **Node.js 22+**. The source is plain HTML, CSS, and JavaScript; Python builds the standalone edition and Playwright checks the interactions.

```sh
git clone https://github.com/georgelu-creator/tarot-pocket.git
cd tarot-pocket
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
npm ci
npx playwright install chromium webkit
npm run build
npm run serve
```

Open [the local demo](http://127.0.0.1:8765/demo/tarot-demo.html). Run `npm test` for the repository's checks. Read [Development](docs/DEVELOPMENT.md) for the file layout and validation workflow, or [Handoff](docs/HANDOFF.md) to continue on another computer.

## Help make the next lesson better

The most useful feedback is concrete: **which card, which position, which answer, and what made you hesitate?** Use the app, then [report an experience issue](https://github.com/georgelu-creator/tarot-pocket/issues/new?template=bug.yml), [improve a lesson or translation](https://github.com/georgelu-creator/tarot-pocket/issues/new?template=learning-content.yml), or [propose a feature](https://github.com/georgelu-creator/tarot-pocket/issues/new?template=feature.yml).

Teachers, learners, translators, and accessibility testers are welcome. Read [Contributing](CONTRIBUTING.md) before opening a pull request. Please use invented examples instead of sharing private reading histories. If this approach is useful to you, a star helps others find the project.

## Artwork and licenses

The artwork is by **Pamela Colman Smith**, from the historical Rider–Waite–Smith **Pam-A** deck scanned in the [TaionWC collection on Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Rider-Waite-Smith_tarot_deck_(TaionWC)). The project preserves image identity, provenance, dimensions, and hashes; it does not mix in modern redraws or generated substitutes.

- **Application code and tooling:** [MIT](LICENSE).
- **Original lessons, translations, documentation, and the authored card back:** [CC BY-SA 4.0](CONTENT_LICENSE.md).
- **Historical card artwork:** separate [artwork rights notice](ARTWORK_LICENSE.md), [source notes](assets/SOURCES.md), and [per-card manifest](assets/manifest.json). Source pages identify these works as public domain; that status is separate from the code and content licenses.

Tarot Pocket is an independent learning project. [Changelog](CHANGELOG.md) · [Security](SECURITY.md) · [Community expectations](CODE_OF_CONDUCT.md)
