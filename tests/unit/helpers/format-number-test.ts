import { A } from '@ember/array';
import { run } from '@ember/runloop';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import formatNumberHelper from 'ember-intl/helpers/format-number';
import type { TestContext } from 'ember-intl/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, skip, test } from 'qunit';

module('format-number', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(
    hooks,
    {},
    {
      formats: {
        number: {
          digits: { minimumFractionDigits: 2 },
          currency: { style: 'currency', minimumFractionDigits: 2 },
          currency2: { style: 'currency', currency: 'USD', minimumFractionDigits: 3 },
        },
      },
    }
  );

  test('exists', function (this: TestContext, assert) {
    assert.expect(1);
    assert.ok(formatNumberHelper);
  });

  test('invoke the formatNumber method', function (this: TestContext, assert) {
    assert.expect(1);
    assert.strictEqual(this.intl.formatNumber(100), '100');
  });

  test('number is formats unset locale (en-US)', async function (this: TestContext, assert) {
    assert.expect(1);
    await render(hbs`{{format-number 1000}}`);
    assert.strictEqual(this.element.textContent, '1,000');
  });

  test('number is formatted correctly with active service locale', async function (this: TestContext, assert) {
    assert.expect(1);
    this.intl.setLocale(['pt-br']);
    await render(hbs`{{format-number 1000}}`);
    assert.strictEqual(this.element.textContent, '1.000');
  });

  skip('should throw if called with out a value', function (/*assert*/) {
    // assert.expect(1);
    // expectError(() => render(hbs`{{format-number}}`), ex => assert.ok(ex));
  });

  test('should return a string', async function (this: TestContext, assert) {
    assert.expect(1);
    await render(hbs`{{format-number 4}}`);
    assert.strictEqual(this.element.textContent, '4');
  });

  test('should handle undefined value when allowEmpty is true', async function (this: TestContext, assert) {
    assert.expect(1);
    await render(hbs`{{format-number allowEmpty=true}}`);
    assert.strictEqual(this.element.textContent, '');
  });

  test('should handle null value when allowEmpty is true', async function (this: TestContext, assert) {
    assert.expect(1);
    this.set('somethingNull', null);
    await render(hbs`{{format-number this.somethingNull allowEmpty=true}}`);
    assert.strictEqual(this.element.textContent, '');
  });

  test('should return a decimal as a string', async function (this: TestContext, assert) {
    assert.expect(1);
    await render(hbs`{{format-number 4.004}}`);
    assert.strictEqual(this.element.textContent, '4.004');
  });

  test('should return a formatted string with a thousand separator', async function (this: TestContext, assert) {
    assert.expect(1);
    await render(hbs`{{format-number 40000}}`);
    assert.strictEqual(this.element.textContent, '40,000');
  });

  test('should return a formatted string with a thousand separator and decimal', async function (this: TestContext, assert) {
    assert.expect(1);
    await render(hbs`{{format-number 40000.004}}`);
    assert.strictEqual(this.element.textContent, '40,000.004');
  });

  test('locale can be passed as an argument', async function (this: TestContext, assert) {
    assert.expect(1);
    await render(hbs`{{format-number 4.004 locale="de-de"}}`);
    assert.strictEqual(this.element.textContent, '4,004');
  });

  test('in another locale - should return a string', async function (this: TestContext, assert) {
    assert.expect(1);
    this.intl.setLocale(['de-de']);
    await render(hbs`{{format-number 4}}`);
    assert.strictEqual(this.element.textContent, '4');
  });

  test('in another locale - should return a decimal as a string', async function (this: TestContext, assert) {
    assert.expect(1);
    this.intl.setLocale(['de-de']);
    await render(hbs`{{format-number 4.004}}`);
    assert.strictEqual(this.element.textContent, '4,004');
  });

  test('in another locale - should return a formatted string with a thousand separator', async function (this: TestContext, assert) {
    assert.expect(1);
    this.intl.setLocale(['de-de']);
    await render(hbs`{{format-number 40000}}`);
    assert.strictEqual(this.element.textContent, '40.000');
  });

  test('in another locale - should return a formatted string with a thousand separator and decimal', async function (this: TestContext, assert) {
    assert.expect(1);
    this.intl.setLocale(['de-de']);
    await render(hbs`{{format-number 40000.004}}`);
    assert.strictEqual(this.element.textContent, '40.000,004');
  });

  test('currency - should return a string formatted to currency', async function (this: TestContext, assert) {
    assert.expect(3);
    await render(hbs`{{format-number 40000 format="currency" currency="USD"}}`);
    assert.strictEqual(this.element.textContent, '$40,000.00');
    await render(hbs`{{format-number 40000 format="currency" currency="EUR"}}`);
    assert.strictEqual(this.element.textContent, '€40,000.00');
    await render(hbs`{{format-number 40000 style="currency" currency="JPY"}}`);
    assert.strictEqual(this.element.textContent, '¥40,000');
  });

  test('should be able to combine hash options with format options', async function (this: TestContext, assert) {
    assert.expect(1);
    await render(hbs`{{format-number 1 format="digits" minimumIntegerDigits=10}}`);
    assert.strictEqual(this.element.textContent, '0,000,000,001.00', 'should return a string formatted to a percent');
  });

  // v4 -> v5 regression
  // https://github.com/ember-intl/ember-intl/pull/1401
  test('hash options take precedence over named format options', async function (this: TestContext, assert) {
    assert.expect(1);
    await render(
      hbs`{{format-number 1 format="currency2"}} / {{format-number 1 format="currency2" minimumFractionDigits=0}}`
    );
    assert.strictEqual(this.element.textContent, '$1.000 / $1', '`minimumFractionDigits` overrides named format');
  });

  test('used to format percentages', async function (this: TestContext, assert) {
    assert.expect(2);
    await render(hbs`{{format-number 400 style="percent"}}`);
    assert.strictEqual(this.element.textContent, '40,000%', 'should return a string formatted to a percent');

    run(() => this.intl.setLocale('de-de'));
    await render(hbs`{{format-number 400 style="percent"}}`);

    const value = escape(this.element.textContent!);
    assert.ok(['40%2C000%25', '40.000%A0%25'].indexOf(value) > -1, 'de should return a string formatted to a percent');
  });

  test('should function within an `each` block helper', async function (this: TestContext, assert) {
    assert.expect(1);

    this.set(
      'currencies',
      A([
        { AMOUNT: 3, CURRENCY: 'USD' },
        { AMOUNT: 8, CURRENCY: 'EUR' },
        { AMOUNT: 10, CURRENCY: 'JPY' },
      ])
    );

    await render(
      hbs`
      {{#each this.currencies as |currency|}}{{format-number currency.AMOUNT format="currency" style="currency" currency=currency.CURRENCY}}{{/each}}
      `
    );

    assert.strictEqual(this.element.textContent!.trim(), '$3.00€8.00¥10.00');
  });

  test('should support notation option', async function (this: TestContext, assert) {
    await render(hbs`{{format-number 50000 notation="compact"}}`);
    assert.strictEqual(this.element.textContent, '50K');
  });
});
