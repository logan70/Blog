const fs = require('fs')
const ejs = require('ejs')

const { charset, tempFileName, filename } = require('./config')

module.exports = async function getReadmeStr(blogs) {
  const blogListContent = getBlogListContent(blogs)
  const templateStr = fs.readFileSync(tempFileName, charset)
  const readmeStr = ejs.render(templateStr, {
    blogListContent,
  })
  fs.writeFileSync(filename, readmeStr, charset)
}

const br = '\n\n--------\n\n'
function getBlogListContent(blogs, isSub) {
  if (!blogs || !blogs.length) return ''

  return blogs.map(({ series, list, subSeries }) => {
    const title = `${'#'.repeat(isSub ? 3 : 2)} ${series}\n\n`
    const blogDirectory = list.map(({ url, title, createTime }) => {
      return `- ${createTime} [${title}](${url})`
    }).join('\n')
    const subContent = getBlogListContent(subSeries, true)
    
    return title + blogDirectory + subContent
  }).join(isSub ? '\n\n' : br)
}
