import FileHistoryPlugin from "main";
import { ItemView, WorkspaceLeaf , Notice} from "obsidian";

export const VIEW_TYPE = "historyfile-view";

interface FilePath {
  path: string;
  basename: string;
}

const mode = true; // true for creation order, false for modification order

export class HistoryFileView extends ItemView {
    constructor(leaf: WorkspaceLeaf, plugin: FileHistoryPlugin) {
      super(leaf, plugin);
    }
  
    getViewType() {
      return VIEW_TYPE;
    }
  
    getDisplayText() {
      return "historyfile view";
    }
  
    async onOpen() {
        const files = this.app.vault.getMarkdownFiles()
        const openFile = this.app.workspace.getActiveFile();

        if (mode) files.sort((a,b) => b.stat.ctime - a.stat.ctime)
        else files.sort((a,b) => b.stat.mtime - a.stat.mtime)
        

        const container = this.containerEl.children[1];
        container.empty();
        const list = container.createEl("ol", {
          cls: 'nav-folder-children'
        });

        for (let file of files){
            const li = list.createEl('li', { cls: "nav-file" })
            const div = li.createEl('div', {cls : 'nav-file-title'})

            div.createEl('span', {
              text: file.basename,
              cls: "nav-file-title-content" + (openFile && file.path === openFile.path ? 'is-active' : '')
          })

          li.addEventListener('click', (event) => {
              this.focusFile(file, event.ctrlKey || event.metaKey);
          });
        }

    }

    private readonly focusFile = (file: FilePath, shouldSplit = false): void => {
      const targetFile = this.app.vault
        .getFiles()
        .find((f) => f.path === file.path);
  
      if (targetFile) {
        let leaf = this.app.workspace.getMostRecentLeaf();
  
        const createLeaf = shouldSplit || leaf.getViewState().pinned;
        if (createLeaf) {
          leaf = this.app.workspace.createLeafBySplit(leaf);
        }
        leaf.openFile(targetFile);
      } else {
        new Notice('Cannot find a file with the required name');
        // this.plugin.saveData();
        // this.redraw();
      }
    };
  
    async onClose() {
      // Nothing to clean up.
    }
  }