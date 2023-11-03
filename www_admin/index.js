import { css, html, LitElement } from "./lit-core.min.js";

export class AppRoot extends LitElement {
  static styles = css``;

  static properties = {
    generalItemKeys: { state: true },
    documentCollections: { state: true },
    selectedDocumentCollectionId: { state: true },
    documentCollectionItems: { state: true },
    assetCollections: { state: true },
    selectedAssetCollectionId: { state: true },
    assetCollectionItems: { state: true },
  };

  async firstUpdated() {
    await this.#updateGeneralItems();
    await this.#updateDocumentCollections();
    await this.#updateDocumentCollectionItems();
    await this.#updateAssetCollections();
    await this.#updateAssetCollectionItems();
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
      ${this.#renderDocumentCollections()}
      <hr />
      ${this.#renderDocumentCollectionItems()}
      <hr />
      ${this.#renderAssetCollections()}
      <hr />
      ${this.#renderAssetCollectionItems()}
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

  async #updateDocumentCollections() {
    this.documentCollections = await fetch("/api/document").then((response) =>
      response.json()
    );
  }

  async #updateSelectedDocumentCollection(collection) {
    this.selectedDocumentCollectionId = collection;
    await this.#updateDocumentCollectionItems();
  }

  async #updateDocumentCollectionItems() {
    if (!this.selectedDocumentCollectionId) return;
    const { items } = await fetch(
      `/api/document/${this.selectedDocumentCollectionId}`,
    ).then((response) => response.json());
    this.documentCollectionItems = items;
  }

  async #updateAssetCollections() {
    this.assetCollections = await fetch("/api/asset").then((response) =>
      response.json()
    );
  }

  async #updateSelectedAssetCollection(collection) {
    this.selectedAssetCollectionId = collection;
    await this.#updateAssetCollectionItems();
  }

  async #updateAssetCollectionItems() {
    if (!this.selectedAssetCollectionId) return;
    const { items } = await fetch(
      `/api/asset/${this.selectedAssetCollectionId}`,
    ).then((response) => response.json());
    this.assetCollectionItems = items;
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

