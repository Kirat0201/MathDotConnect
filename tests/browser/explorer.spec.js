import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('discover, search, filter, and recover from empty results', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.equation-card')).toHaveCount(8);
  await page.getByRole('searchbox').fill('fourier waves');
  await expect(page.locator('.equation-card')).toHaveCount(1);
  await page.getByRole('searchbox').fill('not-an-equation');
  await expect(page.getByText('No equations found. Yet.')).toBeVisible();
  await page.getByRole('button', { name: 'Explore all equations' }).click();
  await page.getByRole('button', { name: 'Physics', exact: true }).click();
  await expect(page.locator('.equation-card')).toHaveCount(2);
  expect(errors).toEqual([]);
});

test('save, reload, open a detail deep link, and remove from collection', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('button', {
      name: 'Save Euler’s identity to collection',
      exact: true,
    })
    .click();
  await page.reload();
  await page.getByRole('link', { name: /My collection/ }).click();
  await expect(page.locator('.equation-card')).toHaveCount(1);
  await page.getByRole('link', { name: 'Explore Euler’s identity' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.reload();
  await expect(
    page
      .getByRole('dialog')
      .getByRole('heading', { name: 'Euler’s identity', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('link', { name: /My collection/ }).click();
  await page
    .getByRole('button', {
      name: 'Remove Euler’s identity from collection',
      exact: true,
    })
    .click();
  await expect(
    page.getByText('Your next favorite is out there.'),
  ).toBeVisible();
});

test('invalid contributions show field errors; valid content is safely rendered and persists', async ({
  page,
}) => {
  await page.goto('/#contribute');
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Add to my notebook' }).click();
  await expect(page.locator('#title')).toHaveAttribute('aria-invalid', 'true');
  const title = '<img src=x onerror=alert(1)>';
  await page.getByLabel('Equation name').fill(title);
  await page.getByLabel('The equation', { exact: false }).fill('x + 1 = 2');
  await page
    .getByLabel('The short story')
    .fill('A small equation with a useful explanation.');
  await page
    .getByLabel('Help us understand it')
    .fill(
      'This demonstrates that plain text input is rendered as text and can never create executable HTML.',
    );
  await page.getByLabel('A resource to explore').fill('javascript:alert(1)');
  await dialog.getByRole('button', { name: 'Add to my notebook' }).click();
  await expect(page.locator('#sourceUrl')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await page
    .getByLabel('A resource to explore')
    .fill('https://example.com/resource');
  await dialog.getByRole('button', { name: 'Add to my notebook' }).click();
  await expect(page.locator('#detail-title')).toHaveText(title);
  await expect(page.locator('#detail-content img')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('#detail-title')).toHaveText(title);
  await page.getByRole('button', { name: 'Remove this contribution' }).click();
  await expect(page.locator('.equation-card')).toHaveCount(8);
});

test('corrupt storage recovers without breaking discovery', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('mathdotconnect:v1', '{broken'),
  );
  await page.goto('/');
  await expect(page.locator('.equation-card')).toHaveCount(8);
  await expect(page.locator('#toast')).toContainText('recovered');
});

test('blocked storage leaves app usable and warns about temporary changes', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('blocked');
      },
    }),
  );
  await page.goto('/');
  await page
    .getByRole('button', {
      name: 'Save Euler’s identity to collection',
      exact: true,
    })
    .click();
  await expect(page.locator('#toast')).toContainText('temporary');
  await expect(page.locator('#saved-count')).toHaveText('1');
});

test('notebook export contains the saved state', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('button', {
      name: 'Save Euler’s identity to collection',
      exact: true,
    })
    .click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export my notebook' }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe('mathdotconnect-notebook.json');
  const stream = await download.createReadStream();
  let text = '';
  for await (const chunk of stream) text += chunk;
  expect(JSON.parse(text).favorites).toEqual(['euler']);
});

test('legacy URLs reach their replacement views', async ({ page }) => {
  await page.goto('/your_fav_equations.html');
  await expect(page).toHaveURL(/index.html#saved/);
  await expect(
    page.getByText('Your next favorite is out there.'),
  ).toBeVisible();
  await page.goto('/share_your_fav_equations.html');
  await expect(
    page.getByRole('heading', { name: 'Share a little wonder.' }),
  ).toBeVisible();
});

test('page and dialogs pass automated accessibility checks and fit the viewport', async ({
  page,
}) => {
  await page.goto('/');
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole('link', { name: 'Explore Euler’s identity' }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '+ Add an equation' }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
});

test('unit-circle slider updates the explanation and vector', async ({
  page,
}) => {
  await page.goto('/#equation/euler');
  await expect(page.locator('.euler-output')).toContainText('e^(iπ) = −1');
  const range = page.getByLabel('Angle θ');
  await range.fill('90');
  await expect(page.locator('.euler-output')).toContainText(
    'cos θ = 0.00, sin θ = 1.00',
  );
  await expect(page.locator('.unit-point')).toHaveAttribute('cy', '27');
});
test('restore imports a valid backup and rejects invalid data without losing favorites', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('button', {
      name: 'Save Euler’s identity to collection',
      exact: true,
    })
    .click();
  await page.locator('#import-data').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(
      JSON.stringify({ version: 1, favorites: ['heat'], contributions: [] }),
    ),
  });
  await expect(page.locator('#saved-count')).toHaveText('2');
  await page.locator('#import-data').setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{broken'),
  });
  await expect(page.locator('#toast')).toContainText('invalid');
  await expect(page.locator('#saved-count')).toHaveText('2');
});
