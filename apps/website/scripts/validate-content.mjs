import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import YAML from 'yaml';

const contentRoot = resolve(import.meta.dirname, '../../../packages/content');
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const displayOnlyCredits = new Set(['Phantoms Records (Limited Run)']);

const readYaml = (filePath, errors) => {
  try {
    return YAML.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    errors.push(`${filePath}: invalid YAML: ${error.message}`);
    return null;
  }
};

export function validateContent(root = contentRoot) {
  const errors = [];
  const peopleDirectory = join(root, 'people');
  const releasesDirectory = join(root, 'releases');
  const peopleFiles = readdirSync(peopleDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.ya?ml$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
  const peopleBySlug = new Map();

  for (const fileName of peopleFiles) {
    const filePath = join(peopleDirectory, fileName);
    const person = readYaml(filePath, errors);
    if (!person || typeof person !== 'object' || Array.isArray(person)) {
      errors.push(`${filePath}: expected a person mapping`);
      continue;
    }

    if (typeof person.name !== 'string' || !person.name.trim()) {
      errors.push(`${filePath}: name must be a non-empty display name`);
    }
    if (typeof person.slug !== 'string' || !slugPattern.test(person.slug)) {
      errors.push(`${filePath}: slug must contain lowercase letters, numbers, and single hyphens`);
    } else if (peopleBySlug.has(person.slug)) {
      errors.push(`${filePath}: duplicate slug "${person.slug}" also used by ${peopleBySlug.get(person.slug)}`);
    } else {
      peopleBySlug.set(person.slug, filePath);
    }
    if (person.role !== undefined) {
      errors.push(`${filePath}: use the plural "roles" field instead of legacy "role"`);
    }
    if (!Array.isArray(person.roles) || person.roles.some((role) => typeof role !== 'string' || !role.trim())) {
      errors.push(`${filePath}: roles must be a list of non-empty strings`);
    }
  }

  const validatePersonReference = (value, filePath, context, allowDisplayOnlyCredit = false) => {
    if (typeof value !== 'string' || !value.trim()) {
      errors.push(`${filePath}: ${context} must be a person slug`);
    } else if (allowDisplayOnlyCredit && displayOnlyCredits.has(value)) {
      return;
    } else if (!peopleBySlug.has(value)) {
      errors.push(`${filePath}: ${context} references unknown person slug "${value}"`);
    }
  };

  const releaseFolders = readdirSync(releasesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  for (const folder of releaseFolders) {
    const filePath = join(releasesDirectory, folder, 'release.yaml');
    const release = readYaml(filePath, errors);
    if (!release || typeof release !== 'object' || Array.isArray(release)) {
      errors.push(`${filePath}: expected a release mapping`);
      continue;
    }

    if (release.credits !== undefined && !Array.isArray(release.credits)) {
      errors.push(`${filePath}: credits must be a list`);
    }
    for (const [index, credit] of (Array.isArray(release.credits) ? release.credits : []).entries()) {
      if (credit && typeof credit === 'object' && !Array.isArray(credit)) {
        validatePersonReference(credit.name, filePath, `credits[${index}].name`, true);
      } else {
        errors.push(`${filePath}: credits[${index}] must be a mapping`);
      }
    }

    const checkTracks = (tracks, context) => {
      if (tracks === undefined) return;
      if (!Array.isArray(tracks)) {
        errors.push(`${filePath}: ${context} must be a list`);
        return;
      }

      for (const [trackIndex, track] of tracks.entries()) {
        if (!track || typeof track !== 'object' || Array.isArray(track)) {
          errors.push(`${filePath}: ${context}[${trackIndex}] must be a mapping`);
          continue;
        }
        if (!Array.isArray(track.artists)) {
          errors.push(`${filePath}: ${context}[${trackIndex}].artists must be a list`);
          continue;
        }
        for (const [artistIndex, artist] of track.artists.entries()) {
          validatePersonReference(artist, filePath, `${context}[${trackIndex}].artists[${artistIndex}]`);
        }
      }
    };

    if (release.tracks !== undefined && release.trackCategories !== undefined) {
      errors.push(`${filePath}: use either tracks or trackCategories, not both`);
    }
    checkTracks(release.tracks, 'tracks');
    if (release.trackCategories !== undefined && !Array.isArray(release.trackCategories)) {
      errors.push(`${filePath}: trackCategories must be a list`);
    } else {
      for (const [categoryIndex, category] of (release.trackCategories ?? []).entries()) {
        if (!category || typeof category !== 'object' || Array.isArray(category)) {
          errors.push(`${filePath}: trackCategories[${categoryIndex}] must be a mapping`);
          continue;
        }
        if (typeof category.name !== 'string' || !category.name.trim()) {
          errors.push(`${filePath}: trackCategories[${categoryIndex}].name must be a non-empty string`);
        }
        if (category.theme !== undefined && !['light', 'dark'].includes(category.theme)) {
          errors.push(`${filePath}: trackCategories[${categoryIndex}].theme must be "light" or "dark"`);
        }
        checkTracks(category.tracks, `trackCategories[${categoryIndex}].tracks`);
      }
    }
  }

  return errors;
}

const errors = validateContent();
if (errors.length > 0) {
  console.error(`Content validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('Content validation passed: people slugs and release person references are consistent.');
}
