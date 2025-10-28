# Code Quality Guidelines

This document outlines the code quality tools and standards used in the Lab Booking System project.

## Tools Used

### ESLint

- **Purpose**: Static code analysis to identify problematic patterns and enforce coding standards
- **Configuration**: Separate configurations for backend (`.eslintrc.js`) and frontend
  (`.eslintrc.js`)
- **Rules**: Enforces consistent code style, best practices, and error prevention

### Prettier

- **Purpose**: Automatic code formatting to ensure consistent style
- **Configuration**: Root-level `.prettierrc.js` with project-wide formatting rules
- **Integration**: Works with ESLint through `eslint-plugin-prettier`

### Husky + lint-staged

- **Purpose**: Pre-commit hooks to ensure code quality before commits
- **Configuration**: Runs linting and formatting on staged files only
- **Benefits**: Prevents poorly formatted or problematic code from being committed

## Available Scripts

### Root Level

```bash
npm run lint              # Lint both backend and frontend
npm run lint:fix          # Fix linting issues in both projects
npm run format            # Format all files with Prettier
npm run format:check      # Check if files are properly formatted
```

### Backend

```bash
cd backend
npm run lint              # Lint backend code
npm run lint:fix          # Fix backend linting issues
npm run format            # Format backend files
npm run format:check      # Check backend formatting
```

### Frontend

```bash
cd frontend
npm run lint              # Lint frontend code
npm run lint:fix          # Fix frontend linting issues
npm run format            # Format frontend files
npm run format:check      # Check frontend formatting
```

## Pre-commit Hooks

The project uses Husky to run pre-commit hooks that:

1. Lint and fix issues in staged JavaScript/JSX files
2. Format staged files with Prettier
3. Prevent commits if there are unfixable linting errors

## ESLint Rules

### Backend Rules

- Enforces Node.js best practices
- Requires consistent indentation (2 spaces)
- Enforces single quotes and semicolons
- Prevents unused variables and console statements
- Ensures proper error handling patterns

### Frontend Rules

- Extends React app configuration
- Enforces React best practices and hooks rules
- Maintains consistent JSX formatting
- Prevents common React anti-patterns
- Ensures accessibility compliance

## Prettier Configuration

- **Print Width**: 80 characters
- **Tab Width**: 2 spaces
- **Quotes**: Single quotes for JS/JSX, double quotes for JSON
- **Semicolons**: Always required
- **Trailing Commas**: Always in multiline structures
- **Bracket Spacing**: Enabled
- **Arrow Parens**: Avoid when possible

## IDE Integration

### VS Code

Install the following extensions for the best experience:

- ESLint
- Prettier - Code formatter
- Auto format on save (recommended)

### Configuration

Add to your VS Code settings.json:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.autoFixOnSave": true
}
```

## Troubleshooting

### Common Issues

1. **ESLint errors on save**: Make sure ESLint extension is installed and enabled
2. **Formatting conflicts**: Ensure Prettier is set as the default formatter
3. **Pre-commit hooks not running**: Check that Husky is properly installed with `npm run prepare`

### Manual Fixes

If pre-commit hooks fail:

```bash
# Fix all linting issues
npm run lint:fix

# Format all files
npm run format

# Check what needs to be fixed
npm run lint
npm run format:check
```

## Best Practices

1. **Run linting before committing**: Use `npm run lint` to check for issues
2. **Format code regularly**: Use `npm run format` or enable format-on-save
3. **Fix warnings promptly**: Don't let linting warnings accumulate
4. **Follow established patterns**: Maintain consistency with existing code
5. **Use meaningful variable names**: ESLint will catch unused variables
6. **Handle errors properly**: Don't ignore ESLint error-handling rules
