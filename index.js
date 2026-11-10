/**
 * Host half of the approval-why bundle.
 *
 * The "why" panel and its button are the Client half; this file carries no
 * behaviour of its own.
 *
 * History worth keeping: 1.0.3 tried to force an approval card for
 * `create_skill` by asking the approval service from a `tools/execute`
 * listener. It turned out that `create_skill` already asks — the bundle that
 * ships the tool raises `{ kind: 'ask' }` from its own `tools/pre-execute`
 * guard — and that the dispatch waterfall reaches an extra listener on only
 * some of the paths a call can take. The result was a second, redundant card
 * on exactly those paths. So the gate was removed: the tool asks once on its
 * own, and the Client half explains that card in Chinese.
 *
 * If a future tool needs an approval card and has none, ask from
 * `tools/pre-execute` (the documented gate) rather than from dispatch, and add
 * the tool to a GATED list with a real reason.
 */

export function apply() {}
