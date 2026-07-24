#!/usr/bin/env python3
"""タイトルロゴ専用フォントのサブセットを作る。

ロゴは `src/components/SiteLogo.astro` の 17 文字しか使わないので、
Dela Gothic One（SIL OFL 1.1・重めのポップなゴシック）をその文字だけに
削って woff2 にする。フルセットは 2.5MB だが、削ると数 KB に収まる。

    python3 scripts/subset-logo-font.py

出力：
    public/fonts/dela-gothic-one-logo.woff2
    public/fonts/OFL.txt          （再配布に必要なライセンス全文）

ロゴの文字を変えたら LOGO_TEXT を直して実行し直すこと。
足りない文字はフォールバック（システムのゴシック）で出てしまい、
その字だけ細く見えるのですぐ分かる。
"""

from __future__ import annotations

import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

# ロゴに出る文字だけ。重複はサブセッタが吸収するのでそのまま並べてよい。
LOGO_TEXT = "そのフロート、アイス乗ってません！"

REPO = Path(__file__).resolve().parent.parent
OUT_DIR = REPO / "public" / "fonts"
OUT_FONT = OUT_DIR / "dela-gothic-one-logo.woff2"
OUT_LICENSE = OUT_DIR / "OFL.txt"

BASE = "https://raw.githubusercontent.com/google/fonts/main/ofl/delagothicone/"
TTF_URL = BASE + "DelaGothicOne-Regular.ttf"
LICENSE_URL = BASE + "OFL.txt"


def fetch(url: str, dest: Path) -> None:
    print(f"  取得: {url}")
    with urllib.request.urlopen(url, timeout=120) as res:
        dest.write_bytes(res.read())


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        ttf = Path(tmp) / "DelaGothicOne-Regular.ttf"
        fetch(TTF_URL, ttf)
        fetch(LICENSE_URL, OUT_LICENSE)

        subprocess.run(
            [
                sys.executable,
                "-m",
                "fontTools.subset",
                str(ttf),
                f"--text={LOGO_TEXT}",
                "--flavor=woff2",
                f"--output-file={OUT_FONT}",
                # 記号の合字などは要らないので、必要な機能だけ残す。
                "--layout-features=kern",
                "--no-hinting",
                "--desubroutinize",
                "--drop-tables+=DSIG",
            ],
            check=True,
        )

    print(f"\n{OUT_FONT.relative_to(REPO)}  {OUT_FONT.stat().st_size / 1024:.1f} KB")
    print(f"{OUT_LICENSE.relative_to(REPO)}  （SIL OFL 1.1／再配布に必要）")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
