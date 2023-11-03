import { css, html, LitElement } from "./lit-core.min.js";

export class AppRoot extends LitElement {
  static styles = css``;

  static properties = {
    generalItemKeys: { state: true },
    collections: { state: true },
    selectedCollectionId: { state: true },
    collectionItems: { state: true },
  };

  async firstUpdated() {
    await this.#updateGeneralItems();
    await this.#updateCollections();
    await this.#updateCollectionItems();
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <h1>MicroCMS Admin</h1>
      <hr />
      ${this.#renderGeneralItems()}
      <hr />
      ${this.#renderCollections()}
      <hr />
      ${this.#renderCollectionItems()}
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

  async #updateCollections() {
    this.collections = await fetch("/api/collection").then((response) =>
      response.json()
    );
  }

  async #updateSelectedCollection(collection) {
    this.selectedCollectionId = collection;
    await this.#updateCollectionItems();
  }

  async #updateCollectionItems() {
    if (!this.selectedCollectionId) return;
    const { items } = await fetch(
      `/api/collection/${this.selectedCollectionId}`,
    ).then((response) => response.json());
    this.collectionItems = items;
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
            const value = await fetch(`/api/general/${key}`).then(
              (response) => response.text(),
            );
            await fetch(`/api/general/${key}`, {
              method: "PUT",
              body: prompt("Enter the value (as JSON)", value) ?? value,
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
          body: prompt("Enter the value (as JSON)", '""') || '""',
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

  #renderCollections() {
    return html`
      <h2>Collections</h2>
      <ul>
        ${
      this.collections?.map(
        (collection) =>
          html`
              <li>
                ${collection.id}
                <button
                  @click=${async () => {
            const { metadata } = await fetch(
              `/api/collection/${collection.id}`,
            ).then((response) => response.json());
            alert(JSON.stringify(metadata));
          }}
                >
                  Get metadata
                </button>
                <button
                  @click=${async () => {
            if (!(await this.#checkAuthenticationStatus())) {
              await this.#authenticate();
            }
            const { metadata } = await fetch(
              `/api/collection/${collection.id}`,
            ).then((response) => response.json());
            await fetch(`/api/collection/${collection.id}`, {
              method: "PUT",
              body: prompt(
                "Enter the metadata (as JSON)",
                JSON.stringify(metadata),
              ) ??
                JSON.stringify(metadata),
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            });
            this.#updateCollections();
          }}
                >
                  Update metadata
                </button>
                <button
                  @click=${async () => {
            if (!(await this.#checkAuthenticationStatus())) {
              await this.#authenticate();
            }
            await fetch(
              `/api/collection/${collection.id}?newName=${
                prompt("Enter a new collection name", collection.id) ||
                collection.id
              }`,
              { method: "PUT", credentials: "include" },
            );
            this.#updateCollections();
          }}
                >
                  Rename
                </button>
                <button
                  @click=${async () => {
            if (!(await this.#checkAuthenticationStatus())) {
              await this.#authenticate();
            }
            await fetch(`/api/collection/${collection.id}`, {
              method: "DELETE",
              credentials: "include",
            });
            this.#updateCollections();
          }}
                >
                  Delete
                </button>
                <button
                  @click=${async () => {
            await this.#updateSelectedCollection(collection.id);
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
        `/api/collection/${
          prompt("Enter the name", new Date().getTime().toString()) ||
          new Date().getTime().toString()
        }`,
        {
          method: "POST",
          body: prompt("Enter the metadata (as JSON)", "{}") ?? "{}",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );
      this.#updateCollections();
    }}
      >
        Add new
      </button>
    `;
  }

  #renderCollectionItems() {
    return html`
      <h2>Collection Items</h2>
      ${
      this.selectedCollectionId != null
        ? html`
            <ul>
              ${
          this.collectionItems?.map(
            (item) =>
              html`
                    <li>
                      <i>${item.id}</i>
                      <h3>${item.metadata?.title}</h3>
                      <h4>${item.metadata?.subtitle}</h4>
                      <p>${item.type}</p>
                      <p>${item.timeCreated} - ${item.timeModified}</p>
                      <button
                        @click=${async () => {
                const { content } = await fetch(
                  `/api/collection/${item.collectionId}/${item.id}`,
                ).then((response) => response.json());
                alert(content);
              }}
                      >
                        Get content
                      </button>
                      <button
                        @click=${async () => {
                if (!(await this.#checkAuthenticationStatus())) {
                  await this.#authenticate();
                }
                await fetch(
                  `/api/collection/${item.collectionId}/${item.id}`,
                  {
                    method: "PATCH",
                    body: JSON.stringify({
                      metadata: {
                        ...item.metadata,
                        title: prompt(
                          "Enter the updated title",
                          item.metadata?.title,
                        ) ?? item.metadata?.title,
                      },
                    }),
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                  },
                );
                this.#updateCollectionItems();
              }}
                      >
                        Update title
                      </button>
                      <button
                        @click=${async () => {
                if (!(await this.#checkAuthenticationStatus())) {
                  await this.#authenticate();
                }
                await fetch(
                  `/api/collection/${item.collectionId}/${item.id}`,
                  {
                    method: "PATCH",
                    body: JSON.stringify({
                      metadata: {
                        ...item.metadata,
                        subtitle: prompt(
                          "Enter the updated subtitle",
                          item.metadata?.subtitle,
                        ) ?? item.metadata?.subtitle,
                      },
                    }),
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                  },
                );
                this.#updateCollectionItems();
              }}
                      >
                        Update subtitle
                      </button>
                      <button
                        @click=${async () => {
                if (!(await this.#checkAuthenticationStatus())) {
                  await this.#authenticate();
                }
                const itemWithContent = await fetch(
                  `/api/collection/${item.collectionId}/${item.id}`,
                ).then((response) => response.json());
                await fetch(
                  `/api/collection/${item.collectionId}/${item.id}`,
                  {
                    method: "PATCH",
                    body: JSON.stringify({
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
                this.#updateCollectionItems();
              }}
                      >
                        Update content
                      </button>
                      <button
                        @click=${async () => {
                if (!(await this.#checkAuthenticationStatus())) {
                  await this.#authenticate();
                }
                await fetch(
                  `/api/collection/${item.collectionId}/${item.id}`,
                  { method: "DELETE", credentials: "include" },
                );
                this.#updateCollectionItems();
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
          if (!this.selectedCollectionId) return;
          await fetch(
            `/api/collection/${this.selectedCollectionId}/$`,
            {
              method: "POST",
              body: JSON.stringify({
                type: "text/plain",
                metadata: {
                  title: prompt("Enter the title", "New Item"),
                  subtitle: prompt("Enter the subtitle", ""),
                },
                content: prompt("Enter the content", ""),
              }),
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            },
          );
          this.#updateCollectionItems();
        }}
            >
              Add new
            </button>
          `
        : 'Click "List items" from the collection section.'
    }
    `;
  }
}
customElements.define("app-root", AppRoot);
