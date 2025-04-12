const figlet = require('figlet')
const chalkAnimation = require('chalk-animation')
const pkg = require('./package.json')
const storage = require('ethernaut-common/src/io/storage')
const { refreshEnv } = require('ethernaut-common/src/io/env')
const {
  queryTelemetryConsent,
} = require('ethernaut-common/src/error/telemetry')
const checkAutoUpdate = require('./src/update')
const fs = require('fs-extra')
const path = require('path')
const AdmZip = require('adm-zip')

refreshEnv()

require('@nomicfoundation/hardhat-ethers')

// Order matters
// AI goes first, so that other packages can inject assistant instructions
require('ethernaut-ai')
require('ethernaut-util')
require('ethernaut-util-ui')
require('ethernaut-interact')
require('ethernaut-interact-ui')
require('ethernaut-network')
require('ethernaut-network-ui')
require('ethernaut-wallet')
require('ethernaut-wallet-ui')
require('ethernaut-challenges')
require('ethernaut-ui')
require('ethernaut-oso')
require('ethernaut-ai-ui')
require('ethernaut-optigov')

const OP_REMOTE_FILE =
  'https://github.com/raiseerco/ethernaut-app-kb/releases/download/daily/last-update.json'
const ZIP_URL_OPTIMISM =
  'https://github.com/raiseerco/ethernaut-app-kb/releases/download/daily/kb.zip'
const FILES_DIR = path.join(
  __dirname,
  '../../packages/ethernaut-ai/src/internal/assistants/docs/kb-files',
)

const OP_LOCAL_FILE = path.join(FILES_DIR, 'last-update.json')

async function downloadFile(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `Failed to download: ${response.status} ${response.statusText}`,
    )
  }
  return response.text()
}

let localHash = null

async function checkKB() {
  try {
    if (fs.existsSync(OP_LOCAL_FILE)) {
      try {
        const localOpFile = fs.readFileSync(OP_LOCAL_FILE, 'utf8')
        localHash = JSON.parse(localOpFile)
        const remoteOpFile = await downloadFile(OP_REMOTE_FILE)
        const remoteHash = JSON.parse(remoteOpFile)
        if (remoteHash.last_commit === localHash.last_commit) {
          // spinner.success('--- KB already up to date')
          return
        } else {
          // spinner.success('--- KB outdated, updating...')
          await downloadKB()
        }
      } catch (error) {
        console.error('Error reading local timestamp file:', error)
      }
    } else {
      // spinner.success('--- KB not found, downloading...')
      await downloadKB()
    }
  } catch (error) {
    console.log('Failed to check or download KB:', error)
  }
}

async function downloadKB() {
  try {
    if (fs.existsSync(FILES_DIR)) {
      // spinner.success(' Updating...')
    } else {
      fs.mkdirSync(FILES_DIR, { recursive: true })
    }

    const tempZipPath = path.join(__dirname, 'temp.zip')
    const response = await fetch(ZIP_URL_OPTIMISM)
    if (!response.ok) {
      throw new Error(
        `Failed to download ZIP: ${response.status} ${response.statusText}`,
      )
    }

    const buffer = await response.arrayBuffer()
    fs.writeFileSync(tempZipPath, Buffer.from(buffer))
    const zip = new AdmZip(tempZipPath)
    zip.extractAllTo(FILES_DIR, true)
    fs.unlinkSync(tempZipPath)

    try {
      const timestampData = await downloadFile(OP_REMOTE_FILE)
      const parsedData = JSON.parse(timestampData)
      fs.writeFileSync(OP_LOCAL_FILE, JSON.stringify(parsedData, null, 2))
    } catch (error) {
      console.error('Error downloading or parsing timestamp file:', error)
    }
  } catch (error) {
    console.log('Failed to check or download KB:', error)
  }
}

async function main() {
  const txt = figlet.textSync('ethernaut-cli', { font: 'Graffiti' })
  chalkAnimation.rainbow(txt).render()
  console.log(
    `v${pkg.version} - Warning!!! BETA version. Please report issues here ${pkg.bugs.url}`,
  )
  storage.init()
  await queryTelemetryConsent()
  await checkAutoUpdate(pkg)
  await checkKB()
}
main()

module.exports = {
  solidity: '0.8.19',
  defaultNetwork: 'localhost',
  ethernaut: {
    ui: {
      exclude: [
        'vars/*',
        'check',
        'compile',
        'clean',
        'flatten',
        'test',
        'navigate',
        'run',
        'node',
        'help',
        'console',
      ],
    },
  },
}
