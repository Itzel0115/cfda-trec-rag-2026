/**
 * VF — 最終組合：V2 的生成端 × V4 的檢索端
 *
 * 這一版不是新方法，是**把已經量出來的兩個贏家接起來**。
 *
 * ── 為什麼需要這一版 ──
 *
 * 階梯是線性疊上來的，所以 V4/V5/S1 全部繼承了 V3 的 `verify_revise` ——
 * 而那個東西實測扣涵蓋 8–10pp。也就是說**檢索的改善（Core Facet + splice）
 * 從來只在「被拖累的生成端」上測過**，沒有跟 V2 的生成端組合過：
 *
 *   V2  per-aspect，沒有檢索改善          V_strict **0.4729**   R@1000 0.2866
 *   V3  V2 + verify_revise                        0.3719          0.3067
 *   V4  V3 + Core Facet + splice                  0.4030          0.3005
 *   VF  V2 的生成 + V4 的檢索                       **?**            **?**   ← 本版
 *
 * 依據是「檢索對生成端的傳導很弱」：V0→V1 的檢索 nDCG@k +9.3pp，
 * 但生成端配對比較是 8–11、分不出差異。所以加上 facet 之後涵蓋應該仍在 ~0.47，
 * 而 R@1000 拿到 facet 的好處。**兩個任務各取所需。**
 *
 * ── 各階段的取捨依據 ──
 *
 *   ①②③④⑥ 檢索   取 V4   Core Facet 多查詢 + splice-200 + 三軌重排 + 變深度
 *   ⑦⑧ 讀證據/寫作 取 V2   per-aspect 配對 17–4 勝 V4（p=0.007），最硬的結論
 *   ⑨ 引用         取 V2   verify_revise 實測扣 8–10pp 涵蓋，不划算
 *
 * ⑧ 這一階測過三個候選，per-aspect 全勝：
 *   per-aspect 0.4729 ／ 密集寫作 0.2174–0.2825 ／ 原子句 0.3311
 * 機制也清楚：決定分數的是證據廣度不是字數。V2 每題讀 86 篇、引用 27 篇；
 * 密集寫作只讀 12 篇、引用 10 篇，寫再長也碰不到那些 nugget。
 *
 * ── 模型 ──
 *
 * 生成端走免費的 gpt-oss-120b（per-aspect 收 base client），
 * **Sol 只用在 facet 查詢生成**（原作者實測 Sol 產的查詢 R@1000 0.309 vs 0.296）
 * 與 grounded revision。每題約 5–8 次，22 題約 150 次。
 *
 * 想讓 Sol 也寫答案的話用 `VFs.ts`（`aspect_writer:true`）——
 * 那會讓 Sol 呼叫暴增到每題 ~25 次，而且不保證更好，見該檔說明。
 *
 * ── 驗收 ──
 *
 *   主要：V_strict ≥ 0.4729 − 雜訊（0.043）= **0.430**。低於就代表 facet 反而傷了生成端。
 *   次要：R@1000 ≥ 0.30（V4 的水準）；nDCG@10 ≈ 0.76
 *   最佳情況：V_strict ~0.47 且 R@1000 ~0.30 —— 兩個任務同時拿到最好的
 *
 * 規格：docs/specs/VF.md
 */
import { pathToFileURL } from "node:url";
import { runIterativeAgenticRag, type PolicyOverride } from "../src/trec-rag-2026/agentic-rag/iterative_runner";
import { parse, applyVersionModels } from "../src/trec-rag-2026/agentic-rag/run_iterative_entry";
import { POLICY as V2 } from "./V2";

export const POLICY: PolicyOverride = {
  ...V2,
  retrieval_policy: "VF-v2generation-x-v4retrieval",

  // ①⑤ 取 V4 的檢索：Core Facet 多查詢建池 + splice-200 前段保護
  facet_queries: true,
  facet_depth: 1000,
  splice_head_keep: 200,

  // ⑨ 明確保持關閉 —— 這是本版與 V4 的關鍵差異
  verify_revise: false,

  // grounded revision 留著（V2 本來就開），但要把 BASE 的 3000 補上去，
  // 否則會像 V2 那樣 22/22 靜默失敗（爆掉後靜靜退回 reattribute，log 零錯誤）。
  revise_max_tokens: 16384,
};

// 生成端全部免費；Sol 只承接 facet 查詢生成與 grounded revision。
export const MODELS = { base: "gpt-oss-120b", writer: "codex:gpt-5.6-sol", query: "codex:gpt-5.6-sol" };

async function main() {
  const opts = applyVersionModels(parse(process.argv.slice(2)), MODELS);
  console.log(JSON.stringify(await runIterativeAgenticRag({ ...opts, policy: POLICY }), null, 2));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e instanceof Error ? e.message : String(e)); process.exitCode = 1; });
}