  #renderDocumentCollections() {
    return html`
      <h2>Document Collections</h2>
      <ul>
        ${
      this.documentCollections?.map(
        (collection) =>
          html`
              <li>
                ${collection.id}
                <button
                  @click=${async () => {
            const { metadata } = await fetch(
              `/api/document/${collection.id}`,
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
              `/api/document/${collection.id}`,
            ).then((response) => response.json());
            await fetch(`/api/document/${collection.id}`, {
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
            this.#updateDocumentCollections();
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
              `/api/document/${collection.id}?newName=${
                prompt("Enter a new collection name", collection.id) ||
                collection.id
              }`,
              { method: "PUT", credentials: "include" },
            );
            this.#updateDocumentCollections();
          }}
                >
                  Rename
                </button>
                <button
                  @click=${async () => {
            if (!(await this.#checkAuthenticationStatus())) {
              await this.#authenticate();
            }
            await fetch(`/api/document/${collection.id}`, {
              method: "DELETE",
              credentials: "include",
            });
            this.#updateDocumentCollections();
          }}
                >
                  Delete
                </button>
                <button
                  @click=${async () => {
            await this.#updateSelectedDocumentCollection(collection.id);
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
          body: prompt("Enter the metadata (as JSON)", "{}") ?? "{}",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );
      this.#updateDocumentCollections();
    }}
      >
        Add new
      </button>
    `;
  }

  #renderDocumentCollectionItems() {
    return html`
      <h2>Document Items</h2>
      ${
      this.selectedDocumentCollectionId != null
        ? html`
            <ul>
              ${
          this.documentCollectionItems?.map(
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
                  `/api/document/${item.collectionId}/${item.id}`,
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
                  `/api/document/${item.collectionId}/${item.id}`,
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
                this.#updateDocumentCollectionItems();
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
                  `/api/document/${item.collectionId}/${item.id}`,
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
                this.#updateDocumentCollectionItems();
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
                  `/api/document/${item.collectionId}/${item.id}`,
                ).then((response) => response.json());
                await fetch(
                  `/api/document/${item.collectionId}/${item.id}`,
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
                this.#updateDocumentCollectionItems();
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
                  `/api/document/${item.collectionId}/${item.id}`,
                  { method: "DELETE", credentials: "include" },
                );
                this.#updateDocumentCollectionItems();
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
          if (!this.selectedDocumentCollectionId) return;
          await fetch(
            `/api/document/${this.selectedDocumentCollectionId}/$`,
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
          this.#updateDocumentCollectionItems();
        }}
            >
              Add new
            </button>
          `
        : 'Click "List items" from the collection section.'
    }
    `;
  }

  #renderAssetCollections() {
    return html`
      <h2>Asset Collections</h2>
      <ul>
        ${
      this.assetCollections?.map(
        (collection) =>
          html`
              <li>
                ${collection.id}
                <button
                  @click=${async () => {
            const { metadata } = await fetch(
              `/api/asset/${collection.id}`,
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
              `/api/asset/${collection.id}`,
            ).then((response) => response.json());
            await fetch(`/api/asset/${collection.id}`, {
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
            this.#updateAssetCollections();
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
              `/api/asset/${collection.id}?newName=${
                prompt("Enter a new asset name", collection.id) ||
                collection.id
              }`,
              { method: "PUT", credentials: "include" },
            );
            this.#updateAssetCollections();
          }}
                >
                  Rename
                </button>
                <button
                  @click=${async () => {
            if (!(await this.#checkAuthenticationStatus())) {
              await this.#authenticate();
            }
            await fetch(`/api/asset/${collection.id}`, {
              method: "DELETE",
              credentials: "include",
            });
            this.#updateAssetCollections();
          }}
                >
                  Delete
                </button>
                <button
                  @click=${async () => {
            await this.#updateSelectedAssetCollection(collection.id);
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
        `/api/asset/${
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
      this.#updateDocumentCollections();
    }}
      >
        Add new
      </button>
    `;
  }

  #renderAssetCollectionItems() {
    return html`
      <iframe name="dummyframe" id="dummyframe" style="display: none;"></iframe>
      <h2>Asset Items</h2>
      ${
      this.selectedAssetCollectionId != null
        ? html`
            <ul>
              ${
          this.assetCollectionItems?.map(
            (item) =>
              html`
                    <li>
                      <p>${item.id}</p>
                      <p>${item.type}</p>
                      <i>${item.size} bytes</i>
                      <br/>
                      <a href=${`/api/asset/${item.collectionId}/${item.id}`}>Download<a>
                      <form 
                        action=${`/api/asset/${item.collectionId}/${item.id}`}
                        method="put" 
                        enctype="multipart/form-data"
                        target="dummyframe"
                        @submit=${() => {
                setTimeout(() => {
                  if (alert("Needs to reload the window.")) {
                    location.reload();
                  }
                }, 100);
              }}
                      >
                        <input type="file" name="file"/>
                        <button type="submit">Re-upload</button>
                      </form>
                      <button
                        @click=${async () => {
                if (!(await this.#checkAuthenticationStatus())) {
                  await this.#authenticate();
                }
                await fetch(
                  `/api/asset/${item.collectionId}/${item.id}`,
                  { method: "DELETE", credentials: "include" },
                );
                this.#updateAssetCollectionItems();
              }}
                      >
                        Delete
                      </button>
                    </li>
                  `,
          )
        }
            </ul>
            <form 
              action=${`/api/asset/${this.selectedAssetCollectionId}/$`}
              method="post" 
              enctype="multipart/form-data"
              target="dummyframe"
              @submit=${() => {
          setTimeout(() => {
            if (alert("Needs to reload the window.")) {
              location.reload();
            }
          }, 100);
        }}
            >
              <input type="file" name="file"/>
              <button type="submit">Upload new</button>
            </form>
          `
        : 'Click "List items" from the asset collection section.'
    }
    `;
  }
}
customElements.define("app-root", AppRoot);
