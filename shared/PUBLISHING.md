# Publishing Guide for ideal-photography-shared

This guide will help you publish the `ideal-photography-shared` package to npm.

## 📋 Prerequisites

1. **npm account**: Make sure you have an npm account at [npmjs.com](https://www.npmjs.com)
2. **npm CLI**: Install npm CLI globally if not already installed
3. **Authentication**: Login to npm from your terminal

## 🔐 Authentication

First, login to npm:

```bash
npm login
```

You'll be prompted for:
- Username
- Password
- Email
- Two-factor authentication (if enabled)

## 📦 Publishing Steps

### 1. Navigate to the shared directory

```bash
cd shared
```

### 2. Check package contents

Verify what will be included in the package:

```bash
npm pack --dry-run
```

This will show you exactly what files will be included in the package.

### 3. Test the package locally (optional)

Before publishing, you can test the package locally:

```bash
npm pack
npm install ./ideal-photography-shared-1.0.0.tgz
```

### 4. Publish to npm

```bash
npm publish
```

If this is the first time publishing this package name, it will be published as version 1.0.0.

### 5. Verify publication

Check that your package is live on npm:

```bash
npm view @ideal-photography/shared
```

Or visit: https://www.npmjs.com/package/@ideal-photography/shared

## 🔄 Updating the Package

### 1. Update version

When making changes, update the version in `package.json`:

```bash
# For patch updates (bug fixes)
npm version patch

# For minor updates (new features)
npm version minor

# For major updates (breaking changes)
npm version major
```

### 2. Publish updates

```bash
npm publish
```

## 🏷️ Version Management

The package uses semantic versioning:

- **Patch** (1.0.x): Bug fixes and minor improvements
- **Minor** (1.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking changes

## 📝 Package Information

### Package Name
- **Name**: `@ideal-photography/shared`
- **Scope**: Under the `ideal-photography` organization (`@ideal-photography`)
- **Description**: Shared GraphQL and Mongoose logic for Ideal Photography PWAs

### Keywords
The package is tagged with relevant keywords for discoverability:
- photography
- graphql
- mongoose
- apollo
- booking-system
- gallery-management
- review-system
- authentication
- admin-panel
- pwa

### Files Included
- `mongoDB/` - All Mongoose models and methods
- `graphql/` - GraphQL typeDefs and resolvers
- `validations/` - Validation utilities
- `index.js` - Main entry point
- `README.md` - Documentation

## 🚨 Important Notes

### Before Publishing
1. **Test thoroughly**: Make sure all functionality works
2. **Update documentation**: Ensure README.md is complete and accurate
3. **Check dependencies**: Verify all dependencies are correctly listed
4. **Review .npmignore**: Ensure no sensitive files are included

### After Publishing
1. **Test installation**: Try installing the package in a new project
2. **Update documentation**: Update any references to use the npm package
3. **Monitor issues**: Watch for any issues reported by users

## 🔧 Troubleshooting

### Common Issues

**Package name already exists**
```bash
# Check if the name is available
npm search ideal-photography-shared

# If taken, consider using a scope
npm publish --access public
```

**Authentication errors**
```bash
# Re-login to npm
npm logout
npm login
```

**Permission errors**
```bash
# Check if you're logged in as the correct user
npm whoami
```

## 📚 Post-Publication

### Update your projects

After publishing, update your server projects to use the npm package:

```bash
# Remove local shared dependency
npm uninstall ../shared

# Install from npm
npm install ideal-photography-shared
```

### Update import statements

Change your imports from:
```js
const { models } = require('../shared/mongoDB');
```

To:
```js
const { models } = require('ideal-photography-shared/mongoDB');
```

## 🎯 Making it Private Later

When you're ready to make the package private:

1. **Upgrade to npm Pro** (required for private packages)
2. **Unpublish the public package**:
   ```bash
   npm unpublish ideal-photography-shared --force
   ```
3. **Update package.json** to include scope:
   ```json
   {
     "name": "@your-username/ideal-photography-shared",
     "private": true
   }
   ```
4. **Publish as private**:
   ```bash
   npm publish --access restricted
   ```

## 📞 Support

If you encounter any issues during publishing:

- Check [npm documentation](https://docs.npmjs.com/)
- Review [npm publishing guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- Contact npm support if needed

---

**Happy publishing! 🚀** 