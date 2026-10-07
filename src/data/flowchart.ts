export type NodeKind = 'action' | 'decision' | 'end'

export interface FlowNode {
  id: number
  phase: number
  kind: NodeKind
  title: string
  detail: string
  /** Action button copy. Only set for kind === 'action'. */
  btn?: string
  /** Decision button copy. Only set for kind === 'decision'. */
  yesLabel?: string
  noLabel?: string
  /** Where this node leads. 'end' nodes have none of these. */
  next?: number
  yes?: number
  no?: number
  /** Layout grid position — see COL_WIDTH / LANE_Y below. */
  col: number
  lane: -1 | 0 | 1 | 2
  /** Pixel position on the overview canvas, derived from col/lane. */
  x: number
  y: number
}

export interface Phase {
  name: string
  color: string
}

export const PHASES: Phase[] = [
  { name: 'Budget & expenses', color: 'var(--p0)' },
  { name: 'Emergency fund', color: 'var(--p1)' },
  { name: 'Employer match', color: 'var(--p2)' },
  { name: 'Pay down debt', color: 'var(--p3)' },
  { name: 'IRA & near-term', color: 'var(--p4)' },
  { name: 'Retirement, 15%', color: 'var(--p5)' },
  { name: 'Other goals', color: 'var(--p6)' },
]

// Layout grid: columns flow left-to-right as progress through the trail,
// lanes offset up (-1) for a "yes, then merge back" detour, or down (1, 2)
// for a loop that rechecks its own decision node.
export const COL_WIDTH = 170
export const BASE_X = 70
export const LANE_Y: Record<number, number> = { [-1]: 190, 0: 300, 1: 410, 2: 520 }
export const NODE_W = 150
export const NODE_H = 56
export const CANVAS_W = 4050
export const CANVAS_H = 650

