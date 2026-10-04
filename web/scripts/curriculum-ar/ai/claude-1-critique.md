Claude, first answer to the Arab state education curriculum prompt (2026-10-04). It is a critique only, no data.

- The model can't recall Arabic textbook tables of contents, so the unit names and links would be invented. "confidence" won't catch it.
- Math, sciences, English and some tracks follow the national curriculum translated into Arabic. The real differences are in Arabic, Hebrew as a second language, religion, history, homeland and civics, and literature. Ask the model to mark each subject "unique to Arab ed" or "national, translated", and drop the "don't copy the Hebrew curriculum" rule.
- The scope is too big for one run; split JSON across messages breaks. Run one subject at a time with real search.
- Schema fixes:
  - grades as an array.
  - Add id, textbook and curriculum_year.
  - Give the source per subject.
- Verify, don't assume:
  - Christianity in state Arab schools may be minor, since most of it is taught in church schools.
  - The starting grade for Hebrew as a second language changed.
  - The kindergarten core curriculum is organized by domains, not units.
- It offers to run real per-subject research starting with Arabic language.
