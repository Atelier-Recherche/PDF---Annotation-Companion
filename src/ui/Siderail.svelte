<script>
  import { onMount } from 'svelte';
  import { setIcon } from 'obsidian';

  export let annotations = [];
  export let mode = 'global';
  export let currentPage = 1;
  export let pageCount = 1;

  export let onSelectAnnotation;
  export let onToggleMode;
  export let onExportMarkdown;
  export let onDeleteAnnotation;
  export let onSearch;
  export let onContextMenu;

  let search = '';
  let btnGlobal, btnPage, searchIconEl, exportBtnEl;

  function handleSearchInput(value) {
    search = value;
    if (onSearch) onSearch(value);
  }
  const handleToggleGlobal = () => onToggleMode && onToggleMode('global');
  const handleTogglePage = () => onToggleMode && onToggleMode('page');

  function noteIconAction(node) {
    setIcon(node, 'message-circle');
    node.style.setProperty('--icon-size', '12px');
    return { destroy: () => {} };
  }

  onMount(() => {
    if (btnGlobal) setIcon(btnGlobal, 'list');
    if (btnPage) setIcon(btnPage, 'crosshair');
    if (searchIconEl) setIcon(searchIconEl, 'search');
    if (exportBtnEl) setIcon(exportBtnEl, 'arrow-up-right');
  });
</script>

<div class="siderail">
  <header class="siderail-header header-row">
    <div class="mode-toggle">
      <button
        bind:this={btnGlobal}
        class:selected={mode === 'global'}
        class="clickable-icon header-btn"
        on:click={handleToggleGlobal}
        type="button"
        title="Toutes les annotations"
        aria-label="Toutes les annotations"
      ></button>
      <button
        bind:this={btnPage}
        class:selected={mode === 'page'}
        class="clickable-icon header-btn"
        on:click={handleTogglePage}
        type="button"
        title="Page courante"
        aria-label="Page courante"
      ></button>
    </div>

    <div class="search-row">
      <span bind:this={searchIconEl} class="clickable-icon search-icon" aria-hidden="true"></span>
      <input
        type="search"
        placeholder="Rechercher…"
        bind:value={search}
        on:input={(e) => handleSearchInput(e.currentTarget.value)}
      />
    </div>

    <div class="header-actions">
      <button
        bind:this={exportBtnEl}
        class="clickable-icon export-btn"
        type="button"
        on:click={onExportMarkdown}
        aria-label="Exporter les annotations filtrées en Markdown"
      ></button>
      <div class="page-indicator">
        {currentPage}/{pageCount}
      </div>
    </div>
  </header>

  <main class="siderail-list" tabindex="0">
    {#if annotations.length === 0}
      <div class="empty-message">
        Aucune annotation à afficher.
      </div>
    {:else}
      {#each annotations as annot}
        <div
          class="annotation-item"
          role="button"
          tabindex="0"
          on:click={() => onSelectAnnotation && onSelectAnnotation(annot)}
          on:contextmenu|preventDefault={(e) => onContextMenu && onContextMenu(annot, e)}
        >
          <div class="color-indicator" style={`background-color: ${annot.color ?? 'var(--text-muted)'}`}></div>
          <div class="annotation-content">
            <div class="annotation-text" title={annot.text}>
              {annot.text || '(texte indisponible)'}
            </div>
            {#if annot.contents}
              <div class="annotation-note" title={annot.contents}>
                <span use:noteIconAction class="annotation-note-icon" aria-hidden="true"></span>
                {annot.contents}
              </div>
            {/if}
          </div>
          <div class="annotation-meta">
            <div class="page-number">
              p.{annot.page}
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </main>
</div>

<style>
  .siderail {
    display: flex;
    flex-direction: column;
    height: 100%;
    font-size: 13px;
  }

  .siderail-header {
    padding: 6px 8px;
    border-bottom: 1px solid var(--background-modifier-border);
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .siderail-header.header-row {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
  }

  .mode-toggle {
    display: inline-flex;
    flex-shrink: 0;
    gap: 2px;
  }

  .mode-toggle .header-btn {
    flex: 1;
    padding: 6px 8px;
    border-radius: 6px;
    --icon-size: 16px;
  }

  .mode-toggle .header-btn.selected {
    background: var(--interactive-accent);
    color: var(--text-on-accent);
  }

  .search-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }

  .search-row input {
    flex: 1;
    min-width: 0;
    padding: 6px 8px;
    border-radius: 6px;
    border: 1px solid var(--background-modifier-border);
    font-size: 13px;
  }

  .search-icon {
    flex-shrink: 0;
    padding: 6px;
    --icon-size: 16px;
    color: var(--text-muted);
  }

  .header-actions {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 6px;
  }

  .export-btn {
    border-radius: 6px;
    border: 1px solid var(--background-modifier-border);
    background: transparent;
    padding: 6px 8px;
    cursor: pointer;
    --icon-size: 16px;
  }

  .page-indicator {
    font-size: 12px;
    color: var(--text-muted);
  }

  .siderail-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
  }

  .annotation-item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 8px;
    padding: 8px 10px;
    align-items: center;
    cursor: pointer;
    min-height: 44px;
    border: 2px solid var(--background-modifier-border) !important;
    border-radius: 8px;
    margin-bottom: 6px;
    background-color: var(--background-primary);
  }

  .annotation-item:hover {
    background-color: var(--background-modifier-hover);
  }

  .color-indicator {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    flex-shrink: 0;
  }

  .annotation-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .annotation-text {
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .annotation-note {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 4px 8px;
    border: 1px solid var(--background-modifier-border);
    border-radius: 6px;
    background: var(--background-secondary);
  }

  .annotation-note-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    --icon-size: 12px;
    color: var(--text-muted);
  }

  .annotation-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    margin-left: 4px;
  }

  .page-number {
    font-size: 11px;
    color: var(--text-muted);
  }

  .delete-btn {
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 12px;
  }

  .empty-message {
    padding: 12px;
    color: var(--text-muted);
    font-size: 12px;
  }

  @media (max-width: 768px) {
    .siderail {
      font-size: 12px;
    }

    .annotation-item {
      padding-inline: 6px;
    }
  }

  /* Overrides globaux pour forcer header sur une ligne et cadre visible */
  :global(.pdf-annotation-siderail-root .siderail-header) {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
  }

  :global(.pdf-annotation-siderail-root .annotation-item) {
    border: 2px solid var(--background-modifier-border) !important;
    box-shadow: 0 0 0 1px var(--background-modifier-border) !important;
  }
</style>

