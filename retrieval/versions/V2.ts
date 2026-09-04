/**
 * V2 — 生成全開（per-aspect + breadth-first + 禁刪句 + grounded revision）
 *
 * 相對 V1 只改生成，檢索端完全不動。純 POLICY 差異，不需要新程式。
 *
 * 這一版定案的階段：
 *   ⑦ 讀證據 = per-aspect 各自搜尋（每面向獨立 BM25 + 讀 4 篇 × 3 輪）
 *   ⑧ 寫作   = per-aspect + breadth-first 預算分配
 *   ⑨ 引用   = grounded revision + 禁刪句，re-attribution 當後備
 *
 * breadth_first 解掉的問題：舊做法把字數預算「依序」分給各面向，
 * 前面吃光後面就被整段截斷 —— 22 題裡有 3 題只寫 1 句、涵蓋 0%。
 * 改成輪流分配後每個面向都先拿到一句，才輪第二句。
 *
 * ⚠️ nugget_loop 仍然關閉 —— 那是側翼 S2，要單獨量測才知道疊在密集寫作上
 *    還有沒有用（「缺口補寫」疊在密集寫作上是無效的：0.408→0.393）。
 *    現在打開會讓 V2 的歸因不乾淨。
 *
 * ⚠️ 這一版的寫作只是 ⑧ 的一個候選。已知 密集寫作在他的口徑下
 *    V_strict 0.414，遠高於本線最高的 0.325 —— 見 BAKEOFF.md ⑧。
 *
 * 預期：檢索指標與 V1 差異 ±0.005 內（只改生成不該動到檢索）｜FS 顯著上升
 * 規格：specs/V2.md
 */
import { pathToFileURL } from "node:url";
import { runIterativeAgenticRag, type PolicyOverride } from "../src/trec-rag-2026/agentic-rag/iterative_runner";
import { parse, applyVersionModels } from "../src/trec-rag-2026/agentic-rag/run_iterative_entry";
import { POLICY as V1 } from "./V1";

export const POLICY: PolicyOverride = {
  ...V1,
  retrieval_policy: "V2-peraspect-breadthfirst-neverdrop-revise",

  // ⑦⑧ 讀證據與寫作：per-aspect 各自搜尋 + 輪流分配字數預算
  per_aspect_generation: true,
  comprehensive_answer: true,
  reflection: true,
  breadth_first: true,
  answer_doc_chars: 1600,

  // ⚠️ 實測修正：BASE 的 aspect_max_tokens=1500 在 gpt-oss-120b 上會讓 75% 的 per-aspect
  // 生成回空（LLM_EMPTY_ASSISTANT_MESSAGE）—— 它是推理模型，推理 token 也吃這個額度，
  // 成功的那幾次只回 748–1271 字元（約 200–350 token），代表 1500 只是勉強夠。
  // 同一類坑先前已經在「面向分解 JSON 被截斷」踩過一次，V3 的密集寫作也是為此把 4096 調到 8192。
  aspect_max_tokens: 4096,
  answer_max_tokens: 8192,   // comprehensive 後備路徑同理（BASE 是 4096）

  // ⑨ 引用驗證：LLM grounded revision（禁刪句），失敗時退回 re-attribution
  llm_revise: true,
  reattribute: true,

  // 側翼 S2，不在這一版
  nugget_loop: false,
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
