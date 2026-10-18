# Content naming conventions

## People: display names and slugs

Each file in `people/` represents one person and must define:

- `name`: the display name shown on the site. Preserve the artist's preferred spelling, capitalization, spaces, and special characters.
- `slug`: the stable, lowercase URL identifier, using only letters, numbers, and hyphens. This does not have to be mechanically derived from `name`.
- `roles`: a list of roles (for example, `Music Artist`).

For example, `j[]3` keeps its special characters in the display name, while its profile URL and release references use the URL-safe slug `j3`:

```yaml
name: j[]3
slug: j3
roles:
  - Music Artist
```

Use the exact slug—not the display name—in release YAML. Track artists go in `artists`; person credits go in `credits[].name`. The site resolves these fields by exact slug and displays the matching person's `name`. Do not change a slug casually: it is the profile URL and all release references depend on it.

## Release track lists

Existing single-part releases may keep a top-level `tracks` list. Releases with multiple parts use `trackCategories`, with each category holding its own `name`, optional `coverImage` and `theme`, and `tracks` list. See `releases/Verdict/release.yaml` for an example.

## Non-person credits

`Phantoms Records (Limited Run)` is currently a display-only organization credit, not a person slug, and is explicitly exempted by the content validator. New artist/credit references should point to people records; update the validator deliberately if another non-person credit needs an exception.

## Validation

Run `npm run build` from the repository root. The website build validates people slugs and release artist/credit references first, and fails with file and field context if content does not follow these rules.
