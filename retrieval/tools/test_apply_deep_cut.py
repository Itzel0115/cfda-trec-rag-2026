#!/usr/bin/env python3
"""apply_deep_cut.py 的 golden tests —— P0 cutoff 決策的直接證據。

規格要求（修正代碼交付規格 §2.1 驗收標準）覆蓋六種情境：
  1. rank-1 分數不是全池最大值（splice 場景，正是報告 M1 錨點問題的根源）
  2. 自然 cutoff 小於 min
  3. 自然 cutoff 大於 max
  4. 同分（ties）
  5. 空/不對稱 topic（兩份池的題目集不同）
  6. 多 topic、輸出順序穩定（同輸入重跑兩次逐位元組相同）

用法：
    python3 tools/test_apply_deep_cut.py

不依賴 pytest，純 stdlib，方便在任何環境直接跑。exit 0 = 全過。
"""
import hashlib
import subprocess
import sys
import tempfile
from pathlib import Path

SCRIPT = Path(__file__).parent / "apply_deep_cut.py"
FAILS = []


def check(name, cond, detail=""):
    status = "PASS" if cond else "FAIL"
    print(f"  [{status}] {name}" + (f" — {detail}" if detail and not cond else ""))
    if not cond:
        FAILS.append(name)


def write_trec(path, rows):
    """rows: list of (qid, docid, rank, score)"""
    with open(path, "w") as f:
        for qid, docid, rank, score in rows:
            f.write(f"{qid} Q0 {docid} {rank} {score:.6f} tag\n")


def run(pool_rows, rr_rows, tmpdir, extra_args=(), expect_fail=False):
    pool_p = Path(tmpdir) / "pool.trec"
    rr_p = Path(tmpdir) / "rr.trec"
    out_p = Path(tmpdir) / "out.tsv"
    write_trec(pool_p, pool_rows)
    write_trec(rr_p, rr_rows)
    proc = subprocess.run(
        [sys.executable, str(SCRIPT), str(pool_p), str(rr_p), "--out", str(out_p), *extra_args],
        capture_output=True, text=True,
    )
    if expect_fail:
        return proc, None
    lines = out_p.read_text().splitlines() if out_p.exists() else []
    return proc, lines


def ks_by_topic(lines):
    from collections import Counter
    return Counter(l.split()[0] for l in lines)


def test_rank1_not_global_max():
    """splice 場景：rank-1 分數 (0.50) 遠低於全池最大分 (0.90，在 rank 5，
    模擬 splice-200 之後 facet 尾巴分數比 head 高的情況——這正是報告 M1
    錨點問題的根源）。兩種錨點算出不同的 k，用來鎖死程式碼現在用的是哪一種。

    rank-1 錨點（程式碼現行行為）：門檻 = 0.50*0.2 = 0.10
        → d1(.50) d2(.30) d3(.20) d4(.15) d5(.90) 皆 >=0.10，d6(.05) 不過 → k=5
    若誤用全池最大值錨點（報告曾經寫錯的公式）：門檻 = 0.90*0.2 = 0.18
        → 只有 d1(.50) d2(.30) d3(.20) d5(.90) 過，d4(.15) 也不過 → k=4
    兩者不同（5 vs 4），這就是 88/119 題會算出不同結果的縮影。"""
    print("test_rank1_not_global_max")
    with tempfile.TemporaryDirectory() as d:
        pool = [
            ("q1", "d1", 1, 0.50), ("q1", "d2", 2, 0.30), ("q1", "d3", 3, 0.20),
            ("q1", "d4", 4, 0.15), ("q1", "d5", 5, 0.90),  # splice: 全池最大分在 rank 5
            ("q1", "d6", 6, 0.05),
        ]
        rr = pool  # 重排順序不影響 k 的計算，只影響輸出列的順序
        proc, lines = run(pool, rr, d)
        check("exit 0", proc.returncode == 0, proc.stderr)
        ks = ks_by_topic(lines)
        check("k=5（用 rank-1 錨點；若誤用全池最大值錨點會得到 4）",
              ks.get("q1") == 5, f"實際 k={ks.get('q1')}")


def test_natural_cutoff_below_min():
    """自然門檻算出的通過數 < min=4，應被夾到 min。"""
    print("test_natural_cutoff_below_min")
    with tempfile.TemporaryDirectory() as d:
        pool = [("q1", "d1", 1, 1.00), ("q1", "d2", 2, 0.01),
                ("q1", "d3", 3, 0.01), ("q1", "d4", 4, 0.01), ("q1", "d5", 5, 0.01)]
        rr = pool
        proc, lines = run(pool, rr, d)
        ks = ks_by_topic(lines)
        # 門檻 = 0.2*1.00=0.20，只有 d1 過門檻（自然 k=1）< min=4 → 夾到 4
        check("k=4（夾到 min，不是自然值 1）", ks.get("q1") == 4, f"實際 k={ks.get('q1')}")


