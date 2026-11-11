# Future Releases - Quick Guide

## Before Publishing

1. **Test locally**: `npx vsce package` → Install .vsix → Verify changes work
2. **Update CHANGELOG.md**: Add new version entry with changes

## Publishing Workflow

```bash
# 1. Push code changes
git add .
git commit -m "Description of changes"
git push

# 2. Bump version and push
npm version patch    # or minor, or major
git push --follow-tags # 🤔last time I used `git push && git push --tags` though

# 3. Build and publish
vsce package
vsce publish
ovsx publish markdown-quarto-word-count-X.X.X.vsix
# Alternatively, pass the token directly with -p (it will appear in shell history)
# ovsx publish markdown-quarto-word-count-X.X.X.vsix -p YOUR_TOKEN

# 4. Verify on both marketplaces
# - VS Code: https://marketplace.visualstudio.com/items?itemName=yunierolivera.markdown-quarto-word-count
# - Open VSX: https://open-vsx.org/extension/yunierolivera/markdown-quarto-word-count
```

**Note:** If `vsce` or `ovsx` commands fail, prefix with `npx`: `npx vsce publish`

**Version types:**
- `patch`: Bug fixes (1.10.0 → 1.10.1)
- `minor`: New features (1.10.0 → 1.11.0)
- `major`: Breaking changes (1.10.0 → 2.0.0)