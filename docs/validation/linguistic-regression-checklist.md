# Linguistic Regression Checklist

Use this checklist during PR review when a change affects tokenizer, normalization, search projection, or matching behavior. It supplements automated CI as a semantic validation layer; it does not replace formatting, linting, typechecking, tests, coverage, or repository validation.

See [manual validation scenarios](./manual-validation-scenarios.md) for concrete strings and expected observations.

## Trigger Conditions

Run this checklist for PRs that change:

- Normalization rules, rule ordering, or index-map behavior.
- Tokenizer drivers, dictionaries, fallback behavior, or segmentation boundaries.
- Search projection records, source-coordinate mapping, or span extraction helpers.
- Term matching, phrase matching, phrase-window logic, or match span reconstruction.
- Multilingual extensions, including Mandarin or additional Thai linguistic rules.
- Any optimization that changes text processing order, token ordering, or offset math.

## Review Checklist

- Confirm normalized text can still reconstruct raw source spans through the index map.
- Confirm collapsed whitespace maps to the first retained source whitespace character.
- Confirm boundary trimming removes leading/trailing whitespace without shifting retained source indices.
- Confirm Thai numerals normalize deterministically to Arabic numerals while preserving source-coordinate traceability.
- Confirm tokenizer segmentation remains deterministic for fixture Thai text such as `กินข้าวหรือยัง`.
- Confirm unknown punctuation, emoji, or unsupported characters are handled as fallback tokens rather than throwing.
- Confirm search projection records preserve normalized and original start/end offsets.
- Confirm projection records can reconstruct the exact raw source span used for highlighting or overlays.
- Confirm mixed Thai/English projection order remains stable and searchable.
- Confirm exact token matching returns deterministic matches ordered by appearance.
- Confirm phrase matching works across sequential projection records, including mixed Thai/English phrases.
- Confirm repeated phrase occurrences are all returned in deterministic source order.
- Confirm overlapping phrase matches behave intentionally and are documented by tests or review notes.
- Confirm future optimization preserves deterministic behavior and source-coordinate traceability.

## Reviewer Notes

Offset-safe behavior means normalized, projection, and match records must reliably reconstruct the original raw source span. A change is not ready to merge if it only produces the right visible normalized text but loses the ability to trace each projected token or match back to the original input.
