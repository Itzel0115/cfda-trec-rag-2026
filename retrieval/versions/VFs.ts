/**
 * VFs — VF + 讓 Sol 也寫答案（⑩ per-aspect 生成改走 writer client）
 *
 * VF 的生成端走免費的 gpt-oss-120b，Sol 只做 facet 查詢與 grounded revision。
 * 本版把 **per-aspect 的句子生成也交給 Sol**（`aspect_writer: true`）。
 *
 * ── ⚠️ 這不是穩贏，而且很貴 ──
 *
 * **成本**：per-aspect 每題約 25 次 LLM 呼叫，22 題 ≈ **550 次 Sol**，
 * 而 Sol 每次 15–120 秒（codex exec 要 shell 出一個 CLI 行程）。
 * 實測 V4d 的 65 次 Sol 花了 53 分鐘 —— 550 次大概要 **7 小時以上**，
 * 而且是別人的訂閱額度。跑之前先確認額度撐得住。
 *
 * **效果不確定，而且已知證據偏負面**：
 *
 *   同一套密集寫作 prompt（原作者實測）
 *     gpt-oss 寫手   涵蓋 0.408   FS 67.0%
 *     Sol 寫手       涵蓋 0.395   FS 97.4%     ← 涵蓋反而降
 *
 *   我們自己的 V3（同配置只換 revision/驗證的寫手）
 *     免費模型       V_strict 0.3936   FS 50.3%
 *     Sol            V_strict 0.3719   FS 76.5%     ← 同樣是涵蓋降、引用升
 *
 * 兩組獨立資料都指向同一件事：**Sol 寫得比較保守 —— 引用大幅變好，涵蓋略降。**
 * 而 V_strict 是主指標。所以這一版的期望是「FS 大升、V_strict 持平或略降」，
 * 不是「兩個都升」。
 *
 * ── 那為什麼還要跑 ──
 *
 * 1. 上面兩組證據都是在**單次密集寫作**上量的，per-aspect 是十個獨立分支各寫幾句，
 *    Sol 的保守性在短片段上未必有同樣的代價 —— 這一格沒人測過。
 * 2. 如果 V_strict 只掉一點（< 雜訊 0.043）而 FS 從 18% 升到 90%+，
 *    那對「引用正確率」有權重的評分方式會是明顯的淨賺。
 * 3. VF 與 VFs 是同一套檢索、同一套寫作規則，**只差寫手** —— 乾淨的單變因比較，
 *    正好可以獨立量出 ⑩ 這一階的價值。
 *
 * ── 跑的順序 ──
 *
 * **先跑 VF**。VF 便宜（~150 次 Sol）而且是最可能的繳交版本；
 * VFs 貴七倍，等 VF 的數字出來再決定值不值得。
 *
 * ── 驗收 ──
 *
 *   V_strict 不低於 VF − 0.043（雜訊門檻）→ 可以接受，換到的 FS 是淨賺
 *   FS ≥ 90%（V2/VF 是 18.4%）
 *   若 V_strict 掉超過門檻 → ⑩ 在 per-aspect 上不划算，繳交用 VF
 *
 * 規格：docs/specs/VF.md
 */
import { pathToFileURL } from "node:url";
import { runIterativeAgenticRag, type PolicyOverride } from "../src/trec-rag-2026/agentic-rag/iterative_runner";
import { parse, applyVersionModels } from "../src/trec-rag-2026/agentic-rag/run_iterative_entry";
import { POLICY as VF } from "./VF";

export const POLICY: PolicyOverride = {
  ...VF,
  retrieval_policy: "VFs-vf-with-sol-writing",

  // ⑩ per-aspect 的句子生成改走 writer client（= Sol）
  aspect_writer: true,
};

export const MODELS = { base: "gpt-oss-120b", writer: "codex:gpt-5.6-sol", query: "codex:gpt-5.6-sol" };

async function main() {
  const opts = applyVersionModels(parse(process.argv.slice(2)), MODELS);
  console.log(JSON.stringify(await runIterativeAgenticRag({ ...opts, policy: POLICY }), null, 2));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e instanceof Error ? e.message : String(e)); process.exitCode = 1; });
}
