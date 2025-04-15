const types = require('ethernaut-common/src/validation/types')
const output = require('ethernaut-common/src/ui/output')

const FORUM_URL = 'https://gov.optimism.io'

require('../scopes/optiforum')
  .task('search', 'Searches for posts on Optimism GovernanceForum')
  .addParam(
    'searchTerm',
    'This is just a string. Usually it would be the first item in the query.',
    undefined,
    types.string,
    false,
  )
  .addOptionalParam(
    'user',
    'Use the @ followed by the username to specify posts by this user.',
    undefined,
    types.string,
    false,
  )
  .addOptionalParam(
    'category',
    'Use the # followed by the category slug to search within this category.',
    undefined,
    types.string,
    false,
  )
  .addOptionalParam(
    'before',
    'use format yyyy-mm-dd',
    undefined,
    types.string,
    false,
  )
  .addOptionalParam(
    'after',
    'use format yyyy-mm-dd',
    undefined,
    types.string,
    false,
  )
  .addOptionalParam(
    'order',
    'options:latest, likes, views, latest_topic',
    'latest',
    types.string,
    false,
  )
  .setAction(async ({ searchTerm, user, category, before, after, order }) => {
    try {
      // https://gov.optimism.io/search.json?q=seedlatam
      // q=api @blake #support tags:api after:2021-06-04 in:unseen in:open order:latest_topic
      let _user = '',
        _category = '',
        _before = '',
        _after = '',
        _order = ''

      // if (!searchTerm) return

      if (user) _user = `%20%40${user}`
      if (category) _category = `%20%23${category}`
      if (before) _before = `%20before%3A${before}`
      if (after) _after = `%20after%3A${after}`
      if (order) _order = `%20order%3A${order}`

      const urlSearch = `${FORUM_URL}/search.json?q=${searchTerm}${_user}${_category}${_before}${_after}${_order}`
      console.log(urlSearch)
      const response = await fetch(urlSearch)
      const data = await response.json()

      // Process each post and display in the desired format
      data.posts.forEach((x) => {
        const master = {
          id: x.id,
          name: x.name,
          username: x.username,
          created_at: x.created_at,
          likes: x.like_count,
          post_number: x.post_number,
          topic_id: x.topic_id,
        }

        // Display master object in a table row
        console.table(master)

        // Display blurb text in a full-width row below with word wrapping
        const terminalWidth = process.stdout.columns || 80
        const wrapText = (text, width) => {
          const words = text.split(' ')
          let lines = []
          let currentLine = ''

          words.forEach((word) => {
            if ((currentLine + word).length <= width) {
              currentLine += (currentLine ? ' ' : '') + word
            } else {
              lines.push(currentLine)
              currentLine = word
            }
          })
          if (currentLine) lines.push(currentLine)
          return lines
        }

        console.log('─'.repeat(terminalWidth))
        wrapText(x.blurb, terminalWidth - 4).forEach((line) => {
          console.log('  ' + line)
        })
        console.log('─'.repeat(terminalWidth))
        console.log('') // Empty line for better readability
      })

      return
    } catch (err) {
      console.log(err)
      return output.errorBox(err)
    }
  })
