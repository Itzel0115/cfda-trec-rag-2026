/**
 * V0 — 基準對照組（全部可選模組關閉）
 *
 * 目標：用同一份 runner 重現共用 baseline 的行為，作為後面所有版本的分母。
 * 不直接跑學姊的原版，是因為不同 codebase 的差異（重試、逾時、去重）會混進 delta 裡。
 *
 * 十個階段的起始狀態：
 *   ① 查詢 = 原題 only        ② 池深 = 1000          ③ 融合 = 1.0/0.25, k=60
 *   ④ head 重排 = 無          ⑤ 尾段召回 = 無        ⑥ 提交 = 變深度（相對分數門檻）
 *   ⑦ 讀證據 = 前 200 行×12   ⑧ 寫作 = 單次生成      ⑨ 引用 = keyword verify
 *   ⑩ 寫手 = gpt-oss-120b
 *
 * 預期（三份 qrels 平均）：nDCG@10 0.63–0.66｜R@1000 0.24–0.27｜V_strict 0.24–0.29｜FS 44–53%
 * 規格：specs/V0.md
 */
import { pathToFileURL } from "node:url";
import { runIterativeAgenticRag, type PolicyOverride } from "../src/trec-rag-2026/agentic-rag/iterative_runner";
import { parse, applyVersionModels } from "../src/trec-rag-2026/agentic-rag/run_iterative_entry";

export const POLICY: PolicyOverride = {
  retrieval_policy: "V0-baseline-equivalent",

  // ② 候選池深度：baseline 是 top-1000
  output_depth: 1000,

  // ① 查詢建構：只有原題 anchor + judge 產生的 follow-up
  q2d_enabled: false,

  // ④ head 重排：無。rerank_depth=0 會整段跳過 rerankTopOfRanking()，
  //    所以不會產生 fusion_scores.json，變深度提交自動走相對分數門檻。
  rerank_depth: 0,
  fusion_dense: false,

  // ⑦⑧ 讀證據與寫作：單次生成、6 篇 × 1000 字
  per_aspect_generation: false,
  comprehensive_answer: false,
  reflection: false,
  nugget_loop: false,
  breadth_first: false,
  answer_doc_chars: 1000,

  // ⑨ 引用驗證：只有 baseline 的 keyword verify
  llm_revise: false,
  reattribute: false,
  citation_verify: true,
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
