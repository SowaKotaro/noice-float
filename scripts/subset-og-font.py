#!/usr/bin/env python3
"""OGP 画像を焼くためのフォントサブセットを作る。

ロゴ用（`subset-logo-font.py`）とは別物で、用途が違う。

- ロゴ用 … **ブラウザへ配る**。17 文字だけ。woff2。
- OG 用  … **ビルド時に satori が読む**。ブラウザには配らない。ttf。
            **satori は woff2 を読めない**ので flavor を付けずに出す。

OGP 画像に出る文字は `src/pages/og/_card.ts` の `OG_FIXED_TEXT` に集約してある。
そこにある固定文言 ＋ ASCII ＋ ひらがな・カタカナ（語の「読み」に何が来ても
出せるように全部入れる）だけを収録する。**説明文は画像に載せない**ので、
任意の漢字を持つ必要がなく、これだけで足りる。

    python3 scripts/subset-og-font.py

出力：
    src/assets/fonts/dela-gothic-one-og.ttf   （リポジトリに入れる。ビルド時に読む）

新しい固定文言を OGP に足して字が出なくなったら、`OG_FIXED_TEXT` を直して
これを実行し直すこと。
"""

from __future__ import annotations

import re
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
OUT_FONT = REPO / "src" / "assets" / "fonts" / "dela-gothic-one-og.ttf"
CARD_TS = REPO / "src" / "pages" / "og" / "_card.ts"

BASE = "https://raw.githubusercontent.com/google/fonts/main/ofl/delagothicone/"
TTF_URL = BASE + "DelaGothicOne-Regular.ttf"

# 語の「読み」は必ずかな。どんな語を足しても出せるよう、かなは全部入れる。
KANA = "".join(chr(c) for c in range(0x3041, 0x30FF + 1))
ASCII = "".join(chr(c) for c in range(0x20, 0x7F))
PUNCT = "、。「」・！？…—〜／"


def fixed_text() -> str:
    """`_card.ts` の OG_FIXED_TEXT から、画像に出る固定文言を読み取る。

    TypeScript 側を直したらここが自動で追従するようにしてある
    （二重管理にすると必ずどちらかが腐る）。
    """
    source = CARD_TS.read_text(encoding="utf-8")
    match = re.search(r"OG_FIXED_TEXT\s*=\s*`([^`]*)`", source)
    if not match:
        raise SystemExit(f"{CARD_TS} に OG_FIXED_TEXT が見つかりません")
    return match.group(1)


def main() -> int:
    text = ASCII + KANA + PUNCT + fixed_text()
    OUT_FONT.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        ttf = Path(tmp) / "DelaGothicOne-Regular.ttf"
        print(f"  取得: {TTF_URL}")
        with urllib.request.urlopen(TTF_URL, timeout=120) as res:
            ttf.write_bytes(res.read())

        subprocess.run(
            [
                sys.executable,
                "-m",
                "fontTools.subset",
                str(ttf),
                f"--text={text}",
                f"--output-file={OUT_FONT}",
                "--layout-features=kern",
                "--no-hinting",
                "--drop-tables+=DSIG",
            ],
            check=True,
        )

    size = OUT_FONT.stat().st_size / 1024
    print(f"\n{OUT_FONT.relative_to(REPO)}  {size:.1f} KB  （収録 {len(set(text))} 字）")
    print("ライセンスは public/fonts/OFL.txt と同一（SIL OFL 1.1）")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
