# findlay-hannam.github.io
## Checks

```sh
pnpm test            # unit and page tests (also run by the pre-push hook)
pnpm lint
pnpm build
pnpm check:browser   # real headless Chrome against dist/, light and dark mode; needs `pnpm build` first
```

`pnpm check:browser --shots <dir>` also saves screenshots. Set `CHROME_PATH` if Chrome is not in a standard place. CI runs test, build and the browser checks before every deploy.
