import { test, expect } from '@playwright/test';

test.describe('Playground Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the playground root and wait for the engine to initialize
    await page.goto('/');
    // Wait for the loader to disappear
    await expect(page.locator('text=initialising Engine')).not.toBeVisible({ timeout: 15000 });
  });

  test('should load the playground and show main components', async ({ page }) => {
    // Check for core panels by their headings
    await expect(page.locator('.panel-header').filter({ hasText: 'Explorer' })).toBeVisible();
    await expect(page.locator('.panel-header').filter({ hasText: 'Inspector' })).toBeVisible();
    
    // Check if Viewport Canvas is visible (use ID to avoid Monaco canvases)
    await expect(page.locator('#canvas')).toBeVisible();

    // Check Editor tab is active
    await expect(page.locator('.panel-header span').filter({ hasText: 'Editor' })).toBeVisible();

    // Take a screenshot of the initial state for visual testing
    await expect(page).toHaveScreenshot('initial-load.png', {
        maxDiffPixelRatio: 0.1,
        animations: 'disabled',
    });
  });

  test('should toggle Inspector panel', async ({ page }) => {
    const inspectorPanel = page.getByTestId('inspector-panel');
    const inspectorHeader = inspectorPanel.locator('.panel-header');
    await expect(inspectorPanel).toBeVisible();

    // Collapsing - click the header
    await inspectorHeader.click();
    
    // It should be removed from DOM (due to conditional rendering in App.tsx)
    await expect(inspectorPanel).not.toBeVisible();

    // Expanding - click the expand button (new in App.tsx)
    const expandButton = page.getByTestId('inspector-expand-button');
    await expect(expandButton).toBeVisible();
    await expandButton.click();
    
    await expect(inspectorPanel).toBeVisible();
  });

  test('should toggle Explorer panel', async ({ page }) => {
    const explorerHeader = page.locator('.panel-header').filter({ hasText: 'Explorer' });
    await expect(explorerHeader).toBeVisible();

    // Collapsing - click the header
    await explorerHeader.click();
    await expect(explorerHeader).not.toBeVisible();

    // Expanding - click the expand button
    const expandButton = page.getByTestId('explorer-expand-button');
    await expect(expandButton).toBeVisible();
    await expandButton.click();
    
    await expect(explorerHeader).toBeVisible();
  });

  test('should toggle Editor panel', async ({ page }) => {
    const editorHeader = page.locator('.panel-header').filter({ hasText: 'Editor' });
    await expect(editorHeader).toBeVisible();

    // Collapsing - click the chevron down in the header
    const collapseButton = page.locator('.panel-header .fa-chevron-down');
    await collapseButton.click();
    await expect(editorHeader).not.toBeVisible();

    // Expanding - click the expand button
    const expandButton = page.getByTestId('editor-expand-button');
    await expect(expandButton).toBeVisible();
    await expandButton.click();
    
    await expect(editorHeader).toBeVisible();
  });

  test('should switch between Editor and Console tabs', async ({ page }) => {
    const consoleTab = page.locator('.panel-header span').filter({ hasText: 'Console' });
    const editorTab = page.locator('.panel-header span').filter({ hasText: 'Editor' });

    // Switch to Console
    await consoleTab.click();
    // Find the panel-content specifically within the center group bottom panel
    const consoleContent = page.locator('.panel-container').filter({ hasText: 'Console' }).locator('.panel-content');
    await expect(consoleContent).toContainText(/Console/i);

    // Take a screenshot of the console state
    await expect(page).toHaveScreenshot('console-tab.png', {
        maxDiffPixelRatio: 0.1,
        animations: 'disabled',
    });

    // Switch back to Editor
    await editorTab.click();
    await expect(page.locator('.monaco-editor')).toBeVisible();
  });
});
