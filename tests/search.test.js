Feature('Search')

async function showUnicodeSection(I) {
  I.click('.category-menu > summary')
  I.waitForVisible('.category-controls')
  I.checkOption('input[aria-label="Show Unicode in results"]')
  I.click('.category-menu > summary')
}

Scenario('the design route adds its curated suggestions', async ({ I }) => {
  I.amOnPage('/')
  I.waitForElement('input[type="search"]')
  await showUnicodeSection(I)

  I.fillField('input[type="search"]', 'design')
  I.waitForElement('button[title=":art:"]')
  I.seeElement('button[title=":fish_cake:"]')
  I.seeElement('button[title=":framed_picture:"]')
})

Scenario('localized route terms work after changing the UI language', async ({ I }) => {
  I.amOnPage('/')
  I.waitForElement('input[type="search"]')
  await showUnicodeSection(I)
  I.click('.category-menu > summary')
  I.waitForVisible('.language-panel')
  I.checkOption('input[name="display-language"][value="ru"]')
  I.click('.category-menu > summary')

  I.fillField('input[type="search"]', 'дизайн')
  I.waitForElement('button[title=":art:"]')
  I.see('Эмодзи GitHub', 'h1')
})
