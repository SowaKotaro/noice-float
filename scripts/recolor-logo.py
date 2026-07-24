#!/usr/bin/env python3
"""タイトルロゴを参考デザイン（refs/NeoBrutalismCards.tsx）のパレットへ塗り替える。

    python3 scripts/recolor-logo.py

入力  src/assets/noicefloat-logo-source.png （元の配色。触らない）
出力  src/assets/noicefloat-logo.png        （サイトが読むのはこちら）

やっていること：元画像はフラットな数色＋アンチエイリアスで出来ているので、
「元の純色（ANCHOR の左）」を「新しい純色（右）」へ入れ替える。ただの置換だと
輪郭のアンチエイリアス画素（純色同士の中間色）が取り残されてギザギザになるため、
**各画素を全アンカーからの距離の逆数で重み付けして混ぜている**（IDW, 冪 POWER）。
純色の画素はほぼその純色の重み 1 になり、中間色は隣り合う 2 色の中間へ素直に移る。

アルファはそのまま維持する（元画像は縁の白だけを抜いた透過済み）。
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src/assets/noicefloat-logo-source.png"
DST = ROOT / "src/assets/noicefloat-logo.png"

# (元の純色, 新しい純色, 用途)
ANCHORS = [
    ("#000000", "#000000", "輪郭・本文の黒（変えない）"),
    ("#F7F7F7", "#FFFFFF", "プレートの白"),
    ("#09FA05", "#4ECDC4", "ソーダとフロートの文字 → ENGINEER の青緑"),
    ("#FA02AE", "#FFD166", "アイスの文字 → GENERAL の黄"),
    ("#FC1543", "#FF6B6B", "禁止マークとさくらんぼ → 差し色の赤"),
    ("#F7EBC5", "#FFE9B8", "アイスクリーム → 黄をうんと薄めた色"),
]

# 大きいほど純色が純色のまま残り、小さいほど全体が混ざってぼやける。
POWER = 6.0


def to_rgb(code: str) -> np.ndarray:
    code = code.lstrip("#")
    return np.array([int(code[i : i + 2], 16) for i in (0, 2, 4)], dtype=np.float32)


def main() -> None:
    image = Image.open(SRC).convert("RGBA")
    data = np.array(image).astype(np.float32)
    rgb, alpha = data[..., :3], data[..., 3:]

    src = np.stack([to_rgb(a) for a, _, _ in ANCHORS])
    dst = np.stack([to_rgb(b) for _, b, _ in ANCHORS])

    # 画素 → 各アンカーへの距離。0 割りを避けるため下限を入れる。
    dist = np.linalg.norm(rgb[:, :, None, :] - src[None, None, :, :], axis=-1)
    weight = 1.0 / np.maximum(dist, 1e-3) ** POWER
    weight /= weight.sum(axis=-1, keepdims=True)

    out = (weight[..., None] * dst[None, None, :, :]).sum(axis=2)
    result = np.concatenate([np.clip(out, 0, 255), alpha], axis=-1)
    Image.fromarray(result.astype(np.uint8), "RGBA").save(DST)

    print(f"{SRC.name} -> {DST.name}  {image.size[0]}x{image.size[1]}")
    for before, after, note in ANCHORS:
        print(f"  {before} -> {after}  {note}")


if __name__ == "__main__":
    main()
