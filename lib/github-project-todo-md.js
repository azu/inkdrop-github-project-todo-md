'use babel';
import { fetchProjectBoard, toMarkdown, syncToProject } from "github-project-todo-md"
import { CompositeDisposable } from "event-kit"
import { actions } from "inkdrop"

const NAMESPACE = "sync-github-project-todo-md";
const pull = async () => {
    const GITHUB_TOKEN = inkdrop.config.get(`${NAMESPACE}.github_token`);
    if (!GITHUB_TOKEN) {
        inkdrop.notifications.addError("github_token is not set. please set github_token: Preferences > Plugins > sync-github-project-todo-md", {
            dismissable: true
        });
        throw new Error("github_token is not set");
    }
    const { editingNote } = inkdrop.store.getState();
    if (!editingNote) {
        throw new Error("editingNote is not found");
    }
    const { body } = editingNote;
    const match = body.match(
        /https:\/\/github\.com\/(?<owner>.*?)\/(?<repo>.*?)\/projects\/(?<number>\d+)/
    );
    if (!match) {
        return null;
    }
    const { owner, repo, number } = match.groups || {};
    if (!(owner && repo && number !== undefined)) {
        throw new Error("Does not include GitHub Project URL. No matching /https:\\/\\/github\\.com\\/(?<owner>.*?)\\/(?<repo>.*?)\\/projects\\/(?<number>\\d+)/");
    }
    console.log("[sync-github-project-todo-md]", {
        owner,
        repo,
        number
    })
    const board = await fetchProjectBoard({
        repo,
        owner,
        projectNumber: Number(number),
        token: GITHUB_TOKEN
    });
    inkdrop.store.dispatch(actions.editingNote.update({ body: body + "\n\n" + toMarkdown(board) }))
}

const push = async () => {
    const GITHUB_TOKEN = inkdrop.config.get(`${NAMESPACE}.github_token`);
    if (!GITHUB_TOKEN) {
        inkdrop.notifications.addError("github_token is not set. please set github_token: Preferences > Plugins > sync-github-project-todo-md", {
            dismissable: true
        });
        throw new Error("github_token is not set");
    }
    const { editingNote } = inkdrop.store.getState();
    if (!editingNote) {
        throw new Error("editingNote is not found");
    }
    const { body } = editingNote;
    const match = body.match(
        /https:\/\/github\.com\/(?<owner>.*?)\/(?<repo>.*?)\/projects\/(?<number>\d+)/
    );
    if (!match) {
        return null;
    }
    const { owner, repo, number } = match.groups || {};
    if (!(owner && repo && number !== undefined)) {
        throw new Error("Does not include GitHub Project URL. No matching /https:\\/\\/github\\.com\\/(?<owner>.*?)\\/(?<repo>.*?)\\/projects\\/(?<number>\\d+)/");
    }
    console.log("[sync-github-project-todo-md]", {
        owner,
        repo,
        number
    })
    await syncToProject(body, {
        repo,
        owner,
        projectNumber: Number(number),
        token: GITHUB_TOKEN
    });
    inkdrop.notifications.addInfo(
        `Push completed`,
        {
            dismissable: true
        }
    )
}
module.exports = {
    config: {
        github_token: {
            title: 'GitHub Personal Token',
            description:
                "Create `scope:repo` token https://github.com/settings/tokens/new",
            type: 'string',
        }
    },
    activate() {

        this.subscriptions = new CompositeDisposable()
        this.subscriptions.add(
            inkdrop.commands.add(document.body, {
                "sync-github-project-todo-md:pull": () => pull(),
            })
        )
        this.subscriptions.add(
            inkdrop.commands.add(document.body, {
                "sync-github-project-todo-md:push": () => push(),
            })
        )

    },

    deactivate() {
        this.subscriptions.dispose()
    }

};
