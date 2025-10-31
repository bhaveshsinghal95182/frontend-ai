// commitlint.config.js

module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    // 1. Force the 'type' to be one of the listed values
    'type-enum': [
      2, // Level: Error (prevent commit)
      'always', // Applicable: Always
      [
        'feat',     // A new feature
        'fix',      // A bug fix
        'docs',     // Documentation only changes
        'style',    // Changes that do not affect the meaning of the code (white-space, formatting, etc)
        'refactor', // A code change that neither fixes a bug nor adds a feature
        'perf',     // A code change that improves performance
        'test',     // Adding missing tests or correcting existing tests
        'chore',    // Routine tasks (e.g. updating dependencies, adjusting build process)
        'revert',   // Reverting a previous commit
        'build',    // Changes that affect the build system or external dependencies
      ],
    ],

    // 2. Disable the default subject-case rules, allowing for any case
    'subject-case': [0], // Level: Ignore

    // 3. Enforce that a scope is provided (e.g., 'feat(auth): ...')
    'scope-empty': [
      2,        // Level: Error
      'never',  // Applicable: Never (must not be empty)
    ],

    // 4. Enforce a maximum length for the subject line
    'header-max-length': [
      2,      // Level: Error
      'always', // Applicable: Always
      72,     // Value: Max 72 characters
    ],
  },
};
