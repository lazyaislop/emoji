import assert from 'node:assert/strict'

Feature('Internationalization')

Scenario('the language radio translates the UI and document metadata', async ({ I }) => {
  I.amOnPage('/')
  I.waitForElement('h1')
  I.see('GitHub emoji', 'h1')
  I.seeAttributesOnElements('input[type="search"]', { placeholder: 'Search emoji…' })

  I.click('.category-menu > summary')
  I.waitForVisible('.language-panel')
  I.checkOption('input[name="display-language"][value="ru"]')

  I.see('Эмодзи GitHub', 'h1')
  I.see('Настройки')
  I.see('Язык')
  I.seeAttributesOnElements('input[type="search"]', { placeholder: 'Поиск эмодзи…' })
  assert.equal(await I.grabAttributeFrom('html', 'lang'), 'ru')
  assert.equal(await I.grabAttributeFrom('html', 'dir'), 'ltr')
})

Scenario('switching to a team profile keeps the user settings language', async ({ I }) => {
  I.amOnPage('/')
  I.waitForElement('h1')
  I.click('.category-menu > summary')
  I.waitForVisible('.settings-profile')
  I.checkOption('input[name="display-language"][value="ru"]')
  I.see('Эмодзи GitHub', 'h1')

  I.click('//button[.//span[text()="vegan_team"]]')
  I.click('.category-menu > summary')

  I.see('Эмодзи GitHub', 'h1')
  I.see('Vegetables')
  I.see('Fruits')
  assert.equal(await I.grabAttributeFrom('html', 'lang'), 'ru')
})

Scenario('Arabic switches the layout direction', async ({ I }) => {
  I.amOnPage('/')
  I.waitForElement('h1')
  I.click('.category-menu > summary')
  I.waitForVisible('.language-panel')
  I.checkOption('input[name="display-language"][value="ar"]')

  I.see('إيموجي GitHub', 'h1')
  assert.equal(await I.grabAttributeFrom('html', 'lang'), 'ar')
  assert.equal(await I.grabAttributeFrom('html', 'dir'), 'rtl')
})