def test_natural_cutoff_above_max():
    """自然門檻算出的通過數 > max，應被夾到 max。"""
    print("test_natural_cutoff_above_max")
    with tempfile.TemporaryDirectory() as d:
        pool = [("q1", f"d{i}", i, 1.0) for i in range(1, 11)]  # 10 篇同分
        rr = pool
        proc, lines = run(pool, rr, d, extra_args=["--max", "5"])
        ks = ks_by_topic(lines)
        # 全部同分 1.0，門檻 0.2 全過 → 自然 k=10 > max=5 → 夾到 5
        check("k=5（夾到 --max 5，不是自然值 10）", ks.get("q1") == 5, f"實際 k={ks.get('q1')}")


def test_ties():
    """同分文件：k 的計算（>=門檻）與輸出順序（依 reranked 池序）都要正確。"""
    print("test_ties")
    with tempfile.TemporaryDirectory() as d:
        pool = [("q1", "d1", 1, 0.50), ("q1", "d2", 2, 0.50), ("q1", "d3", 3, 0.50)]
        rr = [("q1", "d3", 1, 0.0), ("q1", "d2", 2, 0.0), ("q1", "d1", 3, 0.0)]  # 重排序反過來
        proc, lines = run(pool, rr, d)
        ks = ks_by_topic(lines)
        check("同分三篇皆 >= 門檻，k=3", ks.get("q1") == 3, f"實際 k={ks.get('q1')}")
        docids_in_order = [l.split()[2] for l in lines]
        check("輸出順序依 reranked 池序（d3,d2,d1），不是原池序",
              docids_in_order == ["d3", "d2", "d1"], f"實際順序={docids_in_order}")


def test_mismatched_topic_sets_rejected():
    """兩份池的題目集不同（規格「空 topic」情境的落地：一份有、一份沒有）應該報錯，不能靜默算出錯的結果。"""
    print("test_mismatched_topic_sets_rejected")
    with tempfile.TemporaryDirectory() as d:
        pool = [("q1", "d1", 1, 0.5), ("q2", "d1", 1, 0.5)]
        rr = [("q1", "d1", 1, 0.0)]  # 缺 q2
        proc, lines = run(pool, rr, d)
        check("題目集不符時 exit != 0", proc.returncode != 0, f"exit={proc.returncode}")
        check("錯誤訊息有指出是題目集不同", "題目" in proc.stdout + proc.stderr)


def test_multi_topic_and_stable_ordering():
    """多 topic 各自獨立算 k；同一組輸入重跑兩次，輸出逐位元組相同。"""
    print("test_multi_topic_and_stable_ordering")
    pool = [
        ("q1", "d1", 1, 1.00), ("q1", "d2", 2, 0.05),
        ("q10", "d1", 1, 0.80), ("q10", "d2", 2, 0.70), ("q10", "d3", 3, 0.10),
        ("q2", "d1", 1, 0.90), ("q2", "d2", 2, 0.85), ("q2", "d3", 3, 0.02),
    ]
    rr = pool
    with tempfile.TemporaryDirectory() as d1, tempfile.TemporaryDirectory() as d2:
        proc1, lines1 = run(pool, rr, d1)
        proc2, lines2 = run(pool, rr, d2)
        ks = ks_by_topic(lines1)
        check("三個 topic 都有獨立輸出", set(ks) == {"q1", "q10", "q2"}, f"實際={set(ks)}")
        check("q1: 門檻0.2 只 d1 過 → 夾到 min=4（但池只有2篇，警告後仍輸出2篇）",
              ks.get("q1") == 2, f"實際 k={ks.get('q1')}")
        h1 = hashlib.sha256("\n".join(lines1).encode()).hexdigest()
        h2 = hashlib.sha256("\n".join(lines2).encode()).hexdigest()
        check("重跑兩次輸出逐位元組相同（穩定排序）", h1 == h2, f"{h1} vs {h2}")
        print(f"    fixture output SHA-256: {h1}")
        return h1


def main():
    print(f"Testing: {SCRIPT}\n")
    test_rank1_not_global_max()
    test_natural_cutoff_below_min()
    test_natural_cutoff_above_max()
    test_ties()
    test_mismatched_topic_sets_rejected()
    fixture_hash = test_multi_topic_and_stable_ordering()

    print()
    if FAILS:
        print(f"✗ {len(FAILS)} 項失敗: {FAILS}")
        sys.exit(1)
    print(f"✅ 全部通過。多題穩定性 fixture SHA-256: {fixture_hash}")
    print("（此 hash 已記入 REPRODUCIBILITY.md）")


if __name__ == "__main__":
    main()
