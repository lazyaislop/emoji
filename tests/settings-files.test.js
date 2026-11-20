import { readFile, writeFile } from 'node:fs/promises'

const settingsFile = new URL('../public/user_settings.json', import.meta.url)
const veganProfileFile = new URL('../public/team-profiles/vegan_team.json', import.meta.url)

Feature('Editable project files')

Scenario('editing user_settings.json is picked up on the next launch', async ({ I }) => {
  const original = await readFile(settingsFile, 'utf8')
  try {
    const settings = JSON.parse(original)
    settings.language = 'fr'
    await writeFile(settingsFile, `${JSON.stringify(settings, null, 2)}\n`)

    await I.amOnPage('/')
    await I.waitForElement('h1')
    await I.see('Émojis GitHub', 'h1')
    await I.seeAttributesOnElements('input[type="search"]', {
      placeholder: 'Rechercher un émoji…',
    })
  } finally {
    await writeFile(settingsFile, original)
  }
})

Scenario('editing a team profile JSON adds emojis without a rebuild', async ({ I }) => {
  const original = await readFile(veganProfileFile, 'utf8')
  try {
    const profile = JSON.parse(original)
    profile.categories[1].emojiNames.push('cactus')
    await writeFile(veganProfileFile, `${JSON.stringify(profile, null, 2)}\n`)

    await I.amOnPage('/')
    await I.waitForElement('h1')
    await I.click('.category-menu > summary')
    await I.waitForVisible('.settings-profile')
    await I.click('//button[.//span[text()="vegan_team"]]')
    await I.click('.category-menu > summary')
    await I.waitForElement('button[title=":cactus:"]')
  } finally {
    await writeFile(veganProfileFile, original)
  }
})

Scenario('the project emoji cache is detected from manifest.json', async ({ I }) => {
  await I.amOnPage('/')
  await I.waitForElement('h1')
  await I.click('.category-menu > summary')
  await I.see('Project cache is available')
})
