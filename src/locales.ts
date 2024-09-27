const locales = {
  en_us: {
    hello: "Hi {user}",
    greetings: {
      morning:
        "Good morning {user} EN Good morning {user} EN Good morning {user} EN Good morning {user} EN Good morning {user} EN Good morning {user} EN Good morning {user} EN Good morning {user} EN Good morning {user} EN",
      evening: "Good evening {user} EN",
      questions: {
        howRU: "Yo, how are you?",
        optional: "How is it going",
        a: ''

      },
    },
  },
  am_hy: {
    hello: "Barev {user}",
    greetings: {
      morning: "Baylus {user}",
      evening: "Barigun {user}",
      questions: {
        howRU: "Inch ka chka?",
        optional: "Eli en hin tnern eq?",
        a: ''
      },
    },
  },
} as const;
// The `as const` insertion is important here for the "values".
// It is good practice to make the locales object read-only to avoid accidentally tempering with app's texts.

type LocaleMap = typeof locales;

type LocaleName = keyof LocaleMap;

type Locale = LocaleMap[LocaleName];

let currentLocale: LocaleName = "am_hy";

/**
 * Improves clarity in later type conditionals
 */
type LocaleRecord = { [key: string]: string | LocaleRecord };

/**
 * Improves clarity when defining path keys
 * @see https://gist.github.com/sstur/faa75a1eb04e5b8bcf689bdb4343939b?permalink_comment_id=4562301#gistcomment-4562301
 */
type DotTail<T> = `.${T & string}`;
type PathKey<First extends string, Tail> = `${First}${Tail extends string
  ? DotTail<Tail>
  : never}`;

/**
 * Make sure we're only using string-type keys
 */
type StringKeysOrNever<T extends object> = keyof T extends infer S extends
  string
  ? S
  : never;

type PathInto<T extends LocaleRecord> = keyof {
  [K in StringKeysOrNever<T> as T[K] extends string
    ? K
    : T[K] extends LocaleRecord
    ? PathKey<K, PathInto<T[K]>>
    : never]: never; // Use `never` instead of any to prevent the type being used for actual objects
};

/**
 * Anotates the return value of t() with their actual values !
 * For this to work, the definition of {@link locales} MUST be ended with `as const`
 */

type LocaleText<
  Path extends string,
  Locale extends LocaleRecord,
> = Path extends `${infer Key}.${infer Tail}`
  ? Locale[Key] extends LocaleRecord
    ? LocaleText<Tail, Locale[Key]>
    : never
  : Locale[Path];

function get(object: LocaleRecord, path: Array<string>, index = 0): string {
  const key = path[index];
  if (key === undefined) {
    return "";
  }
  const result = object[key];
  if (result === undefined) {
    return "";
  }
  if (typeof result === "string") {
    return result;
  }
  return get(Object(result), path, index + 1);
}

/**
    Here we use type inference to then pass `key`'s literal type to {@link LocaleText}
**/
export function t<Key extends PathInto<Locale>>(key: Key) {
  return get(locales[currentLocale], key.split(".")) as LocaleText<Key, Locale>;
  // The `as` assertion here is necessary, since TypeScript can't infer the result of the .split() method.
}
