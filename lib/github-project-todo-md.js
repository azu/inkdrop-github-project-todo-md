"use babel";
import { fetchProjectBoard, syncToProject, toMarkdown, ProjectBoardItem } from "github-project-todo-md";
import { CompositeDisposable } from "event-kit";
import { actions } from "inkdrop";

const debounce = (callback, delay = 200) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback(...args), delay);
    };
};
const NAMESPACE = "sync-github-project-todo-md";
const hasSyncProject = (content) => {
    const firstLine = content.split("\n")[0] ?? "";
    return /https:\/\/github\.com\/(?<owner>.*?)\/(?<repo>.*?)\/projects\/(?<number>\d+)/.test(firstLine);
};
const pull = async () => {
    const GITHUB_TOKEN = inkdrop.config.get(`${NAMESPACE}.github_token`);
    const includesNote = Boolean(inkdrop.config.get(`${NAMESPACE}.includes_note`));
    if (!GITHUB_TOKEN) {
        inkdrop.notifications.addError(
            "github_token is not set. please set github_token: Preferences > Plugins > sync-github-project-todo-md",
            {
                dismissable: true
            }
        );
        throw new Error("github_token is not set");
    }
    const { editingNote } = inkdrop.store.getState();
    if (!editingNote) {
        throw new Error("editingNote is not found");
    }
    const { body } = editingNote;
    if (!hasSyncProject(body)) {
        return;
    }
    const match = body.match(/https:\/\/github\.com\/(?<owner>.*?)\/(?<repo>.*?)\/projects\/(?<number>\d+)/);
    if (!match) {
        return null;
    }
    const { owner, repo, number } = match.groups || {};
    if (!(owner && repo && number !== undefined)) {
        throw new Error(
            "Does not include GitHub Project URL. No matching /https:\\/\\/github\\.com\\/(?<owner>.*?)\\/(?<repo>.*?)\\/projects\\/(?<number>\\d+)/"
        );
    }
    console.log("[sync-github-project-todo-md]", {
        owner,
        repo,
        number,
        includesNote
    });
    const board = await fetchProjectBoard({
        repo,
        owner,
        projectNumber: Number(number),
        token: GITHUB_TOKEN,
        includesNote
    });
    // Original Issue → CR issue. It is for debug
    const urlMap = new Map();
    const markdown = toMarkdown(board, {
        itemMapping: (/** @type {ProjectBoardItem} **/ item) => {
            // https://github.com/azu/missue
            const labels = item.labels ? item.labels.nodes : [];
            const hasCrossReferenceLabel = labels.find((node) => node.name === "CR");
            if (hasCrossReferenceLabel) {
                const title = item.title.replace(/^\[.*?](.*?)/, "$1").trim();
                const matchedReferURL = item.body.match(
                    /https:\/\/github\.com\/(?<owner>.*?)\/(?<repo>.*?)\/(?<type>(issues|pull))\/(?<number>\d+)/
                );
                if (!matchedReferURL) {
                    return item;
                }
                urlMap.set(matchedReferURL[0], item.url);
                return {
                    ...item,
                    title,
                    url: matchedReferURL[0]
                };
            } else {
                return item;
            }
        }
    });
    inkdrop.store.dispatch(actions.editingNote.update({ body: body + "\n\n" + markdown }));
    inkdrop.store.dispatch(actions.editor.change(true));
};

const push = async () => {
    const GITHUB_TOKEN = inkdrop.config.get(`${NAMESPACE}.github_token`);
    const includesNote = Boolean(inkdrop.config.get(`${NAMESPACE}.includes_note`));
    if (!GITHUB_TOKEN) {
        inkdrop.notifications.addError(
            "github_token is not set. please set github_token: Preferences > Plugins > sync-github-project-todo-md",
            {
                dismissable: true
            }
        );
        throw new Error("github_token is not set");
    }
    const { editingNote } = inkdrop.store.getState();
    if (!editingNote) {
        throw new Error("editingNote is not found");
    }
    const { body } = editingNote;
    if (!hasSyncProject(body)) {
        return;
    }
    const match = body.match(/https:\/\/github\.com\/(?<owner>.*?)\/(?<repo>.*?)\/projects\/(?<number>\d+)/);
    if (!match) {
        return null;
    }
    const { owner, repo, number } = match.groups || {};
    if (!(owner && repo && number !== undefined)) {
        throw new Error(
            "Does not include GitHub Project URL. No matching /https:\\/\\/github\\.com\\/(?<owner>.*?)\\/(?<repo>.*?)\\/projects\\/(?<number>\\d+)/"
        );
    }
    console.log("[sync-github-project-todo-md]", {
        owner,
        repo,
        number,
        includesNote
    });
    await syncToProject(body, {
        repo,
        owner,
        projectNumber: Number(number),
        token: GITHUB_TOKEN,
        includesNote
    });
    inkdrop.notifications.addInfo(`Push completed`, {
        dismissable: true
    });
};
module.exports = {
    config: {
        github_token: {
            title: "GitHub Personal Token",
            description: "Create `scope:repo` token https://github.com/settings/tokens/new",
            type: "string"
        },
        includes_note: {
            title: "Includes note",
            description: "Push/Pull includes note as a target",
            type: "boolean"
        },
        auto_push_on_save: {
            title: "Auto push on saving",
            description: "When change the note, push the changes to GitHub automatically",
            type: "boolean"
        }
    },
    activate() {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(
            inkdrop.commands.add(document.body, {
                "sync-github-project-todo-md:pull": () => pull()
            })
        );
        this.subscriptions.add(
            inkdrop.onEditorLoad((event) => {
                /**
                 * @type {CodeMirror}
                 */
                const codeMirror = event.cm;
                codeMirror.on(
                    "change",
                    debounce(() => {
                        push();
                    }, 10 * 1000)
                );
            })
        );
        this.subscriptions.add(
            inkdrop.commands.add(document.body, {
                "sync-github-project-todo-md:push": () => push()
            })
        );
    },

    deactivate() {
        this.subscriptions.dispose();
    }
};
