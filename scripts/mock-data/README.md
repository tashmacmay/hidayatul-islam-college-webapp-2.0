# HIC 2026 Mock Data Package

**DEMONSTRATION CONTENT — NOT OFFICIAL SCHOOL INFORMATION.**

Contents: 4 All Grades term PDF calendars, 24 notices, 24 grade-based learning-resource metadata records, 8 mock policy metadata records, provisional SQL seed, and JSON content. Total 60 database records.

## Important limitations
- Calendar PDFs contain *illustrative activity sequences*, NOT official 2026 school term dates or confirmed school events. Verify all dates with school before publication.
- Resources and policy PDFs do not exist in this package. Their file URLs are intentionally invalid placeholders; create/obtain approved documents and host them before running SQL.
- The four calendar PDFs need to be hosted, and their SQL file_url placeholders replaced.
- SQL schema was inferred from code, not verified against the live database. Notices collection API uses `type`/`grade` but item API uses `category`/`recipients`. Resolve first.
- `LearningResources.created_by` requires a real Users.id; Notices.created_by_uid requires a valid Firebase UID.
- SQL refuses to run by default (`@ApprovedForTest=0`) and ends with `ROLLBACK TRANSACTION`. Change only in an authorized test environment after review.
- Do not wipe existing test rows or use production data without team authorization.
- No application/database modifications were made by producing this package.

## Workflow
1. Confirm schema, FK/default constraints, and notices column mismatch with developer/DBA.
2. Review content and replace any HIC-specific statements with school-approved wording.
3. Upload the four calendar PDFs to the intended file host and replace the 4 URLs.
4. Create/host approved resource and policy files; replace all other URL placeholders.
5. Confirm creator identifiers, use test database, set approval gate, execute with ROLLBACK first and inspect results.
6. After team approval, change rollback to commit and re-test website display.


## Actual learning-resource and policy PDFs
32 additional PDFs are provided in `Resource_and_Policy_PDFs/` (24 grade-specific learning resources and 8 fictional policy samples). These are demonstration documents, not approved school content. `mock_content.json` includes a `local_pdf` filename for each resource. The SQL script still contains placeholder hosted URLs; upload approved files and replace URLs before publication.


## PDF redesign (2026)
All 36 PDFs have been rebuilt with consistent branded headers, document metadata, substantive activities or policy sections, tables and learner response space. All content remains explicitly illustrative. Calendar activity weeks are not official dated term schedules. PDFs must be hosted and file URLs replaced before SQL execution.


## PDF redesign (2026)
All 36 PDFs have been rebuilt with consistent branded headers, document metadata, substantive activities or policy sections, tables and learner response space. All content remains explicitly illustrative. Calendar activity weeks are not official dated term schedules. PDFs must be hosted and file URLs replaced before SQL execution.
