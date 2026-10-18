import {readdirSync, readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import YAML from 'yaml';
import {normalizePlatformKey, type PlatformKey} from './platforms';

export type PersonLink = {
  platform?: PlatformKey | string;
  url?: string;
  [key: string]: unknown;
};

export type PersonStatus = 'core' | 'contributor' | string;

export type PersonRecord = {
  name: string;
  roles?: string[];
  status?: PersonStatus;
  links?: PersonLink[];
  slug: string;
  [key: string]: unknown;
};

const projectRoot = resolve(process.cwd(), '..', '..');
const peopleDir = join(projectRoot, 'packages', 'content', 'people');

export function extractPeopleFromDirectory(directoryPath = peopleDir): PersonRecord[] {
  if (!directoryPath) {
    return [];
  }

  try {
    const files = readdirSync(directoryPath, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.(ya?ml)$/i.test(entry.name))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    const people = files
      .map((fileName) => {
        const filePath = join(directoryPath, fileName);
        const raw = readFileSync(filePath, 'utf8');
        const parsed = YAML.parse(raw) as Record<string, unknown> | null;

        if (!parsed || typeof parsed !== 'object' || !('name' in parsed) || typeof parsed.name !== 'string') {
          return null;
        }

        if (typeof parsed.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(parsed.slug)) {
          throw new Error(`Person must have a valid explicit slug: ${filePath}`);
        }

        const rawRoles = Array.isArray(parsed.roles)
          ? parsed.roles
          : Array.isArray(parsed.role)
            ? parsed.role
            : typeof parsed.role === 'string'
              ? [parsed.role]
              : [];

        const normalizedLinks = Array.isArray(parsed.links)
          ? parsed.links.map((link) => {
              if (!link || typeof link !== 'object') {
                return link;
              }

              const nextLink = { ...link } as PersonLink;
              const legacyPlatform =
                typeof (link as { name?: unknown }).name === 'string'
                  ? (link as { name: string }).name
                  : undefined;
              const platformValue =
                typeof nextLink.platform === 'string' ? nextLink.platform : legacyPlatform;

              if (typeof platformValue === 'string') {
                nextLink.platform = normalizePlatformKey(platformValue);
              }
              return nextLink;
            })
          : [];

        const roles = rawRoles
          .filter((role): role is string => typeof role === 'string' && role.trim().length > 0)
          .map((role) => role.trim());

        return {
          ...parsed,
          roles,
          links: normalizedLinks,
          slug: parsed.slug,
        } as PersonRecord;
      })
      .filter((person): person is PersonRecord => person !== null);

    const slugs = new Set<string>();
    for (const person of people) {
      if (slugs.has(person.slug)) {
        throw new Error(`Duplicate person slug: ${person.slug}`);
      }
      slugs.add(person.slug);
    }

    return people;
  } catch (error) {
    console.error('Unable to load people content directory:', directoryPath, error);
    throw error;
  }
}

export const people = extractPeopleFromDirectory();