const RAW_NODES: Omit<FlowNode, 'id' | 'x' | 'y'>[] = [
  { phase: 0, kind: 'action', title: 'Create a budget', detail: "Knowing where your money goes is the foundation of every decision that follows. Lay out your income against your expenses before moving on.", btn: "Budget's set — continue", next: 1, col: 0, lane: 0 },
  { phase: 0, kind: 'action', title: 'Pay rent or mortgage', detail: "Include renters' or homeowners' insurance if it's required.", btn: 'Paid — continue', next: 2, col: 1, lane: 0 },
  { phase: 0, kind: 'action', title: 'Buy food and groceries', detail: "If your situation is severe, it's fine to prioritize utilities ahead of this one.", btn: 'Paid — continue', next: 3, col: 2, lane: 0 },
  { phase: 0, kind: 'action', title: 'Pay essential utilities', detail: 'Power, water, heat, toiletries — the basics that keep a household running.', btn: 'Paid — continue', next: 4, col: 3, lane: 0 },
  { phase: 0, kind: 'action', title: 'Pay income-earning expenses', detail: 'Transportation, internet, phone — anything required to keep earning income.', btn: 'Paid — continue', next: 5, col: 4, lane: 0 },
  { phase: 0, kind: 'action', title: 'Pay for health care', detail: 'Health insurance premiums and out-of-pocket health care expenses.', btn: 'Paid — continue', next: 6, col: 5, lane: 0 },
  { phase: 0, kind: 'action', title: 'Make minimum payments on every debt', detail: 'Student loans, credit cards, every loan you carry — at least the minimum, on all of them, no exceptions.', btn: 'Done — continue', next: 7, col: 6, lane: 0 },
  { phase: 1, kind: 'action', title: 'Build a small emergency fund', detail: "Save $1,000, or one month of expenses — whichever is greater. Keep it in a savings or checking account, not invested.", btn: 'Fund started — continue', next: 8, col: 7, lane: 0 },
  { phase: 1, kind: 'action', title: 'Pay non-essential bills in full', detail: "Cable, streaming, phone plans beyond the basics — anything discretionary that's still a fixed bill.", btn: 'Paid — continue', next: 9, col: 8, lane: 0 },

  { phase: 2, kind: 'decision', title: 'Does your employer match retirement contributions?', detail: 'Check whether your 401(k), 403(b), or similar plan comes with an employer match.', yesLabel: 'Yes, they match', noLabel: 'No match offered', yes: 10, no: 11, col: 9, lane: 0 },
  { phase: 2, kind: 'action', title: 'Capture the full match — and stop there', detail: "Contribute exactly enough to get every dollar of the match. Nothing above that amount yet — the rest of the plan comes first.", btn: 'Contributing — continue', next: 11, col: 9.5, lane: -1 },

  { phase: 3, kind: 'decision', title: 'Do you have high-interest debt?', detail: 'Any balance charging 10% or higher — most credit cards, some personal loans.', yesLabel: 'Yes, I do', noLabel: "No, I don't", yes: 12, no: 13, col: 10, lane: 0 },
  { phase: 3, kind: 'action', title: 'Pay it down: avalanche or snowball', detail: "Avalanche attacks the highest rate first and saves the most money. Snowball clears the smallest balance first and builds momentum. Either works — pick the one you'll actually stick with.", btn: 'Keep going — recheck', next: 11, col: 10.5, lane: 1 },

  { phase: 1, kind: 'action', title: 'Grow your emergency fund to 3–6 months', detail: 'Once high-interest debt is gone, build your reserve up to three to six months of living expenses. Still cash — a savings or checking account.', btn: 'Growing it — continue', next: 14, col: 11, lane: 0 },

  { phase: 3, kind: 'decision', title: 'Do you have moderate-interest debt?', detail: 'Remaining balances over roughly 4–5% interest, not counting your mortgage.', yesLabel: 'Yes, I do', noLabel: "No, I don't", yes: 15, no: 16, col: 12, lane: 0 },
  { phase: 3, kind: 'action', title: 'Pay it down: avalanche or snowball', detail: 'Same two methods as before — avalanche for the highest rate, snowball for the smallest balance. Apply whichever fits your situation.', btn: 'Keep going — recheck', next: 14, col: 12.5, lane: 1 },

  { phase: 4, kind: 'action', title: 'Max out an IRA — Roth or Traditional', detail: 'Weigh Roth against Traditional based on your tax situation now versus in retirement, then contribute up to the yearly limit.', btn: 'Contributing — continue', next: 17, col: 13, lane: 0 },

  { phase: 4, kind: 'decision', title: 'Any big purchases coming up?', detail: 'College, a professional certification, a car you need to get to work — required spending in the near future.', yesLabel: "Yes, something's coming", noLabel: 'No, nothing planned', yes: 18, no: 19, col: 14, lane: 0 },
  { phase: 4, kind: 'action', title: 'Set the money aside now', detail: "Save what you'll need in a plain savings or checking account — not invested, since you'll need it soon.", btn: 'Saving — continue', next: 19, col: 14.5, lane: -1 },

  { phase: 5, kind: 'decision', title: 'Are you saving 15% of your income for retirement?', detail: "Add up every retirement account together — 401(k), IRA, everything. If you're behind on retirement savings, you may need more than 15%.", yesLabel: 'Yes, 15% or more', noLabel: 'Not yet', yes: 23, no: 20, col: 15, lane: 0 },
  { phase: 5, kind: 'decision', title: 'Can you put more into a workplace plan?', detail: 'A 401(k), 403(b), or similar plan through your employer.', yesLabel: "Yes, there's room", noLabel: 'No such plan', yes: 21, no: 22, col: 15.5, lane: 1 },
  { phase: 5, kind: 'action', title: 'Raise your contributions to 15%', detail: "Increase what you're putting into your workplace plan until total retirement savings reach 15% of pre-tax income.", btn: 'Adjusted — recheck', next: 19, col: 15.9, lane: 2 },
  { phase: 5, kind: 'action', title: 'Use a self-employed or taxable account', detail: 'Self-employed: an Individual 401(k), SEP-IRA, or SIMPLE IRA. Otherwise: a plain taxable brokerage account. Either way, keep going until you hit 15%.', btn: 'Adjusted — recheck', next: 19, col: 17.1, lane: 2 },

  { phase: 6, kind: 'decision', title: 'Eligible for an HSA?', detail: "You'll need a qualified high-deductible health plan to open an investable Health Savings Account.", yesLabel: "Yes, I'm eligible", noLabel: "No, I'm not", yes: 24, no: 25, col: 16.5, lane: 0 },
  { phase: 6, kind: 'action', title: 'Max your HSA contributions', detail: 'Triple tax advantage — pre-tax in, tax-free growth, tax-free for qualified medical expenses. Hard to beat.', btn: 'Maxed — continue', next: 25, col: 17, lane: -1 },

  { phase: 6, kind: 'decision', title: "Saving for a child's college?", detail: 'Only relevant if you have kids and want to help cover some or all of their education.', yesLabel: 'Yes, I want to help', noLabel: 'No, not applicable', yes: 26, no: 27, col: 17.7, lane: 0 },
  { phase: 6, kind: 'action', title: 'Open a 529 or similar account', detail: 'Look at the education savings options available to you and contribute what fits your plan.', btn: 'Set up — continue', next: 27, col: 18.2, lane: -1 },

  { phase: 6, kind: 'action', title: "From here, it's your call", detail: "You've covered the essentials, the debt, and the baseline retirement target. What comes next depends entirely on your own goals.", btn: 'Show me the options', next: 28, col: 18.9, lane: 0 },

  { phase: 6, kind: 'decision', title: 'Want to retire early?', detail: 'An aggressive path toward leaving the workforce ahead of schedule.', yesLabel: "Yes, that's the goal", noLabel: 'Not a priority', yes: 29, no: 30, col: 19.9, lane: 0 },
  { phase: 6, kind: 'action', title: 'Push every account to its limit', detail: 'Max your 401(k)/403(b), look into a mega backdoor Roth IRA if available to you, then keep saving in a taxable account.', btn: 'On it — continue', next: 30, col: 20.4, lane: -1 },

  { phase: 6, kind: 'decision', title: 'Any other near-term goals?', detail: "A down payment, a vehicle, a wedding, a trip — things you're saving toward on a shorter timeline.", yesLabel: 'Yes, a few', noLabel: "No, I'm set", yes: 31, no: 32, col: 21.1, lane: 0 },
  { phase: 6, kind: 'action', title: 'Match the money to the timeline', detail: 'Cash or savings for anything under three to five years out. A conservative mix of stocks and bonds for goals further out than that.', btn: 'Got it — finish', next: 32, col: 21.6, lane: -1 },

  { phase: 6, kind: 'end', title: "You've reached the end of the trail", detail: "That's the whole route — from your first budget to funding goals you chose for yourself. Revisit it any time your situation changes.", col: 22.3, lane: 0 },
]

export const NODES: Record<number, FlowNode> = Object.fromEntries(
  RAW_NODES.map((n, id) => [id, { ...n, id, x: xFor(n.col), y: LANE_Y[n.lane] }])
)

export const START_ID = 0

export function xFor(col: number): number {
  return BASE_X + col * COL_WIDTH
}

export interface FlowEdge {
  from: number
  to: number
  label: 'Yes' | 'No' | null
}

export const EDGES: FlowEdge[] = Object.values(NODES).flatMap((n): FlowEdge[] => {
  if (n.kind === 'decision') {
    return [
      { from: n.id, to: n.yes as number, label: 'Yes' },
      { from: n.id, to: n.no as number, label: 'No' },
    ]
  }
  if (n.kind === 'action') {
    return [{ from: n.id, to: n.next as number, label: null }]
  }
  return []
})
