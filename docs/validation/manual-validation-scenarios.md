# Manual Validation Scenarios

Use these scenarios with the [linguistic regression checklist](./linguistic-regression-checklist.md). The expected observations are semantic review targets, not raw object dumps.

Offset-safe behavior means normalized, projection, and match records must reliably reconstruct the original raw source span. Any future optimization must preserve deterministic behavior and source-coordinate traceability.

## Scenarios

### Thai-Only Segmentation

- Input: `กินข้าวหรือยัง`
- Expected: segmentation remains `กิน`, `ข้าว`, `หรือยัง`.
- Verify: projection and match spans reconstruct the same raw Thai substrings.

### Mixed Thai/English Text

- Input: `hello กินข้าว world`
- Expected: English fallback tokens and Thai dictionary tokens remain in source order.
- Verify: phrase matching across mixed text does not reorder tokens or drift coordinates.

### Thai Numerals

- Input: `ราคา ๑๒๓ บาท`
- Expected: Thai numerals normalize to `123`.
- Verify: matches for `123` and `๑๒๓` both point back to the original raw span `๑๒๓`.

### Repeated Whitespace In Source

- Input: `กิน   ข้าว`
- Expected: normalized text contains a single space between terms.
- Verify: the normalized space maps to the first retained original whitespace, and the phrase span reconstructs `กิน   ข้าว`.

### Repeated Whitespace In Query

- Source input: `กิน ข้าว`
- Query: `กิน      ข้าว`
- Expected: query whitespace normalizes before matching.
- Verify: the phrase match still resolves to the original source span `กิน ข้าว`.

### Unknown Character Fallback

- Inputs: `กิน?`, `กิน🙂`, `กิน??`
- Expected: punctuation or emoji does not throw and remains matchable as fallback projection records.
- Verify: matches for `?`, `🙂`, or `??` reconstruct the exact raw unknown span.

### Phrase Match Spanning Multiple Tokens

- Input: `กินข้าวหรือยัง กินข้าว`
- Query: `กินข้าว`
- Expected: phrase matching can span `กิน` plus `ข้าว`.
- Verify: the first phrase match reconstructs the first raw `กินข้าว`, and the later occurrence is still returned in source order.

### Repeated Phrase Occurrences

- Input: `กินข้าว กินข้าว`
- Query: `กินข้าว`
- Expected: both phrase occurrences are returned deterministically.
- Verify: each match reconstructs its own raw source span, including the correct original offsets around the separating space.

### Overlapping Matches

- Fixture concept: repeated fallback-token text such as `aaaa`.
- Query: `aa`
- Expected: overlapping matches are deterministic and ordered by appearance.
- Verify: reconstructed raw spans correspond to the first, second, and third `aa` windows.
