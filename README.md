# sync-github-project-todo-md for Inkdrop

Sync between GitHub Project Board <-> Markdown Todo text.

## Installation

    ipm install sync-github-project-todo-md

## Usage

Prepare: Your note should include a GitHub Project URL liks `https://github.com/azu/github-project-todo-md/projects/1`.

```markdown
Project: https://github.com/azu/github-project-todo-md/projects/1
```

### Pull from GitHub Project

1. Click "Plugins" > "github-project-todo-md" > "Pull from GitHub Project"

This plugin adds GitHub Project as Markdown text into your active note.

Example result:

```markdown
Project: https://github.com/azu/github-project-todo-md/projects/1

https://github.com/azu/github-project-todo-md/projects/1

## To do

- [ ] [TODO ISSUE](https://github.com/azu/github-project-todo-md/issues/4)


## In progress

- [ ] [PROGRESS ISSUE](https://github.com/azu/github-project-todo-md/issues/3)


## Done

- [x] [DONE ISSUE](https://github.com/azu/github-project-todo-md/issues/5)
```

### Push to GitHub Project

1. Click "Plugins" > "github-project-todo-md" > "Push to GitHub Project"

Sync your note task checked to each GitHub Issues and Pull Requests.

If your note is following, This plugin open `issues/4` and `issues/3`, also close `issues/5`.

```markdown
Project: https://github.com/azu/github-project-todo-md/projects/1

https://github.com/azu/github-project-todo-md/projects/1

## To do

- [ ] [TODO ISSUE](https://github.com/azu/github-project-todo-md/issues/4)


## In progress

- [ ] [PROGRESS ISSUE](https://github.com/azu/github-project-todo-md/issues/3)


## Done

- [x] [DONE ISSUE](https://github.com/azu/github-project-todo-md/issues/5)
```
## Tests

- [ ] Write How to Tests

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
