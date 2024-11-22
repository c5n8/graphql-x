/** @type { import("@cspell/cspell-types").CSpellUserSettings } */
export default {
  version: '0.2',
  language: 'en',

  dictionaryDefinitions: [
    {
      name: 'words',
      path: './words.txt',
      addWords: true,
    },
  ],
  useGitignore: true,
  dictionaries: ['words'],
  ignorePaths: ['pnpm-lock.yaml'],
}
