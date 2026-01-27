# Architecture Review Skill - Redesign

**Date:** 2026-01-23
**Problem:** Original skill was inefficient (227k tokens in Phase 1 alone)
**Solution:** Complete redesign following official skill patterns

---

## What Went Wrong (Original Design)

### Token Waste
- ❌ Spawned Explore agent → 83k tokens
- ❌ Spawned gap-analyzer → 82k tokens
- ❌ Analyzed all 34 modules automatically → 60k tokens
- ❌ Created exhaustive documentation → Unnecessary

**Total Phase 1:** 227k tokens just for analysis

### Wrong Approach
- Automated instead of interactive
- Tried to analyze everything upfront
- Didn't use existing documentation
- Created massive reports instead of focused decisions

---

## New Design (Correct Approach)

### Model: Interactive Decision Helper

Based on official skill patterns (brainstorming, systematic-debugging):

**brainstorming skill:** User-driven questions → Design → Document
**architecture-review:** User-driven questions → Decision → Document

### Token Budget

| Phase | Old | New |
|-------|-----|-----|
| Context gathering | 83k + 60k = 143k | <5k (read docs only) |
| Analysis | 82k | 0 (user provides context) |
| Documentation | 2k | <2k (one focused doc) |
| **TOTAL** | **227k** | **<10k** |

**Reduction:** 95% less tokens (22x more efficient)

---

## How It Works Now

### Phase 1: Context (Lightweight)
```
DO:
✅ Read README.md
✅ Read CLAUDE.md
✅ Read docs/architecture/* if exists
✅ Ask user: "What specific case are you trying to decide?"

DON'T:
❌ Spawn Explore agents
❌ Analyze all modules
❌ Read hundreds of files
```

### Phase 2: Guided Questions
```
Ask ONE question at a time:

"Tell me about module X. What does it do?"
"What modules depend on it?"
"Could it exist without module Y?"

Present 2-3 options with trade-offs.
```

### Phase 3: Document Decision
```
Output: docs/architecture/decisions/YYYY-MM-DD-<topic>.md

Format:
# Decision: [Topic]
## Context
## Options Considered
## Decision
## Criteria Established
## Examples
```

---

## Comparison with Official Skills

| Skill | Pattern | Token Budget |
|-------|---------|--------------|
| brainstorming | Questions → Design → Doc | <10k |
| writing-plans | Spec → Plan → Doc | <5k |
| systematic-debugging | Investigate → Fix → Doc | <10k |
| **architecture-review (new)** | **Questions → Decision → Doc** | **<10k** |

---

## Best Practices Applied

From Claude Code token optimization research:

1. ✅ **CLAUDE.md optimization** - Skill loads on-demand, not at session start
2. ✅ **User-driven** - Asks questions instead of analyzing
3. ✅ **Existing docs** - Uses README/CLAUDE.md, doesn't re-analyze
4. ✅ **Lightweight** - No heavy agents (Explore, gap-analyzer)
5. ✅ **Focused output** - One decision doc, not massive reports

---

## Sources

- [How to Optimize Claude Code Token Usage](https://claudelog.com/faqs/how-to-optimize-claude-code-token-usage/)
- [Maximizing Claude Code Subscription](https://juanjofuchs.github.io/ai-development/2026/01/20/maximizing-claude-code-subscription.html)
- [Optimizing Token Efficiency in Claude Code Workflows](https://medium.com/@pierreyohann16/optimizing-token-efficiency-in-claude-code-workflows-managing-large-model-context-protocol-f41eafdab423)
- [Manage costs effectively - Claude Code Docs](https://code.claude.com/docs/en/costs)

---

## Next Steps

1. Test the redesigned skill with a specific case
2. Validate it stays within token budget
3. Use it for real architectural decisions (Cash module consolidation, Recipe module creation, etc.)
