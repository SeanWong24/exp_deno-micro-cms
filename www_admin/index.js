import { css, html, LitElement } from "./lit-core.min.js";

export class AppRoot extends LitElement {
  static styles = css``;

  static properties = {
    generalItemKeys: { state: true },
    documentGroups: { state: true },
    selectedDocumentGroupId: { state: true },
    documentItems: { state: true },
  };

  async firstUpdated() {
    await this.#updateGeneralItems();
    await this.#updateDocumentGroups();
    await this.#updateDocumentItems();
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <h1>MicroCMS</h1>
      <hr />
      ${this.#renderGeneralItems()}
      <hr />
      ${this.#renderDocumentGroups()}
      <hr />
      ${this.#renderDocumentItems()}
    `;
  }

  async #authenticate() {
    alert("Authentication needed.");
    const passcode = prompt("Enter the passcode to get authenticated.");
    await fetch(`/api/auth/sign-in?passcode=${passcode}`, { method: "POST" });
  }

  async #checkAuthenticationStatus() {
    try {
      return await fetch("/api/auth").then((response) => response.ok);
    } catch (_) {
      return false;
    }
  }

  async #updateGeneralItems() {
    this.generalItemKeys = await fetch("/api/general").then((response) =>
      response.json()
    );
  }

  async #updateDocumentGroups() {
    this.documentGroups = await fetch("/api/document").then((response) =>
      response.json()
    );
  }

  async #updateSelectedDocumentGroup(group) {
    this.selectedDocumentGroupId = group;
    await this.#updateDocumentItems();
  }

  async #updateDocumentItems() {
    if (!this.selectedDocumentGroupId) return;
    const { items } = await fetch(
      `/api/document/${this.selectedDocumentGroupId}`,
    ).then((response) => response.json());
    this.documentItems = items;
  }

  #renderGeneralItems() {
    return html`
      <h2>General</h2>
      <ul>
        ${
      this.generalItemKeys?.map(
        (key) =>
          html`
              <li>
                ${key}
                <button
                  @click=${async () => {
            const value = await fetch(`/api/general/${key}`).then(
              (response) => response.text(),
            );
            alert(value);
          }}
                >
                  Get value
                </button>
                <button
                  @click=${async () => {
            if (!(await this.#checkAuthenticationStatus())) {
              await this.#authenticate();
            }
            await fetch(`/api/general/${key}`, {
              method: "POST",
              body: prompt("Enter the value (as JSON)", ""),
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            });
            this.#updateGeneralItems();
          }}
                >
                  Update value
                </button>
                <button
                  @click=${async () => {
            if (!(await this.#checkAuthenticationStatus())) {
              await this.#authenticate();
            }
            await fetch(`/api/general/${key}`, {
              method: "DELETE",
              credentials: "include",
            });
            this.#updateGeneralItems();
          }}
                >
                  Delete
                </button>
              </li>
            `,
      )
    }
      </ul>
      <button
        @click=${async () => {
      if (!(await this.#checkAuthenticationStatus())) {
        await this.#authenticate();
      }
      await fetch(
        `/api/general/${
          prompt(
            "Enter the key",
            new Date().getTime().toString(),
          )
        }`,
        {
          method: "POST",
          body: prompt("Enter the value (as JSON)", ""),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );
      this.#updateGeneralItems();
    }}
      >
        Add new
      </button>
    `;
  }

  #renderDocumentGroups() {
    return html`
      <h2>Document Groups</h2>
      <ul>
        ${
      this.documentGroups?.map(
        (group) =>
          html`
              <li>
                ${group.id}
                <button
                  @click=${async () => {
            const { metadata } = await fetch(
              `/api/document/${group.id}`,
            ).then((response) => response.json());
            alert(JSON.stringify(metadata));
          }}
                >
                  Get metadata
                </button>
                <button
                  @click=${async () => {
            await fetch(`/api/document/${group.id}`, {
              method: "POST",
              body: prompt("Enter the metadata (as JSON)", ""),
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            });
            this.#updateDocumentGroups();
          }}
                >
                  Update metadata
                </button>
                <button
                  @click=${async () => {
            await fetch(
              `/api/document/${group.id}?rename=${
                prompt("Enter a new group name", group.id) || group.id
              }`,
              { method: "POST", credentials: "include" },
            );
            this.#updateDocumentGroups();
          }}
                >
                  Rename
                </button>
                <button
                  @click=${async () => {
            await fetch(`/api/document/${group.id}`, {
              method: "DELETE",
              credentials: "include",
            });
            this.#updateDocumentGroups();
          }}
                >
                  Delete
                </button>
                <button
                  @click=${async () => {
            await this.#updateSelectedDocumentGroup(group.id);
          }}
                >
                  List items
                </button>
              </li>
            `,
      )
    }
      </ul>
      <button
        @click=${async () => {
      if (!(await this.#checkAuthenticationStatus())) {
        await this.#authenticate();
      }
      await fetch(
        `/api/document/${
          prompt("Enter the name", new Date().getTime().toString()) ||
          new Date().getTime().toString()
        }`,
        {
          method: "POST",
          body: prompt("Enter the metadata (as JSON)", ""),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );
      this.#updateDocumentGroups();
    }}
      >
        Add new
      </button>
    `;
  }

  #renderDocumentItems() {
    return html`
      <h2>Document Items</h2>
      ${
      this.selectedDocumentGroupId != null
        ? html`
            <ul>
              ${
          this.documentItems?.map(
            (item) =>
              html`
                    <li>
                      <h3>${item.title}</h3>
                      <h4>${item.subtitle}</h4>
                      <span>${item.timeCreated} - ${item.timeModified}</span>
                      <br />
                      <button
                        @click=${async () => {
                const { content } = await fetch(
                  `/api/document/${item.groupId}/${item.id}`,
                ).then((response) => response.json());
                alert(content);
              }}
                      >
                        Get content
                      </button>
                      <button
                        @click=${async () => {
                await fetch(
                  `/api/document/${item.groupId}/${item.id}`,
                  {
                    method: "POST",
                    body: JSON.stringify({
                      title: prompt(
                        "Enter the updated title",
                        item.title,
                      ) ?? item.title,
                      subtitle: item.subtitle,
                      content: item.content,
                    }),
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                  },
                );
                this.#updateDocumentItems();
              }}
                      >
                        Update title
                      </button>
                      <button
                        @click=${async () => {
                await fetch(
                  `/api/document/${item.groupId}/${item.id}`,
                  {
                    method: "POST",
                    body: JSON.stringify({
                      title: item.title,
                      subtitle: prompt(
                        "Enter the updated subtitle",
                        item.subtitle,
                      ) ?? item.subtitle,
                      content: item.content,
                    }),
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                  },
                );
                this.#updateDocumentItems();
              }}
                      >
                        Update subtitle
                      </button>
                      <button
                        @click=${async () => {
                const itemWithContent = await fetch(
                  `/api/document/${item.groupId}/${item.id}`,
                ).then((response) => response.json());
                await fetch(
                  `/api/document/${item.groupId}/${item.id}`,
                  {
                    method: "POST",
                    body: JSON.stringify({
                      title: itemWithContent.title,
                      subtitle: itemWithContent.subtitle,
                      content: prompt(
                        "Enter the updated content",
                        itemWithContent.content,
                      ) ?? itemWithContent.content,
                    }),
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                  },
                );
                this.#updateDocumentItems();
              }}
                      >
                        Update content
                      </button>
                      <button
                        @click=${async () => {
                await fetch(
                  `/api/document/${item.groupId}/${item.id}`,
                  { method: "DELETE", credentials: "include" },
                );
                this.#updateDocumentItems();
              }}
                      >
                        Delete
                      </button>
                    </li>
                  `,
          )
        }
            </ul>
            <button
              @click=${async () => {
          if (!(await this.#checkAuthenticationStatus())) {
            await this.#authenticate();
          }
          if (!this.selectedDocumentGroupId) return;
          await fetch(
            `/api/document/${this.selectedDocumentGroupId}/new`,
            {
              method: "POST",
              body: JSON.stringify({
                title: prompt("Enter the title", "New Document"),
                subtitle: prompt("Enter the subtitle", ""),
                content: prompt("Enter the content", ""),
              }),
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            },
          );
          this.#updateDocumentItems();
        }}
            >
              Add new
            </button>
          `
        : 'Click "List items" from the document group section.'
    }
    `;
  }
}
customElements.define("app-root", AppRoot);
