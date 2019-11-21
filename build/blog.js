const Octokit = require('@octokit/rest')
const octokit = new Octokit()
const { repoConfig, seriesOrder } = require('./config')

exports.octokit = new Octokit()

exports.getBlogs = function getBlogs() {
  return octokit.issues.listForRepo(repoConfig)
    .then(({ data: blogList }) => blogList.map(formatBlogInfo))
}

exports.classifyBlogs = function classifyBlogs(blogs) {
  return seriesOrder.map(({ series, subSeriesArr }) => {
    const seriesBlogs = getFilteredBlog(blogs, series)
    const subSeriesBlogs = subSeriesArr
      .map(subSeries => getFilteredBlog(blogs, series, subSeries),)
    return {
      ...seriesBlogs,
      subSeries: subSeriesBlogs,
    }
  })
}

function formatBlogInfo({
  html_url: url,
  title,
  number,
  created_at,
  labels: {
    0: {
      name,
    }
  },
}) {
  const [ series, subSeries ] = name.split('-').map(str => str.trim())
  return {
    series,
    url,
    title,
    subSeries,
    number,
    createTime: getDateString(created_at),
    timeStamp: new Date(created_at).getTime(),
  }
}

const addZero = (str, length = 2) => String(str).length >= length ? str : addZero('0' + str, length)
function getDateString(time) {
  const d = new Date(time)
  const year = d.getFullYear()
  const month = addZero(d.getMonth() + 1)
  const date = addZero(d.getDate())
  return `${year}/${month}/${date}`
}

function getFilteredBlog(blogs, series, subSeries) {
  const list = blogs
    .filter(blog => blog.series === series && blog.subSeries === subSeries)
    .sort((a, b) => b.number - a.number)
  return {
    series: subSeries || series,
    list,
  }
}
