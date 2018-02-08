const dummy = () => {
  return 1
}

const formatBlog = (blog) => {
  return {
    title: blog.title,
    author: blog.author,
    likes: blog.likes
  }
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => sum += item.likes
  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return {}
  const reducer = (current, item) => item.likes > current.likes ? item : current
  return formatBlog(blogs.reduce(reducer))
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return {}
  const blogsByAuthors = {}
  let mostPopular = ''
  let blogCount = 0
  blogs.forEach(blog => {
    blogsByAuthors[blog.author] ? blogsByAuthors[blog.author]++ : blogsByAuthors[blog.author] = 1
    if (blogsByAuthors[blog.author] > blogCount) {
      blogCount = blogsByAuthors[blog.author]
      mostPopular = blog.author
    }
  })
  return { author: mostPopular, blogs: blogsByAuthors[mostPopular] }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return {}
  const likesToAuthors = {}
  let mostVoted = ''
  let voteCount = 0
  blogs.forEach(blog => {
    likesToAuthors[blog.author] ? likesToAuthors[blog.author] += blog.likes : likesToAuthors[blog.author] = blog.likes
    if (likesToAuthors[blog.author] > voteCount) {
      voteCount = likesToAuthors[blog.author]
      mostVoted = blog.author
    }
  })
  return { author: mostVoted, blogs: likesToAuthors[mostVoted] }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}