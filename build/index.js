const getBlogsConfig = require('./config')
const { getBlogs, classifyBlogs } = require('./blog')
const generateReadme = require('./generateReadme')
const { gitPush } = require('./gitOperations')

main()
  .catch(err => console.error('Generate README.md error: ', err))

async function main() {
  console.log('Getting blogs...')
  const blogs = await getBlogs(getBlogsConfig)
  console.log('Get blogs successfully!')
  console.log(`Latest blog: 《${blogs[0].title}》`)

  console.log('Generating README.md...')
  const classifiedBlogs = classifyBlogs(blogs)
  await generateReadme(classifiedBlogs)
  console.log('Generate README.md successfully!')

  console.log('Git commit & push...')
  const latestBlog = blogs.sort((a, b) => b.timeStamp - a.timeStamp)[0]
  const commitMsg = `add: add blog <${latestBlog.title}>`
  gitPush(commitMsg)
  console.log('Git push successfully!')
}
