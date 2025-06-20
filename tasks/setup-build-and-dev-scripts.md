# Setup Build and Dev Scripts

## Objective

Configure package.json scripts for development workflow as specified in tech stack.

## Tasks

1. Add npm scripts to package.json:
   - `dev`: "tsx watch src/index.ts" (hot-reload development)
   - `build`: "tsc -p ." (compile TypeScript)
   - `start`: "node dist/index.js" (run compiled server)
   - `test`: "vitest run" (run unit tests)
   - `lint`: "eslint 'src/\*_/_.ts'" (code linting)
   - `format`: "prettier --write ." (code formatting)
2. Configure TypeScript build output to dist/ directory
3. Setup watch mode for development with automatic restart
4. Ensure all scripts work correctly

## Acceptance Criteria

- [ ] npm run dev starts server with hot-reload
- [ ] npm run build compiles to dist/ successfully
- [ ] npm run start runs compiled server
- [ ] npm test executes all unit tests
- [ ] npm run lint checks code quality
- [ ] npm run format applies consistent styling
