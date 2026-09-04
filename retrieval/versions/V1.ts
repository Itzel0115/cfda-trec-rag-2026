/**
 * V1 — 檢索全開（Q2D + Top-5000 + 三軌 head 重排 + 變深度）
 *
 * 相對 V0 只改檢索，生成端一個字都不動 —— 所以 V1 vs V0 的答案品質差異
 * 純粹來自「證據變好」，也就是受控實驗證明過的傳導效應
 * （同 generator/prompt/temp/深度/schema/evaluator，只換證據來源，四個答案指標全升）。
 *
 * 這一版定案的階段：
 *   ① 查詢   = 原題 + Query2Doc
 *   ② 池深   = 5000
 *   ④ head 重排 = BM25 + CE + dense 三軌 RRF，只排 top-100，101+ 原封不動
 *   ⑥ 提交   = 變深度 ce_calibrated ≥ 0.5，clamp [4,15]
 *
 * ⚠️ 這一版的 head 重排只是「三軌」這一個候選。④ 還有 6 個候選待對決
 *    （單軌 CE / LateOn / MiniLM / qwen3.6）—— 見 BAKEOFF.md ④。
 *    對決贏家確定後回頭改這裡。
 *
 * 已含：CE 失效退回 BM25（ce_dead_threshold=0.5）。離線實測 A/B1/B2/B3 四個 run，
 *       提交檔 nDCG@k +0.0008/+0.0052/+0.0013/+0.0002（全正），只動 1 題（topic 515）。
 *
 * 預期：nDCG@10 ~0.748｜R@1000 ~0.291｜MAP ~0.196｜MRR ~0.945
 * 規格：specs/V1.md
 */
import { pathToFileURL } from "node:url";
import { runIterativeAgenticRag, type PolicyOverride } from "../src/trec-rag-2026/agentic-rag/iterative_runner";
import { parse, applyVersionModels } from "../src/trec-rag-2026/agentic-rag/run_iterative_entry";
import { POLICY as V0 } from "./V0";

export const POLICY: PolicyOverride = {
  ...V0,
  retrieval_policy: "V1-q2d-top5000-tritrack-head-rerank-varK",

  // ② 候選池深度：1000 → 5000
  output_depth: 5000,

  // ① 查詢建構：加 Query2Doc（LLM 生成假設答案擴展查詢）
  q2d_enabled: true,

  // ④ head 重排：三軌 RRF（BM25 名次 + CE 名次 + dense 名次），只動 top-100
  rerank_depth: 100,
  fusion_dense: true,

  // ⑥ 提交深度：有 CE 校準分數了，改用 ce_calibrated 當信心指標
  //    （V0 沒有 reranker，走的是相對分數門檻）

  // 生成端維持 V0 —— 這一版不碰
};

// 全部走免費的 NCHC。V0–V2 刻意不用 Sol：這幾版要量的是檢索與寫作結構，
// 換模型會讓增益無法歸因；而且 V2 的 per-aspect 每題約 95 次呼叫，runner 是一題一題、一次一次跑的，全用 Sol 要 8.7 小時。
export const MODELS = { base: "gpt-oss-120b" };

async function main() {
  const opts = applyVersionModels(parse(process.argv.slice(2)), MODELS);
  console.log(JSON.stringify(await runIterativeAgenticRag({ ...opts, policy: POLICY }), null, 2));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e instanceof Error ? e.message : String(e)); process.exitCode = 1; });
}
